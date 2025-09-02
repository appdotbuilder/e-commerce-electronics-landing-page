import { z } from 'zod';

// Product schema for featured electronics
export const productSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string(),
  price: z.number(),
  original_price: z.number().nullable(), // For showing discounts
  image_url: z.string(),
  category: z.string(),
  is_featured: z.boolean(),
  is_new: z.boolean(),
  stock_quantity: z.number().int(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type Product = z.infer<typeof productSchema>;

// Input schema for creating products
export const createProductInputSchema = z.object({
  name: z.string(),
  description: z.string(),
  price: z.number().positive(),
  original_price: z.number().positive().nullable(),
  image_url: z.string().url(),
  category: z.string(),
  is_featured: z.boolean().optional(),
  is_new: z.boolean().optional(),
  stock_quantity: z.number().int().nonnegative()
});

export type CreateProductInput = z.infer<typeof createProductInputSchema>;

// Input schema for updating products
export const updateProductInputSchema = z.object({
  id: z.number(),
  name: z.string().optional(),
  description: z.string().optional(),
  price: z.number().positive().optional(),
  original_price: z.number().positive().nullable().optional(),
  image_url: z.string().url().optional(),
  category: z.string().optional(),
  is_featured: z.boolean().optional(),
  is_new: z.boolean().optional(),
  stock_quantity: z.number().int().nonnegative().optional()
});

export type UpdateProductInput = z.infer<typeof updateProductInputSchema>;

// Testimonial schema for customer reviews
export const testimonialSchema = z.object({
  id: z.number(),
  customer_name: z.string(),
  customer_avatar: z.string().nullable(),
  rating: z.number().int().min(1).max(5),
  review_text: z.string(),
  product_id: z.number().nullable(), // Optional link to specific product
  is_featured: z.boolean(),
  created_at: z.coerce.date()
});

export type Testimonial = z.infer<typeof testimonialSchema>;

// Input schema for creating testimonials
export const createTestimonialInputSchema = z.object({
  customer_name: z.string(),
  customer_avatar: z.string().url().nullable(),
  rating: z.number().int().min(1).max(5),
  review_text: z.string(),
  product_id: z.number().nullable(),
  is_featured: z.boolean().optional()
});

export type CreateTestimonialInput = z.infer<typeof createTestimonialInputSchema>;

// Newsletter subscription schema
export const newsletterSubscriptionSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  subscribed_at: z.coerce.date(),
  is_active: z.boolean()
});

export type NewsletterSubscription = z.infer<typeof newsletterSubscriptionSchema>;

// Input schema for newsletter subscription
export const createNewsletterSubscriptionInputSchema = z.object({
  email: z.string().email()
});

export type CreateNewsletterSubscriptionInput = z.infer<typeof createNewsletterSubscriptionInputSchema>;

// Category schema for product organization
export const categorySchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  slug: z.string(),
  image_url: z.string().nullable(),
  created_at: z.coerce.date()
});

export type Category = z.infer<typeof categorySchema>;

// Input schema for creating categories
export const createCategoryInputSchema = z.object({
  name: z.string(),
  description: z.string().nullable(),
  slug: z.string(),
  image_url: z.string().url().nullable()
});

export type CreateCategoryInput = z.infer<typeof createCategoryInputSchema>;

// Hero banner schema for dynamic content
export const heroBannerSchema = z.object({
  id: z.number(),
  title: z.string(),
  subtitle: z.string(),
  description: z.string(),
  cta_text: z.string(),
  cta_link: z.string(),
  background_image: z.string(),
  is_active: z.boolean(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type HeroBanner = z.infer<typeof heroBannerSchema>;

// Input schema for creating hero banners
export const createHeroBannerInputSchema = z.object({
  title: z.string(),
  subtitle: z.string(),
  description: z.string(),
  cta_text: z.string(),
  cta_link: z.string(),
  background_image: z.string().url(),
  is_active: z.boolean().optional()
});

export type CreateHeroBannerInput = z.infer<typeof createHeroBannerInputSchema>;