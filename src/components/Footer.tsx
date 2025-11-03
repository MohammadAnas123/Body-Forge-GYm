import { MapPin, Phone, Mail, Clock, ChevronRight } from 'lucide-react';

const Footer = () => {
  const gymName = import.meta.env.VITE_GYM_NAME || 'Body Forge';
  
  // Replace these with your actual gym details
  const gymLocation = {
    address: "123 Fitness Street, Hazratganj, Lucknow, Uttar Pradesh 226001",
    phone: "+91 98765 43210",
    email: "info@mygym.com",
    coordinates: {
      lat: 26.8467,
      lng: 80.9462
    },
    mapEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3559.2064456287845!2d80.94399631504277!3d26.846695983144995!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x399bfd991f32b16b%3A0x93ccba8909978be7!2sHazratganj%2C%20Lucknow%2C%20Uttar%20Pradesh!5e0!3m2!1sen!2sin!4v1234567890123!5m2!1sen!2sin"
  };

  return (
    <footer className="bg-gradient-to-b from-gray-900 to-black text-white">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-8">
          {/* About Section */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-1">
            <h3 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent mb-3 sm:mb-4">
              {gymName}
            </h3>
            <p className="text-gray-300 text-sm sm:text-base mb-4 leading-relaxed">
              Transform your body, elevate your mind, and unleash your potential at the ultimate fitness destination.
            </p>
            <div className="flex space-x-3">
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-9 h-9 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg flex items-center justify-center hover:from-red-500 hover:to-orange-500 transition-all duration-300 hover:scale-110 border border-gray-700"
              >
                <span className="text-sm font-semibold">f</span>
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-9 h-9 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg flex items-center justify-center hover:from-red-500 hover:to-orange-500 transition-all duration-300 hover:scale-110 border border-gray-700"
              >
                <span className="text-sm font-semibold">𝕏</span>
              </a>
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-9 h-9 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg flex items-center justify-center hover:from-red-500 hover:to-orange-500 transition-all duration-300 hover:scale-110 border border-gray-700"
              >
                <span className="text-sm font-semibold">📷</span>
              </a>
            </div>
          </div>
          
          {/* Quick Links - Hidden on mobile, visible on tablet+ */}
          <div className="hidden sm:block">
            <h4 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-white">Quick Links</h4>
            <ul className="space-y-2 text-gray-300 text-sm sm:text-base">
              <li>
                <a href="#home" className="hover:text-red-500 transition-colors inline-flex items-center group">
                  <ChevronRight className="w-4 h-4 mr-1 group-hover:translate-x-1 transition-transform" />
                  Home
                </a>
              </li>
              <li>
                <a href="#about" className="hover:text-red-500 transition-colors inline-flex items-center group">
                  <ChevronRight className="w-4 h-4 mr-1 group-hover:translate-x-1 transition-transform" />
                  About
                </a>
              </li>
              <li>
                <a href="#packages" className="hover:text-red-500 transition-colors inline-flex items-center group">
                  <ChevronRight className="w-4 h-4 mr-1 group-hover:translate-x-1 transition-transform" />
                  Packages
                </a>
              </li>
              <li>
                <a href="#gallery" className="hover:text-red-500 transition-colors inline-flex items-center group">
                  <ChevronRight className="w-4 h-4 mr-1 group-hover:translate-x-1 transition-transform" />
                  Gallery
                </a>
              </li>
              <li>
                <a href="#contact" className="hover:text-red-500 transition-colors inline-flex items-center group">
                  <ChevronRight className="w-4 h-4 mr-1 group-hover:translate-x-1 transition-transform" />
                  Contact
                </a>
              </li>
            </ul>
          </div>
          
          {/* Services - Hidden on mobile, visible on tablet+ */}
          <div className="hidden sm:block">
            <h4 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-white">Services</h4>
            <ul className="space-y-2 text-gray-300 text-sm sm:text-base">
              <li className="flex items-center">
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full mr-2"></div>
                Personal Training
              </li>
              <li className="flex items-center">
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full mr-2"></div>
                Group Classes
              </li>
              <li className="flex items-center">
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full mr-2"></div>
                Nutrition Counseling
              </li>
              <li className="flex items-center">
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full mr-2"></div>
                Fitness Assessment
              </li>
              <li className="flex items-center">
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full mr-2"></div>
                Meal Planning
              </li>
            </ul>
          </div>

          {/* Contact Info - Compact on mobile */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-1">
            <h4 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-white">Contact Us</h4>
            <ul className="space-y-3 text-gray-300 text-sm sm:text-base">
              <li className="flex items-start group hover:text-red-500 transition-colors">
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-xs sm:text-sm leading-relaxed">{gymLocation.address}</span>
              </li>
              <li className="flex items-center group">
                <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 mr-2 flex-shrink-0" />
                <a href={`tel:${gymLocation.phone}`} className="hover:text-red-500 transition-colors text-xs sm:text-sm">
                  {gymLocation.phone}
                </a>
              </li>
              <li className="flex items-center group">
                <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 mr-2 flex-shrink-0" />
                <a href={`mailto:${gymLocation.email}`} className="hover:text-red-500 transition-colors text-xs sm:text-sm break-all">
                  {gymLocation.email}
                </a>
              </li>
              <li className="flex items-start group">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                <div className="text-xs sm:text-sm">
                  <p>Mon-Sat: 6:00 AM - 10:00 PM</p>
                  <p className="text-gray-400">Sunday: 7:00 AM - 8:00 PM</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Google Map Section - Reduced height on mobile */}
        <div className="border-t border-gray-800 pt-6 sm:pt-8 mb-6 sm:mb-8">
          <h4 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-center text-white">Find Us Here</h4>
          <div className="w-full h-48 sm:h-64 lg:h-80 rounded-xl overflow-hidden shadow-lg">
            <iframe
              src={gymLocation.mapEmbedUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title={`${gymName} Location`}
            ></iframe>
          </div>
          <div className="text-center mt-4">
            <a
              href={`https://www.google.com/maps/dir//${gymLocation.coordinates.lat},${gymLocation.coordinates.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center bg-gradient-to-r from-red-500 to-orange-500 text-white px-5 py-2.5 rounded-lg hover:shadow-lg transition-all duration-300 font-semibold text-sm sm:text-base hover:scale-105"
            >
              <MapPin className="w-4 h-4 mr-2" />
              Get Directions
            </a>
          </div>
        </div>
        
        {/* Copyright */}
        <div className="border-t border-gray-800 pt-6 text-center text-gray-400 text-xs sm:text-sm">
          <p>&copy; 2025 {gymName} Gym. All rights reserved.</p>
          <p className="mt-2 text-gray-500">Designed with ❤️ for fitness enthusiasts</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;