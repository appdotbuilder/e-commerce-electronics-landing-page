import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import type { Product } from '../../../server/src/schema';

interface FeaturedProductsProps {
  featuredProducts: Product[];
  newProducts: Product[];
}

export function FeaturedProducts({ featuredProducts }: FeaturedProductsProps) {
  // Fallback products when API returns empty data
  const fallbackProducts: Omit<Product, 'id' | 'created_at' | 'updated_at'>[] = [
    {
      name: "iPhone 15 Pro Max",
      description: "The most advanced iPhone ever with titanium design and Action Button.",
      price: 1199.99,
      original_price: 1299.99,
      image_url: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      category: "Smartphones",
      is_featured: true,
      is_new: true,
      stock_quantity: 15
    },
    {
      name: "MacBook Pro M3",
      description: "Supercharged for pros with the M3 chip for incredible performance.",
      price: 1999.99,
      original_price: null,
      image_url: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      category: "Laptops",
      is_featured: true,
      is_new: false,
      stock_quantity: 8
    },
    {
      name: "Sony WH-1000XM5",
      description: "Industry-leading noise canceling with premium sound quality.",
      price: 399.99,
      original_price: 449.99,
      image_url: "https://images.unsplash.com/photo-1484704849700-f032a568e944?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      category: "Headphones",
      is_featured: true,
      is_new: false,
      stock_quantity: 25
    },
    {
      name: "Samsung 85\" Neo QLED 8K",
      description: "Experience stunning 8K resolution with Quantum Matrix Technology.",
      price: 2499.99,
      original_price: 2999.99,
      image_url: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      category: "TVs",
      is_featured: true,
      is_new: true,
      stock_quantity: 5
    }
  ];

  // Use API data if available, otherwise use fallback
  const displayProducts = featuredProducts.length > 0 ? featuredProducts.slice(0, 4) : fallbackProducts;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const calculateDiscount = (price: number, originalPrice: number | null) => {
    if (!originalPrice || originalPrice <= price) return null;
    return Math.round(((originalPrice - price) / originalPrice) * 100);
  };

  return (
    <section id="featured-products" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            ⚡ Featured Electronics
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover our handpicked selection of the latest and greatest tech products
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {displayProducts.map((product, index) => {
            const discount = calculateDiscount(product.price, product.original_price);
            
            return (
              <Card key={`product-${index}`} className="group hover:shadow-lg transition-shadow duration-200 border-0 shadow-md">
                <CardContent className="p-0">
                  {/* Product Image */}
                  <div className="relative overflow-hidden rounded-t-lg">
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                    
                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-1">
                      {product.is_new && (
                        <Badge className="bg-green-500 hover:bg-green-600 text-white text-xs">
                          NEW
                        </Badge>
                      )}
                      {discount && (
                        <Badge className="bg-red-500 hover:bg-red-600 text-white text-xs">
                          -{discount}%
                        </Badge>
                      )}
                    </div>

                    {/* Stock indicator */}
                    {product.stock_quantity <= 5 && (
                      <div className="absolute top-3 right-3">
                        <Badge variant="secondary" className="bg-orange-100 text-orange-800 text-xs">
                          Only {product.stock_quantity} left!
                        </Badge>
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="p-4">
                    <div className="mb-2">
                      <Badge variant="outline" className="text-xs text-blue-600 border-blue-200">
                        {product.category}
                      </Badge>
                    </div>
                    
                    <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-1">
                      {product.name}
                    </h3>
                    
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {product.description}
                    </p>

                    {/* Pricing */}
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xl font-bold text-gray-900">
                        {formatPrice(product.price)}
                      </span>
                      {product.original_price && product.original_price > product.price && (
                        <span className="text-sm text-gray-500 line-through">
                          {formatPrice(product.original_price)}
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="p-4 pt-0">
                  <div className="flex w-full gap-2">
                    <Button 
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                      disabled={product.stock_quantity === 0}
                    >
                      {product.stock_quantity === 0 ? 'Out of Stock' : 'Add to Cart 🛒'}
                    </Button>
                    <Button variant="outline" className="px-3">
                      👁️
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            );
          })}
        </div>

        {/* CTA to view all products */}
        <div className="text-center">
          <Button 
            variant="outline" 
            size="lg"
            className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-8"
          >
            View All Products →
          </Button>
        </div>
      </div>
    </section>
  );
}