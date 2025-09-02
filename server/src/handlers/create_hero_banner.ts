import { db } from '../db';
import { heroBannersTable } from '../db/schema';
import { type CreateHeroBannerInput, type HeroBanner } from '../schema';

export const createHeroBanner = async (input: CreateHeroBannerInput): Promise<HeroBanner> => {
  try {
    // Insert hero banner record
    const result = await db.insert(heroBannersTable)
      .values({
        title: input.title,
        subtitle: input.subtitle,
        description: input.description,
        cta_text: input.cta_text,
        cta_link: input.cta_link,
        background_image: input.background_image,
        is_active: input.is_active ?? true // Use default if not provided
      })
      .returning()
      .execute();

    // Return the created hero banner
    const heroBanner = result[0];
    return heroBanner;
  } catch (error) {
    console.error('Hero banner creation failed:', error);
    throw error;
  }
};