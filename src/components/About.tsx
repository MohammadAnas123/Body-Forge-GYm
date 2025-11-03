import { Dumbbell, Users, Trophy, Clock } from 'lucide-react';
import { useEffect, useState } from 'react';

const About = () => {
  const [mounted, setMounted] = useState(false);
  const gymName = import.meta.env.VITE_GYM_NAME || 'My GYM';

  const features = [
    {
      icon: <Dumbbell className="h-12 w-12 sm:h-14 sm:w-14 text-white" />,
      title: "Premium Equipment",
      description: "State-of-the-art fitness equipment and machines for all your workout needs.",
      gradient: "from-red-500 to-orange-500"
    },
    {
      icon: <Users className="h-12 w-12 sm:h-14 sm:w-14 text-white" />,
      title: "Expert Trainers",
      description: "Certified personal trainers to guide you through your fitness journey.",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      icon: <Trophy className="h-12 w-12 sm:h-14 sm:w-14 text-white" />,
      title: "Proven Results",
      description: "Thousands of success stories from our dedicated members.",
      gradient: "from-yellow-500 to-amber-500"
    },
    {
      icon: <Clock className="h-12 w-12 sm:h-14 sm:w-14 text-white" />,
      title: "24/7 Access",
      description: "Train on your schedule with round-the-clock gym access.",
      gradient: "from-purple-500 to-pink-500"
    }
  ];

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section id="about" className="scroll-mt-14 relative py-5 bg-gradient-to-b from-gray-50 via-white to-gray-50 overflow-hidden">
      {/* Subtle background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
        <div className="absolute top-20 left-10 w-64 h-64 bg-red-200 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-64 h-64 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Heading */}
        <div className={`text-center mb-16 transition-all duration-1000 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
          <h2 className="text-2xl sm:text-3xl md:text-3xl font-bold text-gray-900 mb-4">
            About <span className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">{gymName}</span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            We're more than just a gym. We're a community dedicated to helping you achieve your fitness goals and live a healthier, stronger life.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`group text-center p-6 bg-white rounded-xl shadow-lg transform transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 hover:scale-105 border border-gray-100`}
            >
              <div className={`flex justify-center mb-4 w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-gradient-to-br ${feature.gradient} rounded-2xl items-center shadow-lg transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                {feature.icon}
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 group-hover:text-red-500 transition-colors">{feature.title}</h3>
              <p className="text-gray-600 text-sm sm:text-base">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Why Choose Section */}
        <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 p-8 lg:p-0">
          <div className={`lg:p-12 transition-all duration-1000 ${mounted ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10"}`}>
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Why Choose <span className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">{gymName}?</span>
            </h3>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-6">
              At {gymName}, we believe fitness is not just about physical transformation—it's about building confidence, discipline, and a lifestyle that empowers you to be your best self.
            </p>
            <ul className="space-y-3">
              {[
                "Modern facilities with the latest equipment",
                "Personalized training programs",
                "Nutritional guidance and meal planning",
                "Supportive community environment"
              ].map((item, i) => (
                <li key={i} className="flex items-center transition-all duration-300 hover:translate-x-2 group">
                  <span className="w-2 h-2 bg-gradient-to-r from-red-500 to-orange-500 rounded-full mr-3 flex-shrink-0 group-hover:scale-150 transition-transform"></span>
                  <span className="text-gray-700 group-hover:text-red-500 transition-colors">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className={`relative bg-gradient-to-br from-red-100 to-orange-100 h-96 rounded-xl lg:rounded-none lg:rounded-r-2xl flex items-center justify-center overflow-hidden transform transition-all duration-1000 ${mounted ? "opacity-100 translate-x-0" : "opacity-0 translate-x-10"}`}>
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-orange-500/10"></div>
            <span className="text-gray-600 text-lg font-semibold relative z-10">Gym Interior Photo</span>
            {/* Decorative elements */}
            <div className="absolute top-6 right-6 w-20 h-20 bg-white/30 backdrop-blur-sm rounded-xl transform rotate-12"></div>
            <div className="absolute bottom-6 left-6 w-24 h-24 bg-white/20 backdrop-blur-sm rounded-xl transform -rotate-6"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;