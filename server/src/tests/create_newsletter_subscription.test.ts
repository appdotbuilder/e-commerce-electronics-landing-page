import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { newsletterSubscriptionsTable } from '../db/schema';
import { type CreateNewsletterSubscriptionInput } from '../schema';
import { createNewsletterSubscription } from '../handlers/create_newsletter_subscription';
import { eq } from 'drizzle-orm';

// Simple test input
const testInput: CreateNewsletterSubscriptionInput = {
  email: 'test@example.com'
};

describe('createNewsletterSubscription', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a newsletter subscription', async () => {
    const result = await createNewsletterSubscription(testInput);

    // Basic field validation
    expect(result.email).toEqual('test@example.com');
    expect(result.is_active).toBe(true);
    expect(result.id).toBeDefined();
    expect(result.subscribed_at).toBeInstanceOf(Date);
  });

  it('should save subscription to database', async () => {
    const result = await createNewsletterSubscription(testInput);

    // Query using proper drizzle syntax
    const subscriptions = await db.select()
      .from(newsletterSubscriptionsTable)
      .where(eq(newsletterSubscriptionsTable.id, result.id))
      .execute();

    expect(subscriptions).toHaveLength(1);
    expect(subscriptions[0].email).toEqual('test@example.com');
    expect(subscriptions[0].is_active).toBe(true);
    expect(subscriptions[0].subscribed_at).toBeInstanceOf(Date);
  });

  it('should throw error for duplicate active email', async () => {
    // Create first subscription
    await createNewsletterSubscription(testInput);

    // Attempt to create duplicate should fail
    await expect(createNewsletterSubscription(testInput))
      .rejects.toThrow(/email is already subscribed/i);
  });

  it('should reactivate inactive subscription', async () => {
    // Create initial subscription
    const firstResult = await createNewsletterSubscription(testInput);

    // Manually deactivate the subscription
    await db.update(newsletterSubscriptionsTable)
      .set({ is_active: false })
      .where(eq(newsletterSubscriptionsTable.id, firstResult.id))
      .execute();

    // Subscribe again with same email
    const reactivatedResult = await createNewsletterSubscription(testInput);

    // Should reactivate existing subscription, not create new one
    expect(reactivatedResult.id).toEqual(firstResult.id);
    expect(reactivatedResult.is_active).toBe(true);
    expect(reactivatedResult.email).toEqual('test@example.com');
    expect(reactivatedResult.subscribed_at).toBeInstanceOf(Date);
    
    // Verify only one record exists in database
    const allSubscriptions = await db.select()
      .from(newsletterSubscriptionsTable)
      .where(eq(newsletterSubscriptionsTable.email, testInput.email))
      .execute();

    expect(allSubscriptions).toHaveLength(1);
    expect(allSubscriptions[0].is_active).toBe(true);
  });

  it('should handle email uniqueness constraint', async () => {
    const input1: CreateNewsletterSubscriptionInput = { email: 'unique1@example.com' };
    const input2: CreateNewsletterSubscriptionInput = { email: 'unique2@example.com' };

    // Create two different subscriptions
    const result1 = await createNewsletterSubscription(input1);
    const result2 = await createNewsletterSubscription(input2);

    // Should have different IDs
    expect(result1.id).not.toEqual(result2.id);
    expect(result1.email).toEqual('unique1@example.com');
    expect(result2.email).toEqual('unique2@example.com');

    // Both should be active
    expect(result1.is_active).toBe(true);
    expect(result2.is_active).toBe(true);
  });

  it('should update subscription date when reactivating', async () => {
    // Create initial subscription
    const firstResult = await createNewsletterSubscription(testInput);
    const originalDate = firstResult.subscribed_at;

    // Wait a small amount to ensure time difference
    await new Promise(resolve => setTimeout(resolve, 10));

    // Deactivate subscription
    await db.update(newsletterSubscriptionsTable)
      .set({ is_active: false })
      .where(eq(newsletterSubscriptionsTable.id, firstResult.id))
      .execute();

    // Reactivate subscription
    const reactivatedResult = await createNewsletterSubscription(testInput);

    // Subscription date should be updated
    expect(reactivatedResult.subscribed_at.getTime()).toBeGreaterThan(originalDate.getTime());
    expect(reactivatedResult.is_active).toBe(true);
    expect(reactivatedResult.id).toEqual(firstResult.id);
  });
});