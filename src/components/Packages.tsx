import { useState, useEffect } from 'react';
import { Check, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

interface Package {
  package_id: string;
  package_name: string;
  description: string;
  duration_days: number;
  price: number;
  features: string[];
  is_active: boolean;
  is_popular: boolean;
  created_at: string;
  updated_at: string;
}

const Packages = () => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('packages')
        .select('*')
        .eq('is_active', true)
        .order('price', { ascending: true });

      if (error) throw error;

      setPackages(data || []);
    } catch (err: any) {
      console.error('Error fetching packages:', err);
      setError('Failed to load packages. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to format price
  const formatPrice = (price: number) => {
    return `₹${price.toLocaleString('en-IN')}`;
  };

  // Helper function to get duration text
  const getDurationText = (days: number) => {
    if (days === 30) return '/month';
    if (days === 90) return '/3 months';
    if (days === 180) return '/6 months';
    if (days === 365) return '/year';
    return `/${days} days`;
  };

  const handleEnquiry = (packageName: string) => {
    const contactSection = document.getElementById('contact');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
      // Store selected package in sessionStorage so contact form can use it
      sessionStorage.setItem('selectedPackage', packageName);
    }
  };

  if (loading) {
    return (
      <section id="packages" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="animate-spin mx-auto mb-4 text-red-500" size={48} />
              <p className="text-gray-600">Loading packages...</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="packages" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <AlertCircle className="mx-auto mb-4 text-red-500" size={48} />
              <p className="text-red-600 font-semibold mb-2">Failed to Load Packages</p>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={fetchPackages}
                className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (packages.length === 0) {
    return (
      <section id="packages" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Membership Packages</h2>
            <p className="text-gray-600">No packages available at the moment.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="packages" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Membership Packages</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Choose the perfect plan for your fitness journey. All packages include access to our 
            world-class facilities and expert guidance.
          </p>
        </div>

        <div className={`grid grid-cols-1 gap-8 ${
          packages.length === 2 ? 'md:grid-cols-2 max-w-4xl mx-auto' :
          packages.length === 3 ? 'md:grid-cols-3' :
          packages.length === 4 ? 'md:grid-cols-2 lg:grid-cols-4' :
          'md:grid-cols-2 lg:grid-cols-3'
        }`}>
          {packages.map((pkg) => {
            const popular = pkg.is_popular;
            
            return (
              <div 
                key={pkg.package_id} 
                className={`relative p-8 rounded-2xl ${
                  popular
                    ? 'bg-red-500 text-white shadow-2xl scale-105' 
                    : 'bg-gray-50 text-gray-900 shadow-lg'
                }`}
              >
                {popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-yellow-400 text-black px-4 py-1 rounded-full text-sm font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold mb-2">{pkg.package_name}</h3>
                  {pkg.description && (
                    <p className={`text-sm mb-4 ${popular ? 'text-red-100' : 'text-gray-600'}`}>
                      {pkg.description}
                    </p>
                  )}
                  <div className="flex items-end justify-center">
                    <span className="text-4xl font-bold">{formatPrice(pkg.price)}</span>
                    <span className={`text-lg ${popular ? 'text-red-100' : 'text-gray-500'}`}>
                      {getDurationText(pkg.duration_days)}
                    </span>
                  </div>
                </div>

                <ul className="space-y-4 mb-8">
                  {pkg.features && pkg.features.length > 0 ? (
                    pkg.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center">
                        <Check className={`h-5 w-5 mr-3 flex-shrink-0 ${popular ? 'text-white' : 'text-red-500'}`} />
                        <span>{feature}</span>
                      </li>
                    ))
                  ) : (
                    <li className="flex items-center">
                      <Check className={`h-5 w-5 mr-3 flex-shrink-0 ${popular ? 'text-white' : 'text-red-500'}`} />
                      <span>Full gym access for {pkg.duration_days} days</span>
                    </li>
                  )}
                </ul>

                <button 
                  className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                    popular
                      ? 'bg-white text-red-500 hover:bg-gray-100'
                      : 'bg-red-500 text-white hover:bg-red-600'
                  }`}
                  onClick={() => handleEnquiry(pkg.package_name)}
                >
                  Get Started
                </button>
              </div>
            );
          })}
        </div>

        {/* Additional info section */}
        <div className="mt-16 text-center">
          <p className="text-gray-600 mb-4">
            All packages include locker facility and expert guidance.
          </p>
          <p className="text-gray-900 font-semibold">
            Ready to transform your fitness journey? Contact us to get started!
          </p>
          <button
            onClick={() => {
              const contactSection = document.getElementById('contact');
              if (contactSection) {
                contactSection.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="mt-6 bg-red-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-600 transition-colors inline-flex items-center gap-2"
          >
            Contact Us for Enquiry
          </button>
        </div>
      </div>
    </section>
  );
};

export default Packages;