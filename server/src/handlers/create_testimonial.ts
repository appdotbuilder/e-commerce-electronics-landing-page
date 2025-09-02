import { db } from '../db';
import { testimonialsTable } from '../db/schema';
import { type CreateTestimonialInput, type Testimonial } from '../schema';

export const createTestimonial = async (input: CreateTestimonialInput): Promise<Testimonial> => {
  try {
    // Insert testimonial record
    const result = await db.insert(testimonialsTable)
      .values({
        customer_name: input.customer_name,
        customer_avatar: input.customer_avatar,
        rating: input.rating,
        review_text: input.review_text,
        product_id: input.product_id,
        is_featured: input.is_featured || false
      })
      .returning()
      .execute();

    // Return the created testimonial
    return result[0];
  } catch (error) {
    console.error('Testimonial creation failed:', error);
    throw error;
  }
};