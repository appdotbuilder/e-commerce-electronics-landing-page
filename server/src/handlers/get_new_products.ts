import { db } from '../db';
import { productsTable } from '../db/schema';
import { type Product } from '../schema';
import { eq, desc } from 'drizzle-orm';

export const getNewProducts = async (): Promise<Product[]> => {
  try {
    // Query for products marked as new, ordered by creation date (newest first)
    const results = await db.select()
      .from(productsTable)
      .where(eq(productsTable.is_new, true))
      .orderBy(desc(productsTable.created_at))
      .execute();

    // Convert numeric fields back to numbers before returning
    return results.map(product => ({
      ...product,
      price: parseFloat(product.price),
      original_price: product.original_price ? parseFloat(product.original_price) : null
    }));
  } catch (error) {
    console.error('Failed to fetch new products:', error);
    throw error;
  }
};