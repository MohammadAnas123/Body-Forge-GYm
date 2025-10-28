import { useEffect, useState } from "react";

const Hero = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Trigger entrance animation after mount
    setMounted(true);
  }, []);

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 ease-out scale-100 sm:scale-105"
      >
        <source src="https://video.wixstatic.com/video/11062b_e2fe3f2568f04c639727a838bce1d32c/1080p/mp4/file.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Dot Matrix Pattern Overlay */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle, rgba(0, 0, 0, 0.4) 1px, transparent 1px)`,
          backgroundSize: '4px 4px'
        }}
      ></div>

      {/* Dark gradient overlay for better readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/60"></div>

      {/* Hero Content */}
      <div className={`relative z-10 text-center text-white px-4 transition-all duration-1000 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
        <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold mb-4 sm:mb-6">
          BODY<span className="text-red-500">FORGE</span>
        </h1>
        <p className="text-base sm:text-lg md:text-xl mb-6 sm:mb-8 max-w-md sm:max-w-3xl mx-auto">
          Transform your body, elevate your mind, and unleash your potential at the ultimate fitness destination.
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row sm:justify-center gap-4">
          <button 
            onClick={() => {
              const contactSection = document.getElementById('contact');
              if (contactSection) contactSection.scrollIntoView({ behavior: 'smooth' });
            }}
            className="bg-red-500 text-white px-6 sm:px-8 py-3 rounded-lg text-base sm:text-lg font-semibold hover:bg-red-600 transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 shadow-lg"
          >
            Start Your Journey
          </button>
          <button 
            onClick={() => {
              const packagesSection = document.getElementById('packages');
              if (packagesSection) packagesSection.scrollIntoView({ behavior: 'smooth' });
            }}
            className="border-2 border-white text-white px-6 sm:px-8 py-3 rounded-lg text-base sm:text-lg font-semibold hover:bg-white hover:text-black transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 shadow-lg"
          >
            View Packages
          </button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
