import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { testimonialsTable } from '../db/schema';
import { type CreateTestimonialInput } from '../schema';
import { createTestimonial } from '../handlers/create_testimonial';
import { eq } from 'drizzle-orm';

// Test input with all fields
const testInput: CreateTestimonialInput = {
  customer_name: 'John Doe',
  customer_avatar: 'https://example.com/avatar.jpg',
  rating: 5,
  review_text: 'Amazing product! Highly recommended.',
  product_id: 1,
  is_featured: true
};

describe('createTestimonial', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a testimonial with all fields', async () => {
    const result = await createTestimonial(testInput);

    // Basic field validation
    expect(result.customer_name).toEqual('John Doe');
    expect(result.customer_avatar).toEqual('https://example.com/avatar.jpg');
    expect(result.rating).toEqual(5);
    expect(result.review_text).toEqual('Amazing product! Highly recommended.');
    expect(result.product_id).toEqual(1);
    expect(result.is_featured).toEqual(true);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should create a testimonial with minimal fields', async () => {
    const minimalInput: CreateTestimonialInput = {
      customer_name: 'Jane Smith',
      customer_avatar: null,
      rating: 4,
      review_text: 'Good product overall.',
      product_id: null,
      is_featured: false
    };

    const result = await createTestimonial(minimalInput);

    expect(result.customer_name).toEqual('Jane Smith');
    expect(result.customer_avatar).toBeNull();
    expect(result.rating).toEqual(4);
    expect(result.review_text).toEqual('Good product overall.');
    expect(result.product_id).toBeNull();
    expect(result.is_featured).toEqual(false);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should apply default value for is_featured when not provided', async () => {
    const inputWithoutFeatured: CreateTestimonialInput = {
      customer_name: 'Bob Wilson',
      customer_avatar: null,
      rating: 3,
      review_text: 'Decent product.',
      product_id: null
      // is_featured is optional and not provided
    };

    const result = await createTestimonial(inputWithoutFeatured);

    expect(result.is_featured).toEqual(false); // Should default to false
    expect(result.customer_name).toEqual('Bob Wilson');
    expect(result.rating).toEqual(3);
  });

  it('should save testimonial to database', async () => {
    const result = await createTestimonial(testInput);

    // Query using proper drizzle syntax
    const testimonials = await db.select()
      .from(testimonialsTable)
      .where(eq(testimonialsTable.id, result.id))
      .execute();

    expect(testimonials).toHaveLength(1);
    expect(testimonials[0].customer_name).toEqual('John Doe');
    expect(testimonials[0].customer_avatar).toEqual('https://example.com/avatar.jpg');
    expect(testimonials[0].rating).toEqual(5);
    expect(testimonials[0].review_text).toEqual('Amazing product! Highly recommended.');
    expect(testimonials[0].product_id).toEqual(1);
    expect(testimonials[0].is_featured).toEqual(true);
    expect(testimonials[0].created_at).toBeInstanceOf(Date);
  });

  it('should handle different rating values correctly', async () => {
    const ratings = [1, 2, 3, 4, 5];
    
    for (const rating of ratings) {
      const input: CreateTestimonialInput = {
        customer_name: `Customer ${rating}`,
        customer_avatar: null,
        rating: rating,
        review_text: `${rating} star review`,
        product_id: null,
        is_featured: false
      };

      const result = await createTestimonial(input);
      expect(result.rating).toEqual(rating);
      expect(typeof result.rating).toEqual('number');
    }
  });

  it('should handle long review text', async () => {
    const longReview = 'A'.repeat(1000); // 1000 character review
    const input: CreateTestimonialInput = {
      customer_name: 'Verbose Customer',
      customer_avatar: null,
      rating: 5,
      review_text: longReview,
      product_id: null,
      is_featured: false
    };

    const result = await createTestimonial(input);
    
    expect(result.review_text).toEqual(longReview);
    expect(result.review_text.length).toEqual(1000);
  });

  it('should create multiple testimonials independently', async () => {
    const input1: CreateTestimonialInput = {
      customer_name: 'Customer One',
      customer_avatar: null,
      rating: 5,
      review_text: 'First review',
      product_id: null,
      is_featured: true
    };

    const input2: CreateTestimonialInput = {
      customer_name: 'Customer Two',
      customer_avatar: 'https://example.com/avatar2.jpg',
      rating: 4,
      review_text: 'Second review',
      product_id: 2,
      is_featured: false
    };

    const result1 = await createTestimonial(input1);
    const result2 = await createTestimonial(input2);

    // Verify both testimonials were created with different IDs
    expect(result1.id).not.toEqual(result2.id);
    expect(result1.customer_name).toEqual('Customer One');
    expect(result2.customer_name).toEqual('Customer Two');
    expect(result1.is_featured).toEqual(true);
    expect(result2.is_featured).toEqual(false);

    // Verify both exist in database
    const allTestimonials = await db.select().from(testimonialsTable).execute();
    expect(allTestimonials).toHaveLength(2);
  });
});