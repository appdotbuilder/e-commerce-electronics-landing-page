import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { productsTable } from '../db/schema';
import { getFeaturedProducts } from '../handlers/get_featured_products';

// Test product data - one featured, one not featured
const featuredProduct = {
  name: 'Featured Laptop',
  description: 'A high-end gaming laptop',
  price: '1299.99',
  original_price: '1599.99',
  image_url: 'https://example.com/laptop.jpg',
  category: 'Laptops',
  is_featured: true,
  is_new: true,
  stock_quantity: 10
};

const nonFeaturedProduct = {
  name: 'Regular Mouse',
  description: 'A basic computer mouse',
  price: '19.99',
  original_price: null,
  image_url: 'https://example.com/mouse.jpg',
  category: 'Accessories',
  is_featured: false,
  is_new: false,
  stock_quantity: 50
};

const anotherFeaturedProduct = {
  name: 'Featured Smartphone',
  description: 'Latest flagship smartphone',
  price: '899.99',
  original_price: '999.99',
  image_url: 'https://example.com/phone.jpg',
  category: 'Smartphones',
  is_featured: true,
  is_new: true,
  stock_quantity: 25
};

describe('getFeaturedProducts', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no featured products exist', async () => {
    const result = await getFeaturedProducts();
    expect(result).toEqual([]);
  });

  it('should return only featured products', async () => {
    // Insert test products
    await db.insert(productsTable).values([
      featuredProduct,
      nonFeaturedProduct,
      anotherFeaturedProduct
    ]).execute();

    const result = await getFeaturedProducts();

    expect(result).toHaveLength(2);
    expect(result.every(product => product.is_featured === true)).toBe(true);
    
    const productNames = result.map(p => p.name);
    expect(productNames).toContain('Featured Laptop');
    expect(productNames).toContain('Featured Smartphone');
    expect(productNames).not.toContain('Regular Mouse');
  });

  it('should return products ordered by created_at descending', async () => {
    // Insert featured product first
    await db.insert(productsTable).values(featuredProduct).execute();
    
    // Wait a bit to ensure different timestamps
    await new Promise(resolve => setTimeout(resolve, 10));
    
    // Insert another featured product
    await db.insert(productsTable).values(anotherFeaturedProduct).execute();

    const result = await getFeaturedProducts();

    expect(result).toHaveLength(2);
    // Most recently created should be first
    expect(result[0].name).toEqual('Featured Smartphone');
    expect(result[1].name).toEqual('Featured Laptop');
    
    // Verify ordering by timestamps
    expect(result[0].created_at.getTime()).toBeGreaterThan(result[1].created_at.getTime());
  });

  it('should correctly convert numeric fields', async () => {
    await db.insert(productsTable).values(featuredProduct).execute();

    const result = await getFeaturedProducts();

    expect(result).toHaveLength(1);
    const product = result[0];
    
    // Verify numeric conversions
    expect(typeof product.price).toBe('number');
    expect(product.price).toEqual(1299.99);
    
    expect(typeof product.original_price).toBe('number');
    expect(product.original_price).toEqual(1599.99);
    
    // Verify other fields are preserved
    expect(product.name).toEqual('Featured Laptop');
    expect(product.is_featured).toBe(true);
    expect(product.stock_quantity).toEqual(10);
    expect(product.created_at).toBeInstanceOf(Date);
    expect(product.updated_at).toBeInstanceOf(Date);
  });

  it('should handle null original_price correctly', async () => {
    const productWithoutOriginalPrice = {
      ...featuredProduct,
      original_price: null
    };

    await db.insert(productsTable).values(productWithoutOriginalPrice).execute();

    const result = await getFeaturedProducts();

    expect(result).toHaveLength(1);
    expect(result[0].original_price).toBeNull();
    expect(typeof result[0].price).toBe('number');
    expect(result[0].price).toEqual(1299.99);
  });

  it('should return all featured products regardless of other properties', async () => {
    // Create featured products with different properties
    const featuredOldProduct = {
      ...featuredProduct,
      name: 'Featured Old Laptop',
      is_new: false,
      stock_quantity: 0 // Out of stock
    };

    await db.insert(productsTable).values([
      featuredProduct,
      featuredOldProduct,
      nonFeaturedProduct
    ]).execute();

    const result = await getFeaturedProducts();

    expect(result).toHaveLength(2);
    expect(result.every(product => product.is_featured === true)).toBe(true);
    
    // Should include both new and old featured products
    const hasNewProduct = result.some(p => p.is_new === true);
    const hasOldProduct = result.some(p => p.is_new === false);
    expect(hasNewProduct).toBe(true);
    expect(hasOldProduct).toBe(true);
    
    // Should include even out-of-stock featured products
    const hasOutOfStockProduct = result.some(p => p.stock_quantity === 0);
    expect(hasOutOfStockProduct).toBe(true);
  });
});