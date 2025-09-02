import { db } from '../db';
import { productsTable, testimonialsTable, heroBannersTable, categoriesTable } from '../db/schema';
import { type Product, type Testimonial, type HeroBanner, type Category } from '../schema';
import { eq, desc } from 'drizzle-orm';

export interface LandingPageData {
  heroBanner: HeroBanner | null;
  featuredProducts: Product[];
  newProducts: Product[];
  categories: Category[];
  testimonials: Testimonial[];
}

export async function getLandingPageData(): Promise<LandingPageData> {
  try {
    // Execute all queries in parallel for optimal performance
    const [heroBannerResult, featuredProductsResult, newProductsResult, categoriesResult, testimonialsResult] = await Promise.all([
      // Get the first active hero banner
      db.select()
        .from(heroBannersTable)
        .where(eq(heroBannersTable.is_active, true))
        .orderBy(desc(heroBannersTable.created_at))
        .limit(1)
        .execute(),

      // Get featured products (limit 8 for grid display)
      db.select()
        .from(productsTable)
        .where(eq(productsTable.is_featured, true))
        .orderBy(desc(productsTable.created_at))
        .limit(8)
        .execute(),

      // Get new products (limit 4 for "New Arrivals" section)
      db.select()
        .from(productsTable)
        .where(eq(productsTable.is_new, true))
        .orderBy(desc(productsTable.created_at))
        .limit(4)
        .execute(),

      // Get all categories
      db.select()
        .from(categoriesTable)
        .orderBy(categoriesTable.name)
        .execute(),

      // Get featured testimonials (limit 6 for testimonial carousel)
      db.select()
        .from(testimonialsTable)
        .where(eq(testimonialsTable.is_featured, true))
        .orderBy(desc(testimonialsTable.created_at))
        .limit(6)
        .execute()
    ]);

    // Convert numeric fields for products
    const featuredProducts: Product[] = featuredProductsResult.map(product => ({
      ...product,
      price: parseFloat(product.price),
      original_price: product.original_price ? parseFloat(product.original_price) : null
    }));

    const newProducts: Product[] = newProductsResult.map(product => ({
      ...product,
      price: parseFloat(product.price),
      original_price: product.original_price ? parseFloat(product.original_price) : null
    }));

    return {
      heroBanner: heroBannerResult.length > 0 ? heroBannerResult[0] : null,
      featuredProducts,
      newProducts,
      categories: categoriesResult,
      testimonials: testimonialsResult
    };
  } catch (error) {
    console.error('Failed to fetch landing page data:', error);
    throw error;
  }
}