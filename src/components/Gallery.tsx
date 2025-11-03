import { useState } from 'react';
import { X, ZoomIn, ChevronLeft, ChevronRight } from 'lucide-react';

const Gallery = () => {
  const gymName = import.meta.env.VITE_GYM_NAME || 'Body Forge';
  
  const images = [
    { name: "Cardio Section", gradient: "from-blue-500 to-cyan-500" },
    { name: "Weight Training Area", gradient: "from-red-500 to-orange-500" },
    { name: "Group Class Studio", gradient: "from-purple-500 to-pink-500" },
    { name: "Functional Training Zone", gradient: "from-green-500 to-emerald-500" },
    { name: "Locker Rooms", gradient: "from-yellow-500 to-amber-500" },
    { name: "Reception Area", gradient: "from-indigo-500 to-blue-500" }
  ];

  const [selectedImage, setSelectedImage] = useState(null);
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const openLightbox = (index) => {
    setSelectedImage(index);
  };

  const closeLightbox = () => {
    setSelectedImage(null);
  };

  const goToPrevious = () => {
    setSelectedImage((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setSelectedImage((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleKeyDown = (e) => {
    if (selectedImage !== null) {
      if (e.key === 'ArrowLeft') goToPrevious();
      if (e.key === 'ArrowRight') goToNext();
      if (e.key === 'Escape') closeLightbox();
    }
  };

  useState(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImage]);

  return (
    <section id="gallery" className=" scroll-mt-20 py-0 bg-gradient-to-b from-white via-gray-50 to-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-40 left-20 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-40 right-20 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }}></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl md:text-3xl font-bold text-gray-900 mb-4">
            Our <span className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">Facilities</span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            Take a virtual tour of our state-of-the-art gym facilities designed to inspire and motivate.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {images.map((image, index) => (
            <div
              key={index}
              className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden cursor-pointer transform hover:-translate-y border border-gray-100 hover:scale-105"
              onClick={() => openLightbox(index)}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {/* Image placeholder with gradient */}
              <div className={`h-64 bg-gradient-to-br ${image.gradient} relative overflow-hidden`}>
                {/* Title overlay at bottom - visible on hover */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-6 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <h3 className="text-lg font-semibold text-white">
                    {image.name}
                  </h3>
                </div>

                {/* Hover overlay with zoom icon */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <div className="transform scale-0 group-hover:scale-100 transition-transform duration-300">
                    <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
                      <ZoomIn className="h-8 w-8 text-white" />
                    </div>
                  </div>
                </div>

                {/* Animated corner accent */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/20 backdrop-blur-sm rounded-bl-3xl transform translate-x-12 -translate-y-12 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform duration-300"></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedImage !== null && (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn"
    onTouchStart={(e) => (window.touchStartX = e.touches[0].clientX)}
    onTouchEnd={(e) => {
      const touchEndX = e.changedTouches[0].clientX;
      if (window.touchStartX - touchEndX > 80) goToNext(); // swipe left → next
      else if (touchEndX - window.touchStartX > 80) goToPrevious(); // swipe right → previous
    }}
  >
    {/* Background blur and dark overlay */}
    <div className="absolute inset-0 backdrop-blur-md bg-black/70 transition-all duration-500"></div>

    {/* Image container */}
    <div className="relative max-w-6xl w-full rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-gray-800 to-gray-900 z-50">
      {/* Image area */}
      <div
        className={`h-[60vh] sm:h-[75vh] flex items-center justify-center bg-gradient-to-br ${images[selectedImage].gradient} relative`}
      >
        <div className="absolute inset-0 bg-black/30"></div>

        {/* Image text */}
        <div className="relative z-20 text-center">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl px-8 py-6">
            <h3 className="text-2xl sm:text-4xl font-bold text-white mb-3">
              {images[selectedImage].name}
            </h3>
            <div className="flex items-center justify-center gap-2">
              <div className="h-1 w-8 bg-white/50 rounded-full"></div>
              <p className="text-white/80 text-sm">
                {selectedImage + 1} / {images.length}
              </p>
              <div className="h-1 w-8 bg-white/50 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Navigation Buttons (only for medium+ screens) */}
        <button
          onClick={goToPrevious}
          className="hidden sm:flex absolute left-6 top-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white rounded-full p-3 transition-all duration-300 hover:scale-110 z-30"
          aria-label="Previous"
        >
          <ChevronLeft className="h-8 w-8" />
        </button>

        <button
          onClick={goToNext}
          className="hidden sm:flex absolute right-6 top-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white rounded-full p-3 transition-all duration-300 hover:scale-110 z-30"
          aria-label="Next"
        >
          <ChevronRight className="h-8 w-8" />
        </button>

        {/* Close button */}
        <button
          onClick={closeLightbox}
          className="absolute top-4 right-4 sm:top-6 sm:right-6 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white rounded-full p-3 transition-all duration-300 hover:rotate-90 z-30"
          aria-label="Close"
        >
          <X className="h-6 w-6" />
        </button>
      </div>
    </div>

    <style>{`
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      .animate-fadeIn {
        animation: fadeIn 0.3s ease-in-out;
      }
    `}</style>
  </div>
)}



    </section>
  );
};

export default Gallery;