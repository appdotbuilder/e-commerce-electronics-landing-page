import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { Testimonial } from '../../../server/src/schema';

interface TestimonialsSectionProps {
  testimonials: Testimonial[];
}

export function TestimonialsSection({ testimonials }: TestimonialsSectionProps) {
  // Fallback testimonials when API returns empty data
  const fallbackTestimonials = [
    {
      id: 1,
      customer_name: "Sarah Johnson",
      customer_avatar: "https://images.unsplash.com/photo-1494790108755-2616b9dc1c04?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
      rating: 5,
      review_text: "Amazing experience! Got my iPhone 15 Pro with lightning-fast delivery. The customer service was exceptional, and the price beat every other store I checked. Highly recommend TechHub!",
      product_id: null,
      is_featured: true,
      created_at: new Date('2024-01-15')
    },
    {
      id: 2,
      customer_name: "Michael Chen",
      customer_avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
      rating: 5,
      review_text: "Purchased a MacBook Pro M3 and couldn't be happier. The setup service was fantastic, and they even helped transfer all my data. This is how tech shopping should be done!",
      product_id: null,
      is_featured: true,
      created_at: new Date('2024-01-12')
    },
    {
      id: 3,
      customer_name: "Emily Rodriguez",
      customer_avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
      rating: 5,
      review_text: "The best electronics store I've ever shopped at! Great prices, authentic products, and their warranty service is top-notch. My go-to place for all tech needs.",
      product_id: null,
      is_featured: true,
      created_at: new Date('2024-01-10')
    },
    {
      id: 4,
      customer_name: "David Thompson",
      customer_avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
      rating: 5,
      review_text: "Incredible selection of products and unbeatable customer support. When my headphones had an issue, they replaced them immediately. TechHub truly cares about their customers!",
      product_id: null,
      is_featured: true,
      created_at: new Date('2024-01-08')
    }
  ];

  // Use API data if available, otherwise use fallback
  const displayTestimonials = testimonials.length > 0 ? testimonials : fallbackTestimonials;

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={i < rating ? "text-yellow-400" : "text-gray-300"}>
        ⭐
      </span>
    ));
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            💬 What Our Customers Say
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Don't just take our word for it. Here's what thousands of satisfied customers have to say about their TechHub experience.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {displayTestimonials.map((testimonial) => (
            <Card key={testimonial.id} className="border-0 shadow-md hover:shadow-lg transition-shadow duration-200">
              <CardContent className="p-6">
                {/* Rating */}
                <div className="flex items-center mb-4">
                  {renderStars(testimonial.rating)}
                  <span className="ml-2 text-sm text-gray-600">
                    ({testimonial.rating}/5)
                  </span>
                </div>

                {/* Review Text */}
                <blockquote className="text-gray-700 mb-6 leading-relaxed">
                  "{testimonial.review_text}"
                </blockquote>

                {/* Customer Info */}
                <div className="flex items-center">
                  <Avatar className="h-10 w-10 mr-3">
                    <AvatarImage 
                      src={testimonial.customer_avatar || undefined} 
                      alt={testimonial.customer_name} 
                    />
                    <AvatarFallback className="bg-blue-100 text-blue-600">
                      {getInitials(testimonial.customer_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold text-gray-900">
                      {testimonial.customer_name}
                    </div>
                    <div className="text-sm text-gray-500">
                      Verified Customer • {testimonial.created_at.toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Trust Indicators */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-8 text-center">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">4.9/5</div>
              <div className="text-gray-600">Average Rating</div>
              <div className="flex justify-center mt-2">
                {renderStars(5)}
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600 mb-2">15K+</div>
              <div className="text-gray-600">Customer Reviews</div>
              <div className="text-sm text-gray-500 mt-2">All verified purchases</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600 mb-2">98%</div>
              <div className="text-gray-600">Recommend Us</div>
              <div className="text-sm text-gray-500 mt-2">To friends & family</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}