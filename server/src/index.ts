import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';
import { z } from 'zod';

// Import schemas
import {
  createProductInputSchema,
  updateProductInputSchema,
  createTestimonialInputSchema,
  createNewsletterSubscriptionInputSchema,
  createCategoryInputSchema,
  createHeroBannerInputSchema
} from './schema';

// Import handlers
import { getFeaturedProducts } from './handlers/get_featured_products';
import { getNewProducts } from './handlers/get_new_products';
import { getProductsByCategory } from './handlers/get_products_by_category';
import { createProduct } from './handlers/create_product';
import { getFeaturedTestimonials } from './handlers/get_featured_testimonials';
import { createTestimonial } from './handlers/create_testimonial';
import { createNewsletterSubscription } from './handlers/create_newsletter_subscription';
import { getNewsletterSubscribers } from './handlers/get_newsletter_subscribers';
import { getCategories } from './handlers/get_categories';
import { createCategory } from './handlers/create_category';
import { getActiveHeroBanner } from './handlers/get_active_hero_banner';
import { createHeroBanner } from './handlers/create_hero_banner';
import { getLandingPageData } from './handlers/get_landing_page_data';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  // Health check
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),

  // Landing page data - optimized single request for all landing page content
  getLandingPageData: publicProcedure
    .query(() => getLandingPageData()),

  // Product routes
  getFeaturedProducts: publicProcedure
    .query(() => getFeaturedProducts()),

  getNewProducts: publicProcedure
    .query(() => getNewProducts()),

  getProductsByCategory: publicProcedure
    .input(z.object({ category: z.string() }))
    .query(({ input }) => getProductsByCategory(input.category)),

  createProduct: publicProcedure
    .input(createProductInputSchema)
    .mutation(({ input }) => createProduct(input)),

  // Testimonial routes
  getFeaturedTestimonials: publicProcedure
    .query(() => getFeaturedTestimonials()),

  createTestimonial: publicProcedure
    .input(createTestimonialInputSchema)
    .mutation(({ input }) => createTestimonial(input)),

  // Newsletter routes
  createNewsletterSubscription: publicProcedure
    .input(createNewsletterSubscriptionInputSchema)
    .mutation(({ input }) => createNewsletterSubscription(input)),

  getNewsletterSubscribers: publicProcedure
    .query(() => getNewsletterSubscribers()),

  // Category routes
  getCategories: publicProcedure
    .query(() => getCategories()),

  createCategory: publicProcedure
    .input(createCategoryInputSchema)
    .mutation(({ input }) => createCategory(input)),

  // Hero banner routes
  getActiveHeroBanner: publicProcedure
    .query(() => getActiveHeroBanner()),

  createHeroBanner: publicProcedure
    .input(createHeroBannerInputSchema)
    .mutation(({ input }) => createHeroBanner(input)),
});

export type AppRouter = typeof appRouter;

async function start() {
  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors()(req, res, next);
    },
    router: appRouter,
    createContext() {
      return {};
    },
  });
  server.listen(port);
  console.log(`TRPC server listening at port: ${port}`);
}

start();