import { db } from '../db';
import { testimonialsTable } from '../db/schema';
import { type Testimonial } from '../schema';
import { eq, desc } from 'drizzle-orm';

export const getFeaturedTestimonials = async (): Promise<Testimonial[]> => {
  try {
    // Query featured testimonials ordered by rating desc, then created_at desc
    const results = await db.select()
      .from(testimonialsTable)
      .where(eq(testimonialsTable.is_featured, true))
      .orderBy(desc(testimonialsTable.rating), desc(testimonialsTable.created_at))
      .execute();

    // Return results (no numeric conversions needed for testimonials)
    return results;
  } catch (error) {
    console.error('Featured testimonials fetch failed:', error);
    throw error;
  }
};