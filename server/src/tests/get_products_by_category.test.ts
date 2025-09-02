import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { productsTable } from '../db/schema';
import { getProductsByCategory } from '../handlers/get_products_by_category';

describe('getProductsByCategory', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return products filtered by category', async () => {
    // Create test products with different categories
    await db.insert(productsTable).values([
      {
        name: 'iPhone 15',
        description: 'Latest smartphone',
        price: '999.99',
        original_price: '1099.99',
        image_url: 'https://example.com/iphone15.jpg',
        category: 'smartphones',
        is_featured: true,
        is_new: true,
        stock_quantity: 50
      },
      {
        name: 'MacBook Pro',
        description: 'Professional laptop',
        price: '1999.99',
        original_price: null,
        image_url: 'https://example.com/macbook.jpg',
        category: 'laptops',
        is_featured: false,
        is_new: false,
        stock_quantity: 25
      },
      {
        name: 'Samsung Galaxy',
        description: 'Android smartphone',
        price: '799.99',
        original_price: '899.99',
        image_url: 'https://example.com/galaxy.jpg',
        category: 'smartphones',
        is_featured: true,
        is_new: false,
        stock_quantity: 30
      }
    ]).execute();

    const result = await getProductsByCategory('smartphones');

    expect(result).toHaveLength(2);
    
    // Verify all returned products are smartphones
    result.forEach(product => {
      expect(product.category).toEqual('smartphones');
    });

    // Verify specific products
    const iphone = result.find(p => p.name === 'iPhone 15');
    expect(iphone).toBeDefined();
    expect(iphone!.price).toEqual(999.99);
    expect(typeof iphone!.price).toBe('number');
    expect(iphone!.original_price).toEqual(1099.99);
    expect(typeof iphone!.original_price).toBe('number');

    const galaxy = result.find(p => p.name === 'Samsung Galaxy');
    expect(galaxy).toBeDefined();
    expect(galaxy!.price).toEqual(799.99);
    expect(typeof galaxy!.price).toBe('number');
  });

  it('should return empty array for non-existent category', async () => {
    // Create some test products
    await db.insert(productsTable).values([
      {
        name: 'Test Product',
        description: 'A test product',
        price: '29.99',
        original_price: null,
        image_url: 'https://example.com/test.jpg',
        category: 'smartphones',
        is_featured: false,
        is_new: false,
        stock_quantity: 10
      }
    ]).execute();

    const result = await getProductsByCategory('tablets');

    expect(result).toHaveLength(0);
    expect(result).toEqual([]);
  });

  it('should handle null original_price correctly', async () => {
    // Create product with null original_price
    await db.insert(productsTable).values([
      {
        name: 'Budget Phone',
        description: 'Affordable smartphone',
        price: '199.99',
        original_price: null,
        image_url: 'https://example.com/budget.jpg',
        category: 'smartphones',
        is_featured: false,
        is_new: true,
        stock_quantity: 100
      }
    ]).execute();

    const result = await getProductsByCategory('smartphones');

    expect(result).toHaveLength(1);
    expect(result[0].price).toEqual(199.99);
    expect(typeof result[0].price).toBe('number');
    expect(result[0].original_price).toBeNull();
  });

  it('should return products with all required fields', async () => {
    await db.insert(productsTable).values([
      {
        name: 'Gaming Laptop',
        description: 'High-performance gaming laptop',
        price: '1599.99',
        original_price: '1799.99',
        image_url: 'https://example.com/gaming-laptop.jpg',
        category: 'laptops',
        is_featured: true,
        is_new: true,
        stock_quantity: 15
      }
    ]).execute();

    const result = await getProductsByCategory('laptops');

    expect(result).toHaveLength(1);
    
    const product = result[0];
    expect(product.id).toBeDefined();
    expect(product.name).toEqual('Gaming Laptop');
    expect(product.description).toEqual('High-performance gaming laptop');
    expect(product.price).toEqual(1599.99);
    expect(product.original_price).toEqual(1799.99);
    expect(product.image_url).toEqual('https://example.com/gaming-laptop.jpg');
    expect(product.category).toEqual('laptops');
    expect(product.is_featured).toBe(true);
    expect(product.is_new).toBe(true);
    expect(product.stock_quantity).toEqual(15);
    expect(product.created_at).toBeInstanceOf(Date);
    expect(product.updated_at).toBeInstanceOf(Date);
  });

  it('should handle case-sensitive category matching', async () => {
    await db.insert(productsTable).values([
      {
        name: 'Wireless Headphones',
        description: 'Premium audio experience',
        price: '299.99',
        original_price: null,
        image_url: 'https://example.com/headphones.jpg',
        category: 'Accessories',
        is_featured: false,
        is_new: false,
        stock_quantity: 75
      }
    ]).execute();

    // Should not match - case sensitive
    const noResult = await getProductsByCategory('accessories');
    expect(noResult).toHaveLength(0);

    // Should match - exact case
    const result = await getProductsByCategory('Accessories');
    expect(result).toHaveLength(1);
    expect(result[0].name).toEqual('Wireless Headphones');
  });
});