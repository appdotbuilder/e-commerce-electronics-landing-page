import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { trpc } from '@/utils/trpc';
import type { CreateNewsletterSubscriptionInput } from '../../../server/src/schema';

export function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setMessage({ type: 'error', text: 'Please enter your email address' });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const subscriptionData: CreateNewsletterSubscriptionInput = { email };
      await trpc.createNewsletterSubscription.mutate(subscriptionData);
      
      setMessage({ 
        type: 'success', 
        text: '🎉 Successfully subscribed! You\'ll receive the latest tech deals and updates.' 
      });
      setEmail('');
    } catch (error) {
      console.error('Newsletter subscription failed:', error);
      setMessage({ 
        type: 'error', 
        text: 'Subscription failed. Please try again or contact support.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center text-white">
          {/* Section Header */}
          <div className="mb-8">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              📧 Stay Updated with TechHub
            </h2>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Get exclusive deals, early access to new products, and the latest tech news delivered to your inbox.
            </p>
          </div>

          {/* Newsletter Form */}
          <form onSubmit={handleSubmit} className="max-w-md mx-auto mb-6">
            <div className="flex gap-3">
              <Input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-white focus:ring-white"
                disabled={isLoading}
                required
              />
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-white text-blue-600 hover:bg-gray-100 font-semibold px-6 flex-shrink-0"
              >
                {isLoading ? 'Subscribing...' : 'Subscribe 🚀'}
              </Button>
            </div>
          </form>

          {/* Status Message */}
          {message && (
            <Alert className={`max-w-md mx-auto mb-6 ${
              message.type === 'success' 
                ? 'bg-green-100 border-green-300 text-green-800' 
                : 'bg-red-100 border-red-300 text-red-800'
            }`}>
              <AlertDescription className="text-center">
                {message.text}
              </AlertDescription>
            </Alert>
          )}

          {/* Benefits */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
              <div className="text-2xl mb-2">💸</div>
              <div className="font-semibold mb-1">Exclusive Deals</div>
              <div className="text-sm text-blue-100">Up to 50% off for subscribers</div>
            </div>
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
              <div className="text-2xl mb-2">🚀</div>
              <div className="font-semibold mb-1">Early Access</div>
              <div className="text-sm text-blue-100">New products before anyone</div>
            </div>
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
              <div className="text-2xl mb-2">📱</div>
              <div className="font-semibold mb-1">Tech Updates</div>
              <div className="text-sm text-blue-100">Latest tech news & reviews</div>
            </div>
          </div>

          {/* Privacy Note */}
          <p className="text-sm text-blue-200 mt-6">
            📧 We respect your privacy. Unsubscribe at any time. No spam, just great deals!
          </p>
        </div>
      </div>
    </section>
  );
}