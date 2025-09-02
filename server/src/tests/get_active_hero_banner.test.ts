import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { heroBannersTable } from '../db/schema';
import { getActiveHeroBanner } from '../handlers/get_active_hero_banner';
import { eq } from 'drizzle-orm';

// Test data for hero banners
const testBanner1 = {
  title: 'Summer Sale',
  subtitle: 'Up to 50% Off',
  description: 'Get the best deals on electronics this summer',
  cta_text: 'Shop Now',
  cta_link: '/products',
  background_image: 'https://example.com/banner1.jpg',
  is_active: true
};

const testBanner2 = {
  title: 'New Arrivals',
  subtitle: 'Latest Technology',
  description: 'Check out our newest electronic products',
  cta_text: 'Explore',
  cta_link: '/new-arrivals',
  background_image: 'https://example.com/banner2.jpg',
  is_active: true
};

const inactiveBanner = {
  title: 'Old Campaign',
  subtitle: 'Expired Offer',
  description: 'This campaign has ended',
  cta_text: 'Visit',
  cta_link: '/old-campaign',
  background_image: 'https://example.com/old-banner.jpg',
  is_active: false
};

describe('getActiveHeroBanner', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return null when no active banners exist', async () => {
    const result = await getActiveHeroBanner();
    expect(result).toBeNull();
  });

  it('should return null when only inactive banners exist', async () => {
    // Create only inactive banners
    await db.insert(heroBannersTable)
      .values([inactiveBanner])
      .execute();

    const result = await getActiveHeroBanner();
    expect(result).toBeNull();
  });

  it('should return an active banner', async () => {
    // Create an active banner
    await db.insert(heroBannersTable)
      .values([testBanner1])
      .execute();

    const result = await getActiveHeroBanner();

    expect(result).toBeDefined();
    expect(result!.title).toEqual('Summer Sale');
    expect(result!.subtitle).toEqual('Up to 50% Off');
    expect(result!.description).toEqual('Get the best deals on electronics this summer');
    expect(result!.cta_text).toEqual('Shop Now');
    expect(result!.cta_link).toEqual('/products');
    expect(result!.background_image).toEqual('https://example.com/banner1.jpg');
    expect(result!.is_active).toBe(true);
    expect(result!.id).toBeDefined();
    expect(result!.created_at).toBeInstanceOf(Date);
    expect(result!.updated_at).toBeInstanceOf(Date);
  });

  it('should return the most recently updated active banner', async () => {
    // Create first banner
    const [banner1] = await db.insert(heroBannersTable)
      .values([testBanner1])
      .returning()
      .execute();

    // Wait a moment to ensure different timestamps
    await new Promise(resolve => setTimeout(resolve, 10));

    // Create second banner (more recent)
    const [banner2] = await db.insert(heroBannersTable)
      .values([testBanner2])
      .returning()
      .execute();

    const result = await getActiveHeroBanner();

    expect(result).toBeDefined();
    expect(result!.title).toEqual('New Arrivals');
    expect(result!.id).toEqual(banner2.id);
    expect(result!.updated_at >= banner1.updated_at).toBe(true);
  });

  it('should ignore inactive banners and return only active ones', async () => {
    // Create both active and inactive banners
    await db.insert(heroBannersTable)
      .values([inactiveBanner, testBanner1])
      .execute();

    const result = await getActiveHeroBanner();

    expect(result).toBeDefined();
    expect(result!.title).toEqual('Summer Sale');
    expect(result!.is_active).toBe(true);
  });

  it('should update banner and return the newly updated one', async () => {
    // Create two active banners
    const [banner1] = await db.insert(heroBannersTable)
      .values([testBanner1])
      .returning()
      .execute();

    const [banner2] = await db.insert(heroBannersTable)
      .values([testBanner2])
      .returning()
      .execute();

    // Wait a moment
    await new Promise(resolve => setTimeout(resolve, 10));

    // Update the first banner (making it more recent)
    await db.update(heroBannersTable)
      .set({ 
        title: 'Updated Summer Sale',
        updated_at: new Date()
      })
      .where(eq(heroBannersTable.id, banner1.id))
      .execute();

    const result = await getActiveHeroBanner();

    expect(result).toBeDefined();
    expect(result!.title).toEqual('Updated Summer Sale');
    expect(result!.id).toEqual(banner1.id);
  });

  it('should verify banner is saved to database correctly', async () => {
    const [insertedBanner] = await db.insert(heroBannersTable)
      .values([testBanner1])
      .returning()
      .execute();

    const result = await getActiveHeroBanner();

    // Verify the handler returns the same data as what's in the database
    expect(result!.id).toEqual(insertedBanner.id);
    expect(result!.title).toEqual(insertedBanner.title);
    expect(result!.subtitle).toEqual(insertedBanner.subtitle);
    expect(result!.description).toEqual(insertedBanner.description);
    expect(result!.cta_text).toEqual(insertedBanner.cta_text);
    expect(result!.cta_link).toEqual(insertedBanner.cta_link);
    expect(result!.background_image).toEqual(insertedBanner.background_image);
    expect(result!.is_active).toEqual(insertedBanner.is_active);
    expect(result!.created_at).toEqual(insertedBanner.created_at);
    expect(result!.updated_at).toEqual(insertedBanner.updated_at);
  });
});