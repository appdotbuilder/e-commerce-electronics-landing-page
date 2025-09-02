import { db } from '../db';
import { productsTable } from '../db/schema';
import { type Product } from '../schema';
import { eq } from 'drizzle-orm';

export const getProductsByCategory = async (category: string): Promise<Product[]> => {
  try {
    // Query products filtered by category
    const results = await db.select()
      .from(productsTable)
      .where(eq(productsTable.category, category))
      .execute();

    // Convert numeric fields back to numbers before returning
    return results.map(product => ({
      ...product,
      price: parseFloat(product.price),
      original_price: product.original_price ? parseFloat(product.original_price) : null
    }));
  } catch (error) {
    console.error('Failed to fetch products by category:', error);
    throw error;
  }
};