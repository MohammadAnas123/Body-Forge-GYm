import { useState, useEffect, useRef } from "react";
import { MapPin, Phone, Mail, Clock } from "lucide-react";

const Contact = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");
  const [animationStep, setAnimationStep] = useState(0);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && animationStep === 0) {
            // Step 1: Text appears in center
            setTimeout(() => {
              setAnimationStep(1);
            }, 300);
            
            // Step 2: Text moves to top
            setTimeout(() => {
              setAnimationStep(2);
            }, 1300);
            
            // Step 3: Form slides in from right
            setTimeout(() => {
              setAnimationStep(3);
            }, 2300);
          } else if (!entry.isIntersecting) {
            // Reset animation when scrolling away
            setAnimationStep(0);
          }
        });
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, [animationStep]);

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
      // Simulating API call - replace with your supabase call
      // const { error } = await supabase
      // .from("user_messages")
      // .insert([{ name, email, phone, message }]);
      
      // Simulated success
      setStatus("success|✅ Message sent successfully! We'll get back to you soon.");
      setName("");
      setEmail("");
      setPhone("");
      setMessage("");
    } catch (err) {
      setStatus("error|❌ Network error. Please check your connection and try again.");
    }
    
    setTimeout(() => setStatus(""), 5000);
  };

  return (
    <section ref={sectionRef} id="contact" className="scroll-mt-8 py-12 sm:scroll-mt-0 sm:py-16 lg:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Image with Form Overlay */}
        <div className="relative min-h-[600px] sm:min-h-[650px] lg:min-h-[700px] rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl">
          {/* Base Gym Image */}
          <img
            src="https://static.wixstatic.com/media/11062b_9e39386b55ce427089291489acff707d~mv2.jpg/v1/fill/w_1905,h_882,fp_0.14_0.53,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/11062b_9e39386b55ce427089291489acff707d~mv2.jpg"
            alt="Gym training"
            className="w-full h-full object-cover object-center absolute inset-0"
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
          
          {/* Dark Gradient for Text Readability - responsive */}
          <div className="absolute inset-0 bg-gradient-to-b lg:bg-gradient-to-r from-black/90 via-black/70 to-black/50 lg:from-black/80 lg:via-black/50 lg:to-black/30"></div>
          
          {/* Fixed Alert Notification - Overlays content */}
          {status && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-md">
              <div 
                className={`text-center text-white font-semibold text-sm sm:text-base backdrop-blur-md py-3 px-4 rounded-xl shadow-2xl border-2 animate-in slide-in-from-top duration-300 ${
                  status.startsWith("success") 
                    ? "bg-green-600/95 border-green-400" 
                    : "bg-red-600/95 border-red-400"
                }`}
              >
                {status.split("|")[1]}
              </div>
            </div>
          )}
          
          {/* Content Container - Responsive Layout */}
          <div className="absolute inset-0 flex flex-col lg:flex-row items-center justify-center lg:justify-between p-6 sm:p-8 lg:p-12 xl:p-16 overflow-hidden">
            {/* Text Content - Mobile: Starts Center, Moves to Top */}
            <div 
              className={`w-full space-y-3 sm:space-y-4 text-center transition-all duration-1000 ease-out absolute lg:relative
                ${animationStep === 0 ? 'opacity-0 scale-95 top-1/2 -translate-y-1/2' : ''}
                ${animationStep === 1 ? 'opacity-100 scale-100 top-1/2 -translate-y-1/2 lg:translate-y-0 lg:top-auto' : ''}
                ${animationStep >= 2 ? 'opacity-100 scale-100 top-8 translate-y-0 lg:top-auto' : ''}
                lg:flex-1 lg:max-w-md lg:text-left lg:mb-0
              `}
            >
              <div className="space-y-4 sm:space-y-3">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3 sm:mb-4">
                  Get in <span className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">Touch</span>
                </h2>
                <div className="w-20 lg:w-16 h-1 bg-red-500 mx-auto lg:mx-0"></div>
                <p className={`text-sm sm:text-base lg:text-xl text-gray-300 px-5 leading-relaxed max-w-md mx-auto lg:mx-0 transition-all duration-500 ${animationStep >= 2 ? 'opacity-100' : 'lg:opacity-100 opacity-70'}`}>
                  Ready to start your fitness journey? Contact us today for a free consultation and tour.
                </p>
              </div>
            </div>

            {/* Contact Form - Slides in from Right */}
            <div 
              className={`w-full transition-all duration-1000 ease-out mt-40 sm:mt-36 lg:mt-0
                lg:translate-x-0 lg:opacity-100 lg:pointer-events-auto lg:flex-1 lg:max-w-md lg:ml-8
              `}
            >
              <h3 className={`text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-3 sm:mb-4 lg:mb-6 text-center lg:text-left transition-all duration-700 ease-out lg:translate-x-0 lg:opacity-100
                ${animationStep < 3 ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'}
              `}>
                Send us a Message
              </h3>
              <div className="space-y-3 sm:space-y-4">
                <input
                  type="text"
                  placeholder="Your Name"
                  className={`w-full px-4 py-3 sm:py-3.5 bg-white/90 backdrop-blur-sm border-2 border-white/50 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:bg-white transition-all duration-700 ease-out text-gray-900 placeholder-gray-500 lg:translate-x-0 lg:opacity-100
                    ${animationStep < 3 ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'}
                  `}
                  style={{ transitionDelay: animationStep >= 3 ? '100ms' : '0ms' }}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <input
                  type="email"
                  placeholder="Your Email"
                  className={`w-full px-4 py-3 sm:py-3.5 bg-white/90 backdrop-blur-sm border-2 border-white/50 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:bg-white transition-all duration-700 ease-out text-gray-900 placeholder-gray-500 lg:translate-x-0 lg:opacity-100
                    ${animationStep < 3 ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'}
                  `}
                  style={{ transitionDelay: animationStep >= 3 ? '250ms' : '0ms' }}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <input
                  type="tel"
                  placeholder="Your Phone"
                  className={`w-full px-4 py-3 sm:py-3.5 bg-white/90 backdrop-blur-sm border-2 border-white/50 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:bg-white transition-all duration-700 ease-out text-gray-900 placeholder-gray-500 lg:translate-x-0 lg:opacity-100
                    ${animationStep < 3 ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'}
                  `}
                  style={{ transitionDelay: animationStep >= 3 ? '400ms' : '0ms' }}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
                <textarea
                  rows={3}
                  placeholder="Your Message"
                  className={`w-full px-4 py-3 sm:py-3.5 bg-white/90 backdrop-blur-sm border-2 border-white/50 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:bg-white resize-none transition-all duration-700 ease-out text-gray-900 placeholder-gray-500 lg:translate-x-0 lg:opacity-100
                    ${animationStep < 3 ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'}
                  `}
                  style={{ transitionDelay: animationStep >= 3 ? '550ms' : '0ms' }}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                ></textarea>
                <button
                  onClick={handleSubmit}
                  className={`w-full bg-gradient-to-r from-red-500 to-orange-500 text-white py-3 sm:py-4 rounded-lg text-base sm:text-lg font-bold hover:shadow-xl hover:scale-105 transition-all shadow-lg duration-700 ease-out lg:translate-x-0 lg:opacity-100
                    ${animationStep < 3 ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'}
                  `}
                  style={{ transitionDelay: animationStep >= 3 ? '700ms' : '0ms' }}
                >
                  Send Message
                </button>
              </div>
              
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;