import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { productsTable } from '../db/schema';
import { getNewProducts } from '../handlers/get_new_products';

describe('getNewProducts', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no new products exist', async () => {
    // Create a regular product (not new)
    await db.insert(productsTable).values({
      name: 'Regular Product',
      description: 'Not a new product',
      price: '99.99',
      original_price: null,
      image_url: 'https://example.com/regular.jpg',
      category: 'electronics',
      is_featured: false,
      is_new: false, // Not new
      stock_quantity: 50
    });

    const result = await getNewProducts();

    expect(result).toEqual([]);
  });

  it('should return only new products', async () => {
    // Create a mix of new and regular products
    await db.insert(productsTable).values([
      {
        name: 'New Product 1',
        description: 'Brand new electronic device',
        price: '299.99',
        original_price: '349.99',
        image_url: 'https://example.com/new1.jpg',
        category: 'smartphones',
        is_featured: true,
        is_new: true, // New product
        stock_quantity: 25
      },
      {
        name: 'Regular Product',
        description: 'Regular electronic device',
        price: '199.99',
        original_price: null,
        image_url: 'https://example.com/regular.jpg',
        category: 'laptops',
        is_featured: false,
        is_new: false, // Not new
        stock_quantity: 100
      },
      {
        name: 'New Product 2',
        description: 'Another new electronic device',
        price: '149.99',
        original_price: null,
        image_url: 'https://example.com/new2.jpg',
        category: 'tablets',
        is_featured: false,
        is_new: true, // New product
        stock_quantity: 75
      }
    ]);

    const result = await getNewProducts();

    expect(result).toHaveLength(2);
    
    // Verify only new products are returned
    result.forEach(product => {
      expect(product.is_new).toBe(true);
    });

    // Verify product names
    const productNames = result.map(p => p.name);
    expect(productNames).toContain('New Product 1');
    expect(productNames).toContain('New Product 2');
    expect(productNames).not.toContain('Regular Product');
  });

  it('should return products ordered by created_at descending', async () => {
    // Create products with different timestamps
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);

    // Insert first product (oldest)
    await db.insert(productsTable).values({
      name: 'Oldest New Product',
      description: 'Created first',
      price: '100.00',
      original_price: null,
      image_url: 'https://example.com/oldest.jpg',
      category: 'electronics',
      is_featured: false,
      is_new: true,
      stock_quantity: 10,
      created_at: twoHoursAgo
    });

    // Insert second product (middle)
    await db.insert(productsTable).values({
      name: 'Middle New Product',
      description: 'Created second',
      price: '200.00',
      original_price: null,
      image_url: 'https://example.com/middle.jpg',
      category: 'electronics',
      is_featured: false,
      is_new: true,
      stock_quantity: 20,
      created_at: oneHourAgo
    });

    // Insert third product (newest)
    await db.insert(productsTable).values({
      name: 'Newest New Product',
      description: 'Created last',
      price: '300.00',
      original_price: null,
      image_url: 'https://example.com/newest.jpg',
      category: 'electronics',
      is_featured: false,
      is_new: true,
      stock_quantity: 30,
      created_at: now
    });

    const result = await getNewProducts();

    expect(result).toHaveLength(3);

    // Verify products are ordered by created_at descending (newest first)
    expect(result[0].name).toBe('Newest New Product');
    expect(result[1].name).toBe('Middle New Product');
    expect(result[2].name).toBe('Oldest New Product');

    // Verify timestamps are in descending order
    expect(result[0].created_at >= result[1].created_at).toBe(true);
    expect(result[1].created_at >= result[2].created_at).toBe(true);
  });

  it('should properly convert numeric fields to numbers', async () => {
    await db.insert(productsTable).values({
      name: 'Test Product',
      description: 'Testing numeric conversion',
      price: '29.99',
      original_price: '39.99',
      image_url: 'https://example.com/test.jpg',
      category: 'accessories',
      is_featured: false,
      is_new: true,
      stock_quantity: 5
    });

    const result = await getNewProducts();

    expect(result).toHaveLength(1);

    const product = result[0];
    
    // Verify numeric fields are converted to numbers
    expect(typeof product.price).toBe('number');
    expect(product.price).toBe(29.99);
    
    expect(typeof product.original_price).toBe('number');
    expect(product.original_price).toBe(39.99);

    // Verify other fields maintain correct types
    expect(typeof product.name).toBe('string');
    expect(typeof product.is_new).toBe('boolean');
    expect(typeof product.stock_quantity).toBe('number');
    expect(product.created_at).toBeInstanceOf(Date);
  });

  it('should handle null original_price correctly', async () => {
    await db.insert(productsTable).values({
      name: 'No Original Price',
      description: 'Product without original price',
      price: '99.99',
      original_price: null, // Null original price
      image_url: 'https://example.com/no-original.jpg',
      category: 'electronics',
      is_featured: false,
      is_new: true,
      stock_quantity: 15
    });

    const result = await getNewProducts();

    expect(result).toHaveLength(1);

    const product = result[0];
    
    // Verify null original_price is preserved
    expect(product.original_price).toBeNull();
    
    // Verify price is still converted properly
    expect(typeof product.price).toBe('number');
    expect(product.price).toBe(99.99);
  });

  it('should include all required product fields', async () => {
    await db.insert(productsTable).values({
      name: 'Complete Product',
      description: 'Product with all fields',
      price: '199.99',
      original_price: '249.99',
      image_url: 'https://example.com/complete.jpg',
      category: 'smartphones',
      is_featured: true,
      is_new: true,
      stock_quantity: 50
    });

    const result = await getNewProducts();

    expect(result).toHaveLength(1);

    const product = result[0];
    
    // Verify all expected fields are present
    expect(product).toHaveProperty('id');
    expect(product).toHaveProperty('name', 'Complete Product');
    expect(product).toHaveProperty('description', 'Product with all fields');
    expect(product).toHaveProperty('price', 199.99);
    expect(product).toHaveProperty('original_price', 249.99);
    expect(product).toHaveProperty('image_url', 'https://example.com/complete.jpg');
    expect(product).toHaveProperty('category', 'smartphones');
    expect(product).toHaveProperty('is_featured', true);
    expect(product).toHaveProperty('is_new', true);
    expect(product).toHaveProperty('stock_quantity', 50);
    expect(product).toHaveProperty('created_at');
    expect(product).toHaveProperty('updated_at');

    // Verify field types
    expect(typeof product.id).toBe('number');
    expect(product.created_at).toBeInstanceOf(Date);
    expect(product.updated_at).toBeInstanceOf(Date);
  });
});