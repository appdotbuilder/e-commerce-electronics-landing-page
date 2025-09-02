import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { productsTable, testimonialsTable, heroBannersTable, categoriesTable } from '../db/schema';
import { getLandingPageData } from '../handlers/get_landing_page_data';

describe('getLandingPageData', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty data when no records exist', async () => {
    const result = await getLandingPageData();

    expect(result.heroBanner).toBeNull();
    expect(result.featuredProducts).toHaveLength(0);
    expect(result.newProducts).toHaveLength(0);
    expect(result.categories).toHaveLength(0);
    expect(result.testimonials).toHaveLength(0);
  });

  it('should fetch complete landing page data', async () => {
    // Create test category
    const categoryResult = await db.insert(categoriesTable)
      .values({
        name: 'Electronics',
        description: 'Electronic devices',
        slug: 'electronics',
        image_url: 'https://example.com/electronics.jpg'
      })
      .returning()
      .execute();

    // Create test hero banner
    await db.insert(heroBannersTable)
      .values({
        title: 'Summer Sale',
        subtitle: 'Best Deals',
        description: 'Get amazing discounts on electronics',
        cta_text: 'Shop Now',
        cta_link: '/shop',
        background_image: 'https://example.com/banner.jpg',
        is_active: true
      })
      .execute();

    // Create featured product
    await db.insert(productsTable)
      .values({
        name: 'Featured Laptop',
        description: 'High-performance laptop',
        price: '999.99',
        original_price: '1199.99',
        image_url: 'https://example.com/laptop.jpg',
        category: 'Electronics',
        is_featured: true,
        is_new: false,
        stock_quantity: 10
      })
      .execute();

    // Create new product
    await db.insert(productsTable)
      .values({
        name: 'New Smartphone',
        description: 'Latest smartphone model',
        price: '799.99',
        image_url: 'https://example.com/phone.jpg',
        category: 'Electronics',
        is_featured: false,
        is_new: true,
        stock_quantity: 25
      })
      .execute();

    // Create featured testimonial
    await db.insert(testimonialsTable)
      .values({
        customer_name: 'John Doe',
        customer_avatar: 'https://example.com/avatar.jpg',
        rating: 5,
        review_text: 'Excellent product and service!',
        product_id: null,
        is_featured: true
      })
      .execute();

    const result = await getLandingPageData();

    // Verify hero banner
    expect(result.heroBanner).not.toBeNull();
    expect(result.heroBanner?.title).toBe('Summer Sale');
    expect(result.heroBanner?.is_active).toBe(true);

    // Verify featured products
    expect(result.featuredProducts).toHaveLength(1);
    expect(result.featuredProducts[0].name).toBe('Featured Laptop');
    expect(result.featuredProducts[0].is_featured).toBe(true);
    expect(typeof result.featuredProducts[0].price).toBe('number');
    expect(result.featuredProducts[0].price).toBe(999.99);
    expect(result.featuredProducts[0].original_price).toBe(1199.99);

    // Verify new products
    expect(result.newProducts).toHaveLength(1);
    expect(result.newProducts[0].name).toBe('New Smartphone');
    expect(result.newProducts[0].is_new).toBe(true);
    expect(typeof result.newProducts[0].price).toBe('number');
    expect(result.newProducts[0].price).toBe(799.99);

    // Verify categories
    expect(result.categories).toHaveLength(1);
    expect(result.categories[0].name).toBe('Electronics');
    expect(result.categories[0].slug).toBe('electronics');

    // Verify testimonials
    expect(result.testimonials).toHaveLength(1);
    expect(result.testimonials[0].customer_name).toBe('John Doe');
    expect(result.testimonials[0].rating).toBe(5);
    expect(result.testimonials[0].is_featured).toBe(true);
  });

  it('should return only active hero banner', async () => {
    // Create inactive hero banner
    await db.insert(heroBannersTable)
      .values({
        title: 'Inactive Banner',
        subtitle: 'Should not appear',
        description: 'This banner is inactive',
        cta_text: 'Click Me',
        cta_link: '/inactive',
        background_image: 'https://example.com/inactive.jpg',
        is_active: false
      })
      .execute();

    // Create active hero banner
    await db.insert(heroBannersTable)
      .values({
        title: 'Active Banner',
        subtitle: 'Should appear',
        description: 'This banner is active',
        cta_text: 'Shop Now',
        cta_link: '/active',
        background_image: 'https://example.com/active.jpg',
        is_active: true
      })
      .execute();

    const result = await getLandingPageData();

    expect(result.heroBanner).not.toBeNull();
    expect(result.heroBanner?.title).toBe('Active Banner');
    expect(result.heroBanner?.is_active).toBe(true);
  });

  it('should limit featured products to 8 items', async () => {
    // Create 10 featured products
    const productPromises = [];
    for (let i = 1; i <= 10; i++) {
      productPromises.push(
        db.insert(productsTable)
          .values({
            name: `Featured Product ${i}`,
            description: `Description ${i}`,
            price: '99.99',
            image_url: `https://example.com/product${i}.jpg`,
            category: 'Electronics',
            is_featured: true,
            is_new: false,
            stock_quantity: 10
          })
          .execute()
      );
    }
    await Promise.all(productPromises);

    const result = await getLandingPageData();

    expect(result.featuredProducts).toHaveLength(8);
    result.featuredProducts.forEach(product => {
      expect(product.is_featured).toBe(true);
      expect(typeof product.price).toBe('number');
    });
  });

  it('should limit new products to 4 items', async () => {
    // Create 6 new products
    const productPromises = [];
    for (let i = 1; i <= 6; i++) {
      productPromises.push(
        db.insert(productsTable)
          .values({
            name: `New Product ${i}`,
            description: `New description ${i}`,
            price: '149.99',
            image_url: `https://example.com/new${i}.jpg`,
            category: 'Electronics',
            is_featured: false,
            is_new: true,
            stock_quantity: 15
          })
          .execute()
      );
    }
    await Promise.all(productPromises);

    const result = await getLandingPageData();

    expect(result.newProducts).toHaveLength(4);
    result.newProducts.forEach(product => {
      expect(product.is_new).toBe(true);
      expect(typeof product.price).toBe('number');
    });
  });

  it('should limit testimonials to 6 featured items', async () => {
    // Create 8 featured testimonials
    const testimonialPromises = [];
    for (let i = 1; i <= 8; i++) {
      testimonialPromises.push(
        db.insert(testimonialsTable)
          .values({
            customer_name: `Customer ${i}`,
            customer_avatar: `https://example.com/avatar${i}.jpg`,
            rating: 5,
            review_text: `Great review number ${i}`,
            product_id: null,
            is_featured: true
          })
          .execute()
      );
    }
    await Promise.all(testimonialPromises);

    const result = await getLandingPageData();

    expect(result.testimonials).toHaveLength(6);
    result.testimonials.forEach(testimonial => {
      expect(testimonial.is_featured).toBe(true);
      expect(testimonial.rating).toBe(5);
    });
  });

  it('should handle products with null original_price', async () => {
    await db.insert(productsTable)
      .values({
        name: 'Regular Product',
        description: 'No discount',
        price: '299.99',
        original_price: null, // No original price
        image_url: 'https://example.com/regular.jpg',
        category: 'Electronics',
        is_featured: true,
        is_new: false,
        stock_quantity: 5
      })
      .execute();

    const result = await getLandingPageData();

    expect(result.featuredProducts).toHaveLength(1);
    expect(result.featuredProducts[0].original_price).toBeNull();
    expect(typeof result.featuredProducts[0].price).toBe('number');
    expect(result.featuredProducts[0].price).toBe(299.99);
  });
});