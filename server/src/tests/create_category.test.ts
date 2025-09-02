import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { categoriesTable } from '../db/schema';
import { type CreateCategoryInput } from '../schema';
import { createCategory } from '../handlers/create_category';
import { eq } from 'drizzle-orm';

// Simple test input
const testInput: CreateCategoryInput = {
  name: 'Smartphones',
  description: 'Latest mobile devices and accessories',
  slug: 'smartphones',
  image_url: 'https://example.com/smartphones.jpg'
};

describe('createCategory', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a category', async () => {
    const result = await createCategory(testInput);

    // Basic field validation
    expect(result.name).toEqual('Smartphones');
    expect(result.description).toEqual('Latest mobile devices and accessories');
    expect(result.slug).toEqual('smartphones');
    expect(result.image_url).toEqual('https://example.com/smartphones.jpg');
    expect(result.id).toBeDefined();
    expect(typeof result.id).toBe('number');
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should save category to database', async () => {
    const result = await createCategory(testInput);

    // Query using proper drizzle syntax
    const categories = await db.select()
      .from(categoriesTable)
      .where(eq(categoriesTable.id, result.id))
      .execute();

    expect(categories).toHaveLength(1);
    expect(categories[0].name).toEqual('Smartphones');
    expect(categories[0].description).toEqual('Latest mobile devices and accessories');
    expect(categories[0].slug).toEqual('smartphones');
    expect(categories[0].image_url).toEqual('https://example.com/smartphones.jpg');
    expect(categories[0].created_at).toBeInstanceOf(Date);
  });

  it('should handle nullable fields correctly', async () => {
    const minimalInput: CreateCategoryInput = {
      name: 'Audio',
      description: null,
      slug: 'audio',
      image_url: null
    };

    const result = await createCategory(minimalInput);

    expect(result.name).toEqual('Audio');
    expect(result.description).toBeNull();
    expect(result.slug).toEqual('audio');
    expect(result.image_url).toBeNull();
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);

    // Verify in database
    const categories = await db.select()
      .from(categoriesTable)
      .where(eq(categoriesTable.id, result.id))
      .execute();

    expect(categories[0].description).toBeNull();
    expect(categories[0].image_url).toBeNull();
  });

  it('should reject duplicate slugs', async () => {
    // Create first category
    await createCategory(testInput);

    // Attempt to create category with same slug
    const duplicateInput: CreateCategoryInput = {
      name: 'Mobile Phones',
      description: 'Another smartphones category',
      slug: 'smartphones', // Same slug as testInput
      image_url: 'https://example.com/mobile.jpg'
    };

    await expect(createCategory(duplicateInput)).rejects.toThrow(/already exists/i);
  });

  it('should allow different categories with different slugs', async () => {
    // Create first category
    const firstCategory = await createCategory(testInput);

    // Create second category with different slug
    const secondInput: CreateCategoryInput = {
      name: 'Laptops',
      description: 'Portable computers and accessories',
      slug: 'laptops',
      image_url: 'https://example.com/laptops.jpg'
    };

    const secondCategory = await createCategory(secondInput);

    // Both should exist in database
    const allCategories = await db.select()
      .from(categoriesTable)
      .execute();

    expect(allCategories).toHaveLength(2);
    expect(firstCategory.slug).toEqual('smartphones');
    expect(secondCategory.slug).toEqual('laptops');
    expect(firstCategory.id).not.toEqual(secondCategory.id);
  });

  it('should create categories with URL-friendly slugs', async () => {
    const gamingInput: CreateCategoryInput = {
      name: 'Gaming & Entertainment',
      description: 'Gaming consoles, accessories, and entertainment devices',
      slug: 'gaming-entertainment',
      image_url: 'https://example.com/gaming.jpg'
    };

    const result = await createCategory(gamingInput);

    expect(result.slug).toEqual('gaming-entertainment');
    expect(result.name).toEqual('Gaming & Entertainment');

    // Verify slug is stored correctly in database
    const categories = await db.select()
      .from(categoriesTable)
      .where(eq(categoriesTable.slug, 'gaming-entertainment'))
      .execute();

    expect(categories).toHaveLength(1);
    expect(categories[0].slug).toEqual('gaming-entertainment');
  });

  it('should handle empty string description as null', async () => {
    const inputWithEmptyDescription: CreateCategoryInput = {
      name: 'Accessories',
      description: null, // Explicitly null
      slug: 'accessories',
      image_url: 'https://example.com/accessories.jpg'
    };

    const result = await createCategory(inputWithEmptyDescription);

    expect(result.description).toBeNull();

    // Verify in database
    const categories = await db.select()
      .from(categoriesTable)
      .where(eq(categoriesTable.id, result.id))
      .execute();

    expect(categories[0].description).toBeNull();
  });
});