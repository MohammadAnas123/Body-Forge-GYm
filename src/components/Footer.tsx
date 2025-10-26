import { MapPin, Phone, Mail, Clock } from 'lucide-react';

const Footer = () => {
  // Replace these with your actual gym details
  const gymLocation = {
    address: "123 Fitness Street, Hazratganj, Lucknow, Uttar Pradesh 226001",
    phone: "+91 98765 43210",
    email: "info@superfitgym.com",
    // Get this from Google Maps: Right-click on your location > "What's here?" > Copy coordinates
    coordinates: {
      lat: 26.8467,
      lng: 80.9462
    },
    // Get embed URL from Google Maps: Search your location > Share > Embed a map > Copy HTML
    mapEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3559.2064456287845!2d80.94399631504277!3d26.846695983144995!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x399bfd991f32b16b%3A0x93ccba8909978be7!2sHazratganj%2C%20Lucknow%2C%20Uttar%20Pradesh!5e0!3m2!1sen!2sin!4v1234567890123!5m2!1sen!2sin"
  };

  return (
    <footer className="bg-black text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* About Section */}
          <div className="col-span-1 lg:col-span-1">
            <h3 className="text-2xl font-bold text-red-500 mb-4">Body Forge</h3>
            <p className="text-gray-300 mb-4">
              Transform your body, elevate your mind, and unleash your potential at the ultimate fitness destination.
            </p>
            <div className="flex space-x-4">
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-8 h-8 bg-gray-700 rounded flex items-center justify-center hover:bg-red-500 cursor-pointer transition-colors"
              >
                <span className="text-sm">f</span>
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-8 h-8 bg-gray-700 rounded flex items-center justify-center hover:bg-red-500 cursor-pointer transition-colors"
              >
                <span className="text-sm">t</span>
              </a>
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-8 h-8 bg-gray-700 rounded flex items-center justify-center hover:bg-red-500 cursor-pointer transition-colors"
              >
                <span className="text-sm">i</span>
              </a>
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-gray-300">
              <li><a href="#home" className="hover:text-red-500 transition-colors">Home</a></li>
              <li><a href="#about" className="hover:text-red-500 transition-colors">About</a></li>
              <li><a href="#packages" className="hover:text-red-500 transition-colors">Packages</a></li>
              <li><a href="#gallery" className="hover:text-red-500 transition-colors">Gallery</a></li>
              <li><a href="#contact" className="hover:text-red-500 transition-colors">Contact</a></li>
            </ul>
          </div>
          
          {/* Services */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Services</h4>
            <ul className="space-y-2 text-gray-300">
              <li>Personal Training</li>
              <li>Group Classes</li>
              <li>Nutrition Counseling</li>
              <li>Fitness Assessment</li>
              <li>Meal Planning</li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-start">
                <MapPin className="w-5 h-5 text-red-500 mr-2 mt-1 flex-shrink-0" />
                <span className="text-sm">{gymLocation.address}</span>
              </li>
              <li className="flex items-center">
                <Phone className="w-5 h-5 text-red-500 mr-2 flex-shrink-0" />
                <a href={`tel:${gymLocation.phone}`} className="hover:text-red-500 transition-colors">
                  {gymLocation.phone}
                </a>
              </li>
              <li className="flex items-center">
                <Mail className="w-5 h-5 text-red-500 mr-2 flex-shrink-0" />
                <a href={`mailto:${gymLocation.email}`} className="hover:text-red-500 transition-colors">
                  {gymLocation.email}
                </a>
              </li>
              <li className="flex items-start">
                <Clock className="w-5 h-5 text-red-500 mr-2 mt-1 flex-shrink-0" />
                <div className="text-sm">
                  <p>Mon-Sat: 6:00 AM - 10:00 PM</p>
                  <p>Sunday: 7:00 AM - 8:00 PM</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Google Map Section */}
        <div className="border-t border-gray-800 pt-8 mb-8">
          <h4 className="text-xl font-semibold mb-4 text-center">Find Us Here</h4>
          <div className="w-full h-64 md:h-80 rounded-lg overflow-hidden">
            <iframe
              src={gymLocation.mapEmbedUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="SuperFit Gym Location"
            ></iframe>
          </div>
          <div className="text-center mt-4">
            <a
              href={`https://www.google.com/maps/dir//${gymLocation.coordinates.lat},${gymLocation.coordinates.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-red-500 hover:text-red-400 transition-colors font-semibold"
            >
              <MapPin className="w-4 h-4 mr-2" />
              Get Directions
            </a>
          </div>
        </div>
        
        {/* Copyright */}
        <div className="border-t border-gray-800 pt-8 text-center text-gray-300">
          <p>&copy; 2025 Body Forge Gym. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;