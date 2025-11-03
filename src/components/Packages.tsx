import { useState, useEffect } from 'react';
import { Check, X, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

interface FeatureItem {
  name: string;
  available: boolean;
  hidden: boolean;
  order: number;
}

interface Package {
  package_id: string;
  package_name: string;
  description: string;
  duration_days: number;
  price: number;
  features: FeatureItem[];
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

      // Parse features if they are strings and filter/sort them
      const parsedData = (data || []).map(pkg => {
        let parsedFeatures: FeatureItem[] = [];
        
        if (pkg.features && Array.isArray(pkg.features)) {
          parsedFeatures = pkg.features
            .map((f: any) => {
              // If feature is a string, parse it
              if (typeof f === 'string') {
                try {
                  return JSON.parse(f);
                } catch (e) {
                  console.error('Error parsing feature:', f, e);
                  return null;
                }
              }
              // If already an object, ensure it has all required properties
              return {
                name: f.name || '',
                available: f.available !== undefined ? f.available : true,
                hidden: f.hidden !== undefined ? f.hidden : false,
                order: f.order !== undefined ? f.order : 0,
              };
            })
            .filter((f: any) => f !== null && !f.hidden) // Filter out null and hidden features
            .sort((a: any, b: any) => (a.order || 0) - (b.order || 0)); // Sort by order
        }

        return {
          ...pkg,
          features: parsedFeatures
        };
      });

      setPackages(parsedData);
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
      <section id="packages" className="scroll-mt-16 py-5 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center min-h-[300px] sm:min-h-[400px]">
            <div className="text-center">
              <Loader2 className="animate-spin mx-auto mb-4 text-red-500" size={40} />
              <p className="text-gray-600 text-sm sm:text-base">Loading packages...</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="packages" className="scroll-mt-16 py-5 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center min-h-[300px] sm:min-h-[400px]">
            <div className="text-center">
              <AlertCircle className="mx-auto mb-4 text-red-500" size={40} />
              <p className="text-red-600 font-semibold mb-2 text-sm sm:text-base">Failed to Load Packages</p>
              <p className="text-gray-600 mb-4 text-xs sm:text-sm px-4">{error}</p>
              <button
                onClick={fetchPackages}
                className="bg-red-500 text-white px-5 py-2 sm:px-6 sm:py-2.5 rounded-lg hover:bg-red-600 transition-colors text-sm sm:text-base"
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
      <section id="packages" className="scroll-mt-16 py-5 sm:scroll-mt-10 sm:py-10 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Membership Packages</h2>
            <p className="text-gray-600 text-sm sm:text-base">No packages available at the moment.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="packages" className="scroll-mt-14 sm:scroll-mt-10 py-5 sm:py-10 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12 lg:mb-16">
          <h2 className="text-2xl sm:text-3xl lg:text-3xl font-bold text-gray-900 mb-2 sm:mb-4">
            Membership Packages
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto px-4">
            Choose the perfect plan for your fitness journey. All packages include access to our 
            world-class facilities and expert guidance.
          </p>
        </div>

        <div className={`grid grid-cols-2 gap-3 sm:gap-6 lg:gap-8 ${
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
                className={`relative p-4 sm:p-6 lg:p-8 rounded-xl sm:rounded-2xl flex flex-col ${
                  popular
                    ? 'bg-red-500 text-white shadow-xl sm:shadow-2xl sm:scale-105' 
                    : 'bg-gray-50 text-gray-900 shadow-md sm:shadow-lg'
                }`}
              >
                {popular && (
                  <div className="absolute -top-3 sm:-top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-yellow-400 text-black px-2 sm:px-4 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-sm font-semibold whitespace-nowrap">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-4 sm:mb-6 lg:mb-8">
                  <h3 className="text-sm sm:text-lg lg:text-2xl font-bold mb-1 sm:mb-2">
                    {pkg.package_name}
                  </h3>
                  {pkg.description && (
                    <p className={`text-[10px] sm:text-xs lg:text-sm mb-2 sm:mb-4 ${popular ? 'text-red-100' : 'text-gray-600'} line-clamp-2`}>
                      {pkg.description}
                    </p>
                  )}
                  <div className="flex items-end justify-center gap-0.5 sm:gap-1">
                    <span className="text-lg sm:text-2xl lg:text-4xl font-bold">
                      {formatPrice(pkg.price)}
                    </span>
                    <span className={`text-[10px] sm:text-sm lg:text-lg ${popular ? 'text-red-100' : 'text-gray-500'} pb-0.5 sm:pb-1`}>
                      {getDurationText(pkg.duration_days)}
                    </span>
                  </div>
                </div>

                <div className="mb-4 sm:mb-6 lg:mb-8 flex-grow">
                  <ul className="space-y-1.5 sm:space-y-2 lg:space-y-3 max-h-[140px] sm:max-h-[160px] lg:max-h-[180px] overflow-y-auto pr-1 feature-scroll">
                    <style>{`
                      .feature-scroll {
                        scrollbar-width: thin;
                        scrollbar-color: ${popular ? 'rgba(255,255,255,0.3)' : 'rgba(239,68,68,0.3)'} transparent;
                      }
                      .feature-scroll::-webkit-scrollbar {
                        width: 4px;
                      }
                      .feature-scroll::-webkit-scrollbar-track {
                        background: transparent;
                      }
                      .feature-scroll::-webkit-scrollbar-thumb {
                        background: ${popular ? 'rgba(255,255,255,0.3)' : 'rgba(239,68,68,0.3)'};
                        border-radius: 10px;
                      }
                      .feature-scroll::-webkit-scrollbar-thumb:hover {
                        background: ${popular ? 'rgba(255,255,255,0.5)' : 'rgba(239,68,68,0.5)'};
                      }
                    `}</style>
                    {pkg.features && pkg.features.length > 0 ? (
                      <>
                        {pkg.features.slice(0, 7).map((feature, featureIndex) => (
                          <li key={featureIndex} className="flex items-start">
                            {feature.available ? (
                              <Check className={`h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 mr-1.5 sm:mr-2 lg:mr-3 flex-shrink-0 mt-0.5 ${
                                popular ? 'text-white' : 'text-green-500'
                              }`} />
                            ) : (
                              <X className={`h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 mr-1.5 sm:mr-2 lg:mr-3 flex-shrink-0 mt-0.5 ${
                                popular ? 'text-red-200' : 'text-red-500'
                              }`} />
                            )}
                            <span className={`text-[10px] sm:text-xs lg:text-base leading-tight ${
                              !feature.available ? (popular ? 'line-through text-red-100 opacity-70' : 'line-through text-gray-400') : ''
                            }`}>
                              {feature.name}
                            </span>
                          </li>
                        ))}
                        {pkg.features.length > 7 && (
                          <>
                            {pkg.features.slice(7).map((feature, featureIndex) => (
                              <li key={featureIndex + 7} className="flex items-start">
                                {feature.available ? (
                                  <Check className={`h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 mr-1.5 sm:mr-2 lg:mr-3 flex-shrink-0 mt-0.5 ${
                                    popular ? 'text-white' : 'text-green-500'
                                  }`} />
                                ) : (
                                  <X className={`h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 mr-1.5 sm:mr-2 lg:mr-3 flex-shrink-0 mt-0.5 ${
                                    popular ? 'text-red-200' : 'text-red-500'
                                  }`} />
                                )}
                                <span className={`text-[10px] sm:text-xs lg:text-base leading-tight ${
                                  !feature.available ? (popular ? 'line-through text-red-100 opacity-70' : 'line-through text-gray-400') : ''
                                }`}>
                                  {feature.name}
                                </span>
                              </li>
                            ))}
                          </>
                        )}
                      </>
                    ) : (
                      <li className="flex items-start">
                        <Check className={`h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 mr-1.5 sm:mr-2 lg:mr-3 flex-shrink-0 mt-0.5 ${
                          popular ? 'text-white' : 'text-green-500'
                        }`} />
                        <span className="text-[10px] sm:text-xs lg:text-base leading-tight">
                          Full gym access for {pkg.duration_days} days
                        </span>
                      </li>
                    )}
                  </ul>
                  {pkg.features && pkg.features.length > 7 && (
                    <p className={`text-[10px] sm:text-xs italic mt-2 ${popular ? 'text-red-100' : 'text-gray-500'}`}>
                      +{pkg.features.length - 7} more features (scroll to see)
                    </p>
                  )}
                </div>

                <button 
                  className={`w-full py-1.5 sm:py-2 lg:py-3 rounded-md sm:rounded-lg font-semibold transition-colors text-[11px] sm:text-sm lg:text-base mt-auto ${
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
        <div className="mt-8 sm:mt-12 lg:mt-16 text-center px-4">
          <p className="text-gray-600 mb-2 sm:mb-4 text-xs sm:text-sm lg:text-base">
            All packages include locker facility and expert guidance.
          </p>
          <p className="text-gray-900 font-semibold text-sm sm:text-base lg:text-lg">
            Ready to transform your fitness journey? Contact us to get started!
          </p>
          <button
            onClick={() => {
              const contactSection = document.getElementById('contact');
              if (contactSection) {
                contactSection.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="mt-4 sm:mt-6 bg-red-500 text-white px-6 py-2 sm:px-8 sm:py-3 rounded-lg font-semibold hover:bg-red-600 transition-colors inline-flex items-center gap-2 text-sm sm:text-base"
          >
            Contact Us for Enquiry
          </button>
        </div>
      </div>
    </section>
  );
};

export default Packages;