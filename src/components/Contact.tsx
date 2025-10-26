import { useState } from "react";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { supabase } from "../lib/supabaseClient";

const Contact = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");

  const contactInfo = [
    {
      icon: <MapPin className="h-6 w-6 text-red-500" />,
      title: "Address",
      details: "123 Fitness Street, Health City, HC 12345",
    },
    {
      icon: <Phone className="h-6 w-6 text-red-500" />,
      title: "Phone",
      details: "+91 98765 43210",
    },
    {
      icon: <Mail className="h-6 w-6 text-red-500" />,
      title: "Email",
      details: "info@superfit.com",
    },
    {
      icon: <Clock className="h-6 w-6 text-red-500" />,
      title: "Hours",
      details: "24/7 for Premium Members\n6 AM - 11 PM for Basic Members",
    },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!name.trim() || !email.trim() || !phone.trim() || !message.trim()) {
      setStatus("error|❌ Please fill all the fields.");
      setTimeout(() => setStatus(""), 3000);
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setStatus("error|❌ Please enter a valid email address.");
      setTimeout(() => setStatus(""), 3000);
      return;
    }

    // Phone validation (10 digits)
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phone.replace(/\s/g, ""))) {
      setStatus("error|❌ Please enter a valid 10-digit phone number.");
      setTimeout(() => setStatus(""), 3000);
      return;
    }

    try {
      const { error } = await supabase
      .from("user_messages")
      .insert([{ name, email, phone, message }]);
      
      if (error) {
        console.error(error.message);
        setStatus("error|❌ Something went wrong. Please try again!");
      } else {
        setStatus("success|✅ Message sent successfully! We'll get back to you soon.");
        setName("");
        setEmail("");
        setPhone("");
        setMessage("");
      }
    } catch (err) {
      setStatus("error|❌ Network error. Please check your connection and try again.");
    }
    
    setTimeout(() => setStatus(""), 5000);
  };

  return (
    <section id="contact" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Get in Touch</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Ready to start your fitness journey? Contact us today for a free
            consultation and tour.
          </p>
        </div>

        {/* Image with Form Overlay */}
        <div className="relative h-[700px] rounded-xl overflow-hidden">
          {/* Base Gym Image */}
          <img
            src="https://static.wixstatic.com/media/11062b_9e39386b55ce427089291489acff707d~mv2.jpg/v1/fill/w_1905,h_882,fp_0.14_0.53,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/11062b_9e39386b55ce427089291489acff707d~mv2.jpg"
            alt="Gym training"
            className="w-full h-full object-cover object-center"
          />
          
          {/* Halftone Dot Pattern Overlay */}
          <div 
            className="absolute inset-0"
            style={{
              backgroundImage: `
                radial-gradient(circle at center, rgba(0,0,0,0.7) 1px, transparent 1px),
                radial-gradient(circle at center, rgba(0,0,0,0.7) 1px, transparent 1px)
              `,
              backgroundSize: '6px 6px, 6px 6px',
              backgroundPosition: '0 0, 3px 3px'
            }}
          ></div>
          
          {/* Dark Gradient for Text Readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/30"></div>
          
          {/* Content Container */}
          <div className="absolute inset-0 flex items-center justify-between p-8 md:p-12 lg:p-16">
            {/* Left Side - Text Content */}
            <div className="flex-1 max-w-md space-y-6">
              <div className="space-y-4">
                <h3 className="text-5xl font-bold text-white leading-tight">
                  Start Your<br />Fitness Journey
                </h3>
                <div className="w-16 h-1 bg-red-500"></div>
                <p className="text-xl text-gray-200 leading-relaxed">
                  Connect with our expert team and discover how we can help you achieve your fitness goals
                </p>
              </div>
            </div>

            {/* Right Side - Contact Form */}
            <div className="flex-1 max-w-md ml-8">
              <h3 className="text-3xl font-bold text-white mb-6">
                Send us a Message
              </h3>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Your Name"
                  className="w-full px-4 py-3 bg-white/90 backdrop-blur-sm border-2 border-white/50 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:bg-white transition-all"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <input
                  type="email"
                  placeholder="Your Email"
                  className="w-full px-4 py-3 bg-white/90 backdrop-blur-sm border-2 border-white/50 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:bg-white transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <input
                  type="tel"
                  placeholder="Your Phone"
                  className="w-full px-4 py-3 bg-white/90 backdrop-blur-sm border-2 border-white/50 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:bg-white transition-all"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
                <textarea
                  rows={4}
                  placeholder="Your Message"
                  className="w-full px-4 py-3 bg-white/90 backdrop-blur-sm border-2 border-white/50 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:bg-white resize-none transition-all"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                ></textarea>
                <button
                  onClick={handleSubmit}
                  className="w-full bg-red-500 text-white py-4 rounded-lg text-lg font-bold hover:bg-red-600 hover:scale-105 transition-all shadow-lg hover:shadow-xl"
                >
                  Send Message
                </button>
              </div>
              {status && (
                <div 
                  className={`mt-4 text-center text-white font-bold text-lg backdrop-blur-sm py-3 px-4 rounded-lg ${
                    status.startsWith("success") 
                      ? "bg-green-500/90" 
                      : "bg-red-500/90"
                  }`}
                >
                  {status.split("|")[1]}
                </div>
              )}
            </div>
          </div>
        </div>

        
      </div>
    </section>
  );
};

export default Contact;