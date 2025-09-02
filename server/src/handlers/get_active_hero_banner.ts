import { db } from '../db';
import { heroBannersTable } from '../db/schema';
import { eq, desc } from 'drizzle-orm';
import { type HeroBanner } from '../schema';

export const getActiveHeroBanner = async (): Promise<HeroBanner | null> => {
  try {
    const result = await db.select()
      .from(heroBannersTable)
      .where(eq(heroBannersTable.is_active, true))
      .orderBy(desc(heroBannersTable.updated_at))
      .limit(1)
      .execute();

    if (result.length === 0) {
      return null;
    }

    const banner = result[0];
    return {
      ...banner,
      // No numeric conversions needed - all fields are text, boolean, or timestamp
    };
  } catch (error) {
    console.error('Failed to get active hero banner:', error);
    throw error;
  }
};