import { db } from '../db';
import { newsletterSubscriptionsTable } from '../db/schema';
import { type CreateNewsletterSubscriptionInput, type NewsletterSubscription } from '../schema';
import { eq } from 'drizzle-orm';

export const createNewsletterSubscription = async (input: CreateNewsletterSubscriptionInput): Promise<NewsletterSubscription> => {
  try {
    // Check if email already exists
    const existingSubscription = await db.select()
      .from(newsletterSubscriptionsTable)
      .where(eq(newsletterSubscriptionsTable.email, input.email))
      .execute();

    // If email exists and is active, throw error
    if (existingSubscription.length > 0) {
      const subscription = existingSubscription[0];
      if (subscription.is_active) {
        throw new Error('Email is already subscribed to newsletter');
      }
      
      // If email exists but is inactive, reactivate it
      const reactivatedResult = await db.update(newsletterSubscriptionsTable)
        .set({ 
          is_active: true,
          subscribed_at: new Date() // Update subscription date
        })
        .where(eq(newsletterSubscriptionsTable.id, subscription.id))
        .returning()
        .execute();

      return reactivatedResult[0];
    }

    // Insert new subscription record
    const result = await db.insert(newsletterSubscriptionsTable)
      .values({
        email: input.email,
        is_active: true // Default value, but being explicit
      })
      .returning()
      .execute();

    return result[0];
  } catch (error) {
    console.error('Newsletter subscription creation failed:', error);
    throw error;
  }
};