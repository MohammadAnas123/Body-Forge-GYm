const Hero = () => {
  return (
    <section id="home" className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
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
      
      {/* Dark overlay for better text readability */}
      <div className="absolute inset-0 bg-black opacity-50"></div>
      
      {/* Hero Content */}
      <div className="relative z-10 text-center text-white px-4">
        <h1 className="text-6xl md:text-8xl font-bold mb-6">
          BODY<span className="text-red-500">FORGE</span>
        </h1>
        <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
          Transform your body, elevate your mind, and unleash your potential at the ultimate fitness destination.
        </p>
        <div className="space-x-4">
          <button 
          onClick={() => {
              const contactSection = document.getElementById('contact');
              if (contactSection) {
                contactSection.scrollIntoView({ behavior: 'smooth' });
              }
            }}
          className="bg-red-500 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-red-600 transition-colors">
            Start Your Journey
          </button>
          <button 
          onClick={() => {
              const contactSection = document.getElementById('packages');
              if (contactSection) {
                contactSection.scrollIntoView({ behavior: 'smooth' });
              }
            }}
          className="border-2 border-white text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-white hover:text-black transition-colors">
            View Packages
          </button>
        </div>
      </div>
    </section>
  );
};

export default Hero;