import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

export function Footer() {
  const footerLinks = {
    company: [
      { name: 'About Us', href: '/about' },
      { name: 'Careers', href: '/careers' },
      { name: 'Press', href: '/press' },
      { name: 'Blog', href: '/blog' }
    ],
    support: [
      { name: 'Contact Us', href: '/contact' },
      { name: 'Help Center', href: '/help' },
      { name: 'Warranty', href: '/warranty' },
      { name: 'Returns', href: '/returns' }
    ],
    legal: [
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Terms of Service', href: '/terms' },
      { name: 'Cookie Policy', href: '/cookies' },
      { name: 'GDPR', href: '/gdpr' }
    ]
  };

  const socialLinks = [
    { name: 'Facebook', icon: '📘', href: 'https://facebook.com/techhub' },
    { name: 'Twitter', icon: '🐦', href: 'https://twitter.com/techhub' },
    { name: 'Instagram', icon: '📷', href: 'https://instagram.com/techhub' },
    { name: 'YouTube', icon: '📺', href: 'https://youtube.com/techhub' },
    { name: 'LinkedIn', icon: '💼', href: 'https://linkedin.com/company/techhub' }
  ];

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <div className="flex items-center mb-4">
              <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                🔌 TechHub
              </div>
            </div>
            <p className="text-gray-300 mb-6 max-w-md">
              Your premier destination for cutting-edge electronics. From smartphones to smart homes, 
              we bring you the future of technology today.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-2 text-sm text-gray-300">
              <div className="flex items-center">
                <span className="mr-2">📧</span>
                <span>support@techhub.com</span>
              </div>
              <div className="flex items-center">
                <span className="mr-2">📞</span>
                <span>1-800-TECH-HUB</span>
              </div>
              <div className="flex items-center">
                <span className="mr-2">📍</span>
                <span>123 Tech Street, Silicon Valley, CA</span>
              </div>
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <a 
                    href={link.href}
                    className="text-gray-300 hover:text-white transition-colors duration-200 text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <a 
                    href={link.href}
                    className="text-gray-300 hover:text-white transition-colors duration-200 text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <a 
                    href={link.href}
                    className="text-gray-300 hover:text-white transition-colors duration-200 text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Separator className="my-8 bg-gray-700" />

        {/* Bottom Footer */}
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          {/* Copyright */}
          <div className="text-sm text-gray-400">
            © 2024 TechHub Electronics. All rights reserved. 
            <span className="ml-2">Made with ❤️ for tech enthusiasts</span>
          </div>

          {/* Social Links */}
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-400 mr-2">Follow us:</span>
            {socialLinks.map((social) => (
              <Button
                key={social.name}
                variant="ghost"
                size="sm"
                className="text-gray-300 hover:text-white hover:bg-gray-800 p-2"
                onClick={() => window.open(social.href, '_blank')}
              >
                <span className="text-lg">{social.icon}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-8 flex justify-center items-center space-x-8 flex-wrap">
          <div className="flex items-center space-x-2 text-sm text-gray-400">
            <span>🔒</span>
            <span>SSL Secured</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-400">
            <span>💳</span>
            <span>Secure Payments</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-400">
            <span>📦</span>
            <span>Fast Shipping</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-400">
            <span>✅</span>
            <span>Verified Reviews</span>
          </div>
        </div>
      </div>
    </footer>
  );
}