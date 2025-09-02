import { db } from '../db';
import { newsletterSubscriptionsTable } from '../db/schema';
import { type NewsletterSubscription } from '../schema';
import { eq, desc } from 'drizzle-orm';

export const getNewsletterSubscribers = async (): Promise<NewsletterSubscription[]> => {
  try {
    // Fetch all active newsletter subscribers ordered by subscription date (newest first)
    const results = await db.select()
      .from(newsletterSubscriptionsTable)
      .where(eq(newsletterSubscriptionsTable.is_active, true))
      .orderBy(desc(newsletterSubscriptionsTable.subscribed_at))
      .execute();

    return results;
  } catch (error) {
    console.error('Failed to fetch newsletter subscribers:', error);
    throw error;
  }
};