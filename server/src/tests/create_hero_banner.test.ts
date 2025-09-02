import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { heroBannersTable } from '../db/schema';
import { type CreateHeroBannerInput } from '../schema';
import { createHeroBanner } from '../handlers/create_hero_banner';
import { eq } from 'drizzle-orm';

// Complete test input with all required fields
const testInput: CreateHeroBannerInput = {
  title: 'Summer Electronics Sale',
  subtitle: 'Up to 50% Off',
  description: 'Discover the latest smartphones, laptops, and accessories at unbeatable prices.',
  cta_text: 'Shop Now',
  cta_link: 'https://example.com/shop',
  background_image: 'https://example.com/summer-banner.jpg',
  is_active: true
};

describe('createHeroBanner', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a hero banner with all fields', async () => {
    const result = await createHeroBanner(testInput);

    // Basic field validation
    expect(result.title).toEqual('Summer Electronics Sale');
    expect(result.subtitle).toEqual('Up to 50% Off');
    expect(result.description).toEqual(testInput.description);
    expect(result.cta_text).toEqual('Shop Now');
    expect(result.cta_link).toEqual('https://example.com/shop');
    expect(result.background_image).toEqual('https://example.com/summer-banner.jpg');
    expect(result.is_active).toBe(true);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save hero banner to database', async () => {
    const result = await createHeroBanner(testInput);

    // Query using proper drizzle syntax
    const heroBanners = await db.select()
      .from(heroBannersTable)
      .where(eq(heroBannersTable.id, result.id))
      .execute();

    expect(heroBanners).toHaveLength(1);
    expect(heroBanners[0].title).toEqual('Summer Electronics Sale');
    expect(heroBanners[0].subtitle).toEqual('Up to 50% Off');
    expect(heroBanners[0].description).toEqual(testInput.description);
    expect(heroBanners[0].cta_text).toEqual('Shop Now');
    expect(heroBanners[0].cta_link).toEqual('https://example.com/shop');
    expect(heroBanners[0].background_image).toEqual('https://example.com/summer-banner.jpg');
    expect(heroBanners[0].is_active).toBe(true);
    expect(heroBanners[0].created_at).toBeInstanceOf(Date);
    expect(heroBanners[0].updated_at).toBeInstanceOf(Date);
  });

  it('should default is_active to true when not provided', async () => {
    const inputWithoutIsActive = {
      title: 'Black Friday Sale',
      subtitle: 'Massive Discounts',
      description: 'Limited time offers on all electronics.',
      cta_text: 'Browse Deals',
      cta_link: 'https://example.com/deals',
      background_image: 'https://example.com/black-friday.jpg'
    };

    const result = await createHeroBanner(inputWithoutIsActive);

    expect(result.is_active).toBe(true);

    // Verify in database
    const heroBanners = await db.select()
      .from(heroBannersTable)
      .where(eq(heroBannersTable.id, result.id))
      .execute();

    expect(heroBanners[0].is_active).toBe(true);
  });

  it('should handle is_active set to false', async () => {
    const inactiveInput: CreateHeroBannerInput = {
      ...testInput,
      title: 'Inactive Banner',
      is_active: false
    };

    const result = await createHeroBanner(inactiveInput);

    expect(result.is_active).toBe(false);

    // Verify in database
    const heroBanners = await db.select()
      .from(heroBannersTable)
      .where(eq(heroBannersTable.id, result.id))
      .execute();

    expect(heroBanners[0].is_active).toBe(false);
  });

  it('should create multiple hero banners with unique IDs', async () => {
    const firstBanner = await createHeroBanner({
      ...testInput,
      title: 'First Banner'
    });

    const secondBanner = await createHeroBanner({
      ...testInput,
      title: 'Second Banner'
    });

    // Verify different IDs
    expect(firstBanner.id).not.toEqual(secondBanner.id);
    expect(firstBanner.title).toEqual('First Banner');
    expect(secondBanner.title).toEqual('Second Banner');

    // Verify both exist in database
    const allBanners = await db.select()
      .from(heroBannersTable)
      .execute();

    expect(allBanners).toHaveLength(2);
  });

  it('should handle long content correctly', async () => {
    const longContentInput: CreateHeroBannerInput = {
      title: 'Electronics Mega Sale with Extended Title for Testing Long Content Handling',
      subtitle: 'Extended subtitle with additional promotional text and special characters & symbols',
      description: 'This is a very long description that includes multiple sentences and various punctuation marks. It describes the electronics sale in great detail, mentioning specific product categories like smartphones, tablets, laptops, gaming accessories, and home electronics. The description also includes promotional language and special offers that customers might find appealing.',
      cta_text: 'Explore All Categories',
      cta_link: 'https://example.com/categories/all-electronics',
      background_image: 'https://example.com/very-long-filename-for-testing-url-length.jpg',
      is_active: true
    };

    const result = await createHeroBanner(longContentInput);

    expect(result.title).toEqual(longContentInput.title);
    expect(result.subtitle).toEqual(longContentInput.subtitle);
    expect(result.description).toEqual(longContentInput.description);
    expect(result.cta_text).toEqual(longContentInput.cta_text);
    expect(result.cta_link).toEqual(longContentInput.cta_link);
    expect(result.background_image).toEqual(longContentInput.background_image);
  });
});