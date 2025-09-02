import { db } from '../db';
import { categoriesTable } from '../db/schema';
import { type Category } from '../schema';
import { asc } from 'drizzle-orm';

export const getCategories = async (): Promise<Category[]> => {
  try {
    // Fetch all categories ordered by name for consistent display
    const results = await db.select()
      .from(categoriesTable)
      .orderBy(asc(categoriesTable.name))
      .execute();

    // Return categories with proper date conversion
    return results.map(category => ({
      ...category,
      created_at: new Date(category.created_at)
    }));
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    throw error;
  }
};