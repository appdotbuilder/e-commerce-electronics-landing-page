import { useState, useEffect, useCallback } from 'react';
import { trpc } from '@/utils/trpc';
import { HeroSection } from '@/components/HeroSection';
import { FeaturedProducts } from '@/components/FeaturedProducts';
import { ValueProposition } from '@/components/ValueProposition';
import { TestimonialsSection } from '@/components/TestimonialsSection';
import { NewsletterSection } from '@/components/NewsletterSection';
import { Footer } from '@/components/Footer';
import type { LandingPageData } from '../../server/src/handlers/get_landing_page_data';

function App() {
  const [landingData, setLandingData] = useState<LandingPageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadLandingPageData = useCallback(async () => {
    try {
      const data = await trpc.getLandingPageData.query();
      setLandingData(data);
    } catch (error) {
      console.error('Failed to load landing page data:', error);
      // Set fallback data structure to prevent crashes
      setLandingData({
        heroBanner: null,
        featuredProducts: [],
        newProducts: [],
        categories: [],
        testimonials: []
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLandingPageData();
  }, [loadLandingPageData]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading TechHub...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <HeroSection heroBanner={landingData?.heroBanner || null} />

      {/* Featured Products */}
      <FeaturedProducts 
        featuredProducts={landingData?.featuredProducts || []}
        newProducts={landingData?.newProducts || []}
      />

      {/* Value Proposition */}
      <ValueProposition />

      {/* Testimonials */}
      <TestimonialsSection testimonials={landingData?.testimonials || []} />

      {/* Newsletter Signup */}
      <NewsletterSection />

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default App;