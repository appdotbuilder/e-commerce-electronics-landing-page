import { serial, text, pgTable, timestamp, numeric, integer, boolean, varchar } from 'drizzle-orm/pg-core';

// Products table for electronics inventory
export const productsTable = pgTable('products', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  original_price: numeric('original_price', { precision: 10, scale: 2 }), // Nullable for discounts
  image_url: text('image_url').notNull(),
  category: text('category').notNull(),
  is_featured: boolean('is_featured').default(false).notNull(),
  is_new: boolean('is_new').default(false).notNull(),
  stock_quantity: integer('stock_quantity').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

// Testimonials table for customer reviews
export const testimonialsTable = pgTable('testimonials', {
  id: serial('id').primaryKey(),
  customer_name: text('customer_name').notNull(),
  customer_avatar: text('customer_avatar'), // Nullable avatar URL
  rating: integer('rating').notNull(), // 1-5 star rating
  review_text: text('review_text').notNull(),
  product_id: integer('product_id'), // Nullable reference to products
  is_featured: boolean('is_featured').default(false).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull()
});

// Newsletter subscriptions table
export const newsletterSubscriptionsTable = pgTable('newsletter_subscriptions', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  subscribed_at: timestamp('subscribed_at').defaultNow().notNull(),
  is_active: boolean('is_active').default(true).notNull()
});

// Categories table for product organization
export const categoriesTable = pgTable('categories', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'), // Nullable description
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  image_url: text('image_url'), // Nullable category image
  created_at: timestamp('created_at').defaultNow().notNull()
});

// Hero banners table for dynamic landing page content
export const heroBannersTable = pgTable('hero_banners', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  subtitle: text('subtitle').notNull(),
  description: text('description').notNull(),
  cta_text: text('cta_text').notNull(), // Call-to-action button text
  cta_link: text('cta_link').notNull(), // Call-to-action button link
  background_image: text('background_image').notNull(),
  is_active: boolean('is_active').default(true).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

// TypeScript types for table schemas
export type Product = typeof productsTable.$inferSelect;
export type NewProduct = typeof productsTable.$inferInsert;

export type Testimonial = typeof testimonialsTable.$inferSelect;
export type NewTestimonial = typeof testimonialsTable.$inferInsert;

export type NewsletterSubscription = typeof newsletterSubscriptionsTable.$inferSelect;
export type NewNewsletterSubscription = typeof newsletterSubscriptionsTable.$inferInsert;

export type Category = typeof categoriesTable.$inferSelect;
export type NewCategory = typeof categoriesTable.$inferInsert;

export type HeroBanner = typeof heroBannersTable.$inferSelect;
export type NewHeroBanner = typeof heroBannersTable.$inferInsert;

// Export all tables for relation queries
export const tables = {
  products: productsTable,
  testimonials: testimonialsTable,
  newsletterSubscriptions: newsletterSubscriptionsTable,
  categories: categoriesTable,
  heroBanners: heroBannersTable
};