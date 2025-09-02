import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { productsTable } from '../db/schema';
import { type CreateProductInput } from '../schema';
import { createProduct } from '../handlers/create_product';
import { eq } from 'drizzle-orm';

// Complete test input with all required fields
const testInput: CreateProductInput = {
  name: 'iPhone 15 Pro',
  description: 'Latest iPhone with titanium design and A17 Pro chip',
  price: 999.99,
  original_price: 1099.99,
  image_url: 'https://example.com/iphone-15-pro.jpg',
  category: 'smartphones',
  is_featured: true,
  is_new: true,
  stock_quantity: 50
};

// Test input without optional fields
const minimalTestInput: CreateProductInput = {
  name: 'Samsung Galaxy S24',
  description: 'Android flagship with AI features',
  price: 799.99,
  original_price: null,
  image_url: 'https://example.com/galaxy-s24.jpg',
  category: 'smartphones',
  stock_quantity: 25
};

describe('createProduct', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a product with all fields', async () => {
    const result = await createProduct(testInput);

    // Verify all field values
    expect(result.name).toEqual('iPhone 15 Pro');
    expect(result.description).toEqual(testInput.description);
    expect(result.price).toEqual(999.99);
    expect(typeof result.price).toBe('number'); // Verify numeric conversion
    expect(result.original_price).toEqual(1099.99);
    expect(typeof result.original_price).toBe('number'); // Verify numeric conversion
    expect(result.image_url).toEqual(testInput.image_url);
    expect(result.category).toEqual('smartphones');
    expect(result.is_featured).toBe(true);
    expect(result.is_new).toBe(true);
    expect(result.stock_quantity).toEqual(50);

    // Verify auto-generated fields
    expect(result.id).toBeDefined();
    expect(typeof result.id).toBe('number');
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should create a product with minimal fields (optional fields default)', async () => {
    const result = await createProduct(minimalTestInput);

    // Verify required fields
    expect(result.name).toEqual('Samsung Galaxy S24');
    expect(result.description).toEqual(minimalTestInput.description);
    expect(result.price).toEqual(799.99);
    expect(typeof result.price).toBe('number');
    expect(result.original_price).toBeNull();
    expect(result.stock_quantity).toEqual(25);

    // Verify defaults are applied for optional boolean fields
    expect(result.is_featured).toBe(false);
    expect(result.is_new).toBe(false);

    // Verify auto-generated fields
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save product to database correctly', async () => {
    const result = await createProduct(testInput);

    // Query the database directly to verify persistence
    const products = await db.select()
      .from(productsTable)
      .where(eq(productsTable.id, result.id))
      .execute();

    expect(products).toHaveLength(1);
    const savedProduct = products[0];

    // Verify database storage (numeric fields stored as strings)
    expect(savedProduct.name).toEqual('iPhone 15 Pro');
    expect(savedProduct.description).toEqual(testInput.description);
    expect(parseFloat(savedProduct.price)).toEqual(999.99); // Database stores as string
    expect(parseFloat(savedProduct.original_price!)).toEqual(1099.99);
    expect(savedProduct.category).toEqual('smartphones');
    expect(savedProduct.is_featured).toBe(true);
    expect(savedProduct.is_new).toBe(true);
    expect(savedProduct.stock_quantity).toEqual(50);
    expect(savedProduct.created_at).toBeInstanceOf(Date);
    expect(savedProduct.updated_at).toBeInstanceOf(Date);
  });

  it('should handle null original_price correctly', async () => {
    const result = await createProduct(minimalTestInput);

    // Query database to verify null handling
    const products = await db.select()
      .from(productsTable)
      .where(eq(productsTable.id, result.id))
      .execute();

    expect(products).toHaveLength(1);
    expect(products[0].original_price).toBeNull();
    expect(result.original_price).toBeNull();
  });

  it('should create multiple products with unique IDs', async () => {
    const product1 = await createProduct({
      ...testInput,
      name: 'Product 1'
    });

    const product2 = await createProduct({
      ...testInput,
      name: 'Product 2'
    });

    // Verify unique IDs
    expect(product1.id).not.toEqual(product2.id);
    expect(product1.name).toEqual('Product 1');
    expect(product2.name).toEqual('Product 2');

    // Verify both are in database
    const allProducts = await db.select()
      .from(productsTable)
      .execute();

    expect(allProducts).toHaveLength(2);
  });

  it('should handle decimal prices correctly', async () => {
    const decimalPriceInput: CreateProductInput = {
      ...testInput,
      price: 123.456789, // High precision decimal
      original_price: 234.567890
    };

    const result = await createProduct(decimalPriceInput);

    // Verify precision handling (PostgreSQL numeric(10,2) rounds to 2 decimal places)
    expect(result.price).toEqual(123.46); // Rounded to 2 decimal places
    expect(result.original_price).toEqual(234.57); // Rounded to 2 decimal places
    expect(typeof result.price).toBe('number');
    expect(typeof result.original_price).toBe('number');
  });
});