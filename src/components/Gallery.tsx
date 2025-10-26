
const Gallery = () => {
  const images = [
    "Cardio Section",
    "Weight Training Area",
    "Group Class Studio",
    "Functional Training Zone",
    "Locker Rooms",
    "Reception Area"
  ];

  return (
    <section id="gallery" className="py-20 bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Facilities</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Take a virtual tour of our state-of-the-art gym facilities designed to inspire and motivate.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {images.map((image, index) => (
            <div 
              key={index} 
              className="bg-gray-300 h-64 rounded-lg shadow-lg hover:shadow-xl transition-shadow cursor-pointer flex items-center justify-center"
            >
              <span className="text-gray-600 text-lg font-medium">{image}</span>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <button className="bg-red-500 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-red-600 transition-colors">
            View All Photos
          </button>
        </div>
      </div>
    </section>
  );
};

export default Gallery;
