import { Button } from '@/components/ui/button';
import type { HeroBanner } from '../../../server/src/schema';

interface HeroSectionProps {
  heroBanner: HeroBanner | null;
}

export function HeroSection({ heroBanner }: HeroSectionProps) {
  // Fallback content when no hero banner data is available
  const defaultHero = {
    title: "Cutting-Edge Electronics for Every Need",
    subtitle: "🔥 Latest Tech, Unbeatable Prices",
    description: "Discover the newest smartphones, laptops, headphones, and smart home devices. Free shipping on orders over $50!",
    cta_text: "Shop Now",
    cta_link: "#featured-products",
    background_image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
  };

  const heroContent = heroBanner || defaultHero;

  const handleCTAClick = () => {
    if (heroContent.cta_link.startsWith('#')) {
      const element = document.querySelector(heroContent.cta_link);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      window.location.href = heroContent.cta_link;
    }
  };

  return (
    <section className="relative min-h-[600px] flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url('${heroContent.background_image}')` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/50"></div>
      </div>

      {/* Hero Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
          {heroContent.title}
        </h1>
        
        <p className="text-xl sm:text-2xl mb-6 font-medium text-blue-200">
          {heroContent.subtitle}
        </p>
        
        <p className="text-lg sm:text-xl mb-8 max-w-2xl mx-auto leading-relaxed text-gray-200">
          {heroContent.description}
        </p>

        <Button
          onClick={handleCTAClick}
          size="lg"
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-8 py-4 text-lg rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
        >
          {heroContent.cta_text} 🚀
        </Button>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white/60 animate-bounce">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </section>
  );
}