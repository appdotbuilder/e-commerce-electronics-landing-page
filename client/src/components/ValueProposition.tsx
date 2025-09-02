export function ValueProposition() {
  const benefits = [
    {
      icon: "💰",
      title: "Unbeatable Prices",
      description: "Get the best deals on top electronics with our price match guarantee and exclusive discounts."
    },
    {
      icon: "🚚",
      title: "Fast & Free Shipping",
      description: "Free shipping on orders over $50. Express delivery available for same-day and next-day service."
    },
    {
      icon: "🛡️",
      title: "1-Year Warranty",
      description: "All products come with comprehensive warranty coverage and hassle-free returns within 30 days."
    },
    {
      icon: "🌟",
      title: "Latest Technology",
      description: "Stay ahead with the newest releases and cutting-edge innovations from top tech brands."
    },
    {
      icon: "📞",
      title: "24/7 Customer Support",
      description: "Expert technical support and customer service available around the clock via chat, phone, or email."
    },
    {
      icon: "🔒",
      title: "Secure Shopping",
      description: "Shop with confidence using our encrypted checkout and multiple secure payment options."
    }
  ];

  return (
    <section className="py-16 bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Why Choose TechHub? 🏆
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            We're not just another electronics store. Here's what makes us your best choice for tech shopping.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow duration-200 border border-gray-100 group hover:border-blue-200"
            >
              {/* Icon */}
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-200">
                {benefit.icon}
              </div>

              {/* Content */}
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {benefit.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>

        {/* Statistics */}
        <div className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="text-3xl font-bold text-blue-600 mb-2">50K+</div>
            <div className="text-gray-600">Happy Customers</div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="text-3xl font-bold text-green-600 mb-2">99.8%</div>
            <div className="text-gray-600">Satisfaction Rate</div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="text-3xl font-bold text-purple-600 mb-2">1000+</div>
            <div className="text-gray-600">Products Available</div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="text-3xl font-bold text-orange-600 mb-2">24/7</div>
            <div className="text-gray-600">Support Available</div>
          </div>
        </div>
      </div>
    </section>
  );
}