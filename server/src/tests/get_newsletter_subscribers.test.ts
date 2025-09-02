import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { newsletterSubscriptionsTable } from '../db/schema';
import { getNewsletterSubscribers } from '../handlers/get_newsletter_subscribers';

describe('getNewsletterSubscribers', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no subscribers exist', async () => {
    const result = await getNewsletterSubscribers();
    expect(result).toEqual([]);
  });

  it('should return only active subscribers', async () => {
    // Create test data with both active and inactive subscribers
    await db.insert(newsletterSubscriptionsTable).values([
      {
        email: 'active1@example.com',
        is_active: true
      },
      {
        email: 'inactive@example.com',
        is_active: false
      },
      {
        email: 'active2@example.com',
        is_active: true
      }
    ]).execute();

    const result = await getNewsletterSubscribers();

    // Should only return active subscribers
    expect(result).toHaveLength(2);
    expect(result.map(s => s.email)).toEqual(
      expect.arrayContaining(['active1@example.com', 'active2@example.com'])
    );
    expect(result.map(s => s.email)).not.toContain('inactive@example.com');
    
    // Verify all returned subscribers are active
    result.forEach(subscriber => {
      expect(subscriber.is_active).toBe(true);
    });
  });

  it('should order subscribers by subscription date (newest first)', async () => {
    // Create subscribers with specific dates
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);

    await db.insert(newsletterSubscriptionsTable).values([
      {
        email: 'oldest@example.com',
        is_active: true,
        subscribed_at: twoDaysAgo
      },
      {
        email: 'newest@example.com',
        is_active: true,
        subscribed_at: now
      },
      {
        email: 'middle@example.com',
        is_active: true,
        subscribed_at: yesterday
      }
    ]).execute();

    const result = await getNewsletterSubscribers();

    expect(result).toHaveLength(3);
    
    // Should be ordered by subscribed_at desc (newest first)
    expect(result[0].email).toBe('newest@example.com');
    expect(result[1].email).toBe('middle@example.com');
    expect(result[2].email).toBe('oldest@example.com');

    // Verify dates are in descending order
    expect(result[0].subscribed_at >= result[1].subscribed_at).toBe(true);
    expect(result[1].subscribed_at >= result[2].subscribed_at).toBe(true);
  });

  it('should return complete subscriber objects with all fields', async () => {
    await db.insert(newsletterSubscriptionsTable).values({
      email: 'complete@example.com',
      is_active: true
    }).execute();

    const result = await getNewsletterSubscribers();

    expect(result).toHaveLength(1);
    const subscriber = result[0];

    // Verify all required fields are present
    expect(subscriber.id).toBeDefined();
    expect(typeof subscriber.id).toBe('number');
    expect(subscriber.email).toBe('complete@example.com');
    expect(subscriber.is_active).toBe(true);
    expect(subscriber.subscribed_at).toBeInstanceOf(Date);
  });

  it('should handle large number of subscribers efficiently', async () => {
    // Create multiple subscribers to test performance and ordering
    const subscribers = Array.from({ length: 50 }, (_, i) => ({
      email: `subscriber${i}@example.com`,
      is_active: i % 3 !== 0, // Mix of active and inactive (roughly 2/3 active)
      subscribed_at: new Date(Date.now() - i * 1000 * 60) // Each one minute apart
    }));

    await db.insert(newsletterSubscriptionsTable).values(subscribers).execute();

    const result = await getNewsletterSubscribers();

    // Should return only active subscribers
    const expectedActiveCount = subscribers.filter(s => s.is_active).length;
    expect(result).toHaveLength(expectedActiveCount);

    // All returned subscribers should be active
    result.forEach(subscriber => {
      expect(subscriber.is_active).toBe(true);
    });

    // Should maintain descending order by subscription date
    for (let i = 0; i < result.length - 1; i++) {
      expect(result[i].subscribed_at >= result[i + 1].subscribed_at).toBe(true);
    }
  });
});