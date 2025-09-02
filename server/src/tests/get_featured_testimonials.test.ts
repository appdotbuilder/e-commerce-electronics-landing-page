import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { testimonialsTable } from '../db/schema';
import { type CreateTestimonialInput } from '../schema';
import { getFeaturedTestimonials } from '../handlers/get_featured_testimonials';

// Test testimonials data
const testTestimonials: CreateTestimonialInput[] = [
  {
    customer_name: 'John Doe',
    customer_avatar: 'https://example.com/avatar1.jpg',
    rating: 5,
    review_text: 'Excellent product! Highly recommend.',
    product_id: null,
    is_featured: true
  },
  {
    customer_name: 'Jane Smith',
    customer_avatar: 'https://example.com/avatar2.jpg',
    rating: 4,
    review_text: 'Great quality and fast shipping.',
    product_id: 1,
    is_featured: true
  },
  {
    customer_name: 'Bob Wilson',
    customer_avatar: null,
    rating: 5,
    review_text: 'Outstanding customer service!',
    product_id: null,
    is_featured: false // Not featured - should not be returned
  },
  {
    customer_name: 'Alice Brown',
    customer_avatar: 'https://example.com/avatar3.jpg',
    rating: 3,
    review_text: 'Good product overall.',
    product_id: 2,
    is_featured: true
  }
];

describe('getFeaturedTestimonials', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return only featured testimonials', async () => {
    // Insert test testimonials
    await db.insert(testimonialsTable)
      .values(testTestimonials)
      .execute();

    const result = await getFeaturedTestimonials();

    // Should return only featured testimonials (3 out of 4)
    expect(result).toHaveLength(3);
    
    // All results should be featured
    result.forEach(testimonial => {
      expect(testimonial.is_featured).toBe(true);
    });

    // Should not include non-featured testimonial
    const nonFeaturedNames = result.map(t => t.customer_name);
    expect(nonFeaturedNames).not.toContain('Bob Wilson');
  });

  it('should order testimonials by rating desc, then created_at desc', async () => {
    // Insert test testimonials
    await db.insert(testimonialsTable)
      .values(testTestimonials)
      .execute();

    const result = await getFeaturedTestimonials();

    expect(result).toHaveLength(3);

    // First testimonial should have highest rating (5)
    expect(result[0].rating).toBe(5);
    expect(result[0].customer_name).toBe('John Doe');

    // Second testimonial should also have rating 5 but created later
    // (In this case, we can't guarantee order between same ratings without explicit timestamps)
    expect(result[1].rating).toBe(4);
    expect(result[1].customer_name).toBe('Jane Smith');

    // Third testimonial should have lowest rating (3)
    expect(result[2].rating).toBe(3);
    expect(result[2].customer_name).toBe('Alice Brown');
  });

  it('should return correct testimonial structure', async () => {
    // Insert single testimonial
    await db.insert(testimonialsTable)
      .values([testTestimonials[0]])
      .execute();

    const result = await getFeaturedTestimonials();

    expect(result).toHaveLength(1);
    const testimonial = result[0];

    // Verify all required fields are present
    expect(testimonial.id).toBeDefined();
    expect(testimonial.customer_name).toBe('John Doe');
    expect(testimonial.customer_avatar).toBe('https://example.com/avatar1.jpg');
    expect(testimonial.rating).toBe(5);
    expect(testimonial.review_text).toBe('Excellent product! Highly recommend.');
    expect(testimonial.product_id).toBeNull();
    expect(testimonial.is_featured).toBe(true);
    expect(testimonial.created_at).toBeInstanceOf(Date);
  });

  it('should handle null avatar correctly', async () => {
    // Insert testimonial with null avatar
    const testimonialWithNullAvatar: CreateTestimonialInput = {
      customer_name: 'Test User',
      customer_avatar: null,
      rating: 4,
      review_text: 'Good service',
      product_id: null,
      is_featured: true
    };

    await db.insert(testimonialsTable)
      .values([testimonialWithNullAvatar])
      .execute();

    const result = await getFeaturedTestimonials();

    expect(result).toHaveLength(1);
    expect(result[0].customer_avatar).toBeNull();
    expect(result[0].customer_name).toBe('Test User');
  });

  it('should return empty array when no featured testimonials exist', async () => {
    // Insert only non-featured testimonials
    const nonFeaturedTestimonial: CreateTestimonialInput = {
      customer_name: 'Regular User',
      customer_avatar: null,
      rating: 4,
      review_text: 'Not featured review',
      product_id: null,
      is_featured: false
    };

    await db.insert(testimonialsTable)
      .values([nonFeaturedTestimonial])
      .execute();

    const result = await getFeaturedTestimonials();

    expect(result).toHaveLength(0);
    expect(Array.isArray(result)).toBe(true);
  });

  it('should handle mixed product_id values correctly', async () => {
    // Insert testimonials with different product_id values
    await db.insert(testimonialsTable)
      .values(testTestimonials.filter(t => t.is_featured))
      .execute();

    const result = await getFeaturedTestimonials();

    expect(result).toHaveLength(3);

    // Check that product_id values are preserved correctly
    const testimonialWithNullProductId = result.find(t => t.customer_name === 'John Doe');
    expect(testimonialWithNullProductId?.product_id).toBeNull();

    const testimonialWithProductId = result.find(t => t.customer_name === 'Jane Smith');
    expect(testimonialWithProductId?.product_id).toBe(1);
  });
});