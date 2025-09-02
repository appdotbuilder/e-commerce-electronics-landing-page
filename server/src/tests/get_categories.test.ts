import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { categoriesTable } from '../db/schema';
import { getCategories } from '../handlers/get_categories';
import { type CreateCategoryInput } from '../schema';

// Test categories data
const testCategories: CreateCategoryInput[] = [
  {
    name: 'Smartphones',
    description: 'Latest mobile phones and accessories',
    slug: 'smartphones',
    image_url: 'https://example.com/smartphones.jpg'
  },
  {
    name: 'Laptops',
    description: 'Professional and gaming laptops',
    slug: 'laptops',
    image_url: 'https://example.com/laptops.jpg'
  },
  {
    name: 'Audio',
    description: 'Headphones, speakers and audio equipment',
    slug: 'audio',
    image_url: null
  }
];

describe('getCategories', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no categories exist', async () => {
    const result = await getCategories();
    
    expect(result).toEqual([]);
  });

  it('should return all categories', async () => {
    // Insert test categories
    await db.insert(categoriesTable)
      .values(testCategories)
      .execute();

    const result = await getCategories();

    expect(result).toHaveLength(3);
    expect(result[0].name).toBeDefined();
    expect(result[0].description).toBeDefined();
    expect(result[0].slug).toBeDefined();
    expect(result[0].id).toBeDefined();
    expect(result[0].created_at).toBeInstanceOf(Date);
  });

  it('should return categories ordered by name alphabetically', async () => {
    // Insert test categories
    await db.insert(categoriesTable)
      .values(testCategories)
      .execute();

    const result = await getCategories();

    // Should be ordered: Audio, Laptops, Smartphones
    expect(result[0].name).toEqual('Audio');
    expect(result[1].name).toEqual('Laptops');
    expect(result[2].name).toEqual('Smartphones');
  });

  it('should handle categories with nullable fields correctly', async () => {
    // Insert categories with some null values
    await db.insert(categoriesTable)
      .values([
        {
          name: 'Gaming',
          description: null,
          slug: 'gaming',
          image_url: null
        },
        {
          name: 'Tablets',
          description: 'iPads and Android tablets',
          slug: 'tablets',
          image_url: 'https://example.com/tablets.jpg'
        }
      ])
      .execute();

    const result = await getCategories();

    expect(result).toHaveLength(2);
    
    // Find the gaming category
    const gamingCategory = result.find(cat => cat.name === 'Gaming');
    expect(gamingCategory).toBeDefined();
    expect(gamingCategory!.description).toBeNull();
    expect(gamingCategory!.image_url).toBeNull();
    expect(gamingCategory!.slug).toEqual('gaming');
    expect(gamingCategory!.created_at).toBeInstanceOf(Date);

    // Find the tablets category
    const tabletsCategory = result.find(cat => cat.name === 'Tablets');
    expect(tabletsCategory).toBeDefined();
    expect(tabletsCategory!.description).toEqual('iPads and Android tablets');
    expect(tabletsCategory!.image_url).toEqual('https://example.com/tablets.jpg');
    expect(tabletsCategory!.slug).toEqual('tablets');
  });

  it('should include all required category fields', async () => {
    // Insert a single test category
    await db.insert(categoriesTable)
      .values(testCategories[0])
      .execute();

    const result = await getCategories();

    expect(result).toHaveLength(1);
    const category = result[0];

    // Verify all fields are present
    expect(category.id).toBeDefined();
    expect(typeof category.id).toBe('number');
    expect(category.name).toEqual('Smartphones');
    expect(category.description).toEqual('Latest mobile phones and accessories');
    expect(category.slug).toEqual('smartphones');
    expect(category.image_url).toEqual('https://example.com/smartphones.jpg');
    expect(category.created_at).toBeInstanceOf(Date);
  });

  it('should maintain consistent ordering across multiple calls', async () => {
    // Insert categories in random order
    await db.insert(categoriesTable)
      .values([
        { name: 'Zebra', description: 'Last alphabetically', slug: 'zebra', image_url: null },
        { name: 'Alpha', description: 'First alphabetically', slug: 'alpha', image_url: null },
        { name: 'Beta', description: 'Middle alphabetically', slug: 'beta', image_url: null }
      ])
      .execute();

    const result1 = await getCategories();
    const result2 = await getCategories();

    // Both calls should return the same order
    expect(result1.map(c => c.name)).toEqual(['Alpha', 'Beta', 'Zebra']);
    expect(result2.map(c => c.name)).toEqual(['Alpha', 'Beta', 'Zebra']);
    expect(result1).toEqual(result2);
  });
});