import { Dumbbell, Users, Trophy, Clock } from 'lucide-react';
import { useEffect, useState } from 'react';

const About = () => {
  const [mounted, setMounted] = useState(false);

  const features = [
    {
      icon: <Dumbbell className="h-12 w-12 sm:h-14 sm:w-14 text-red-500" />,
      title: "Premium Equipment",
      description: "State-of-the-art fitness equipment and machines for all your workout needs."
    },
    {
      icon: <Users className="h-12 w-12 sm:h-14 sm:w-14 text-red-500" />,
      title: "Expert Trainers",
      description: "Certified personal trainers to guide you through your fitness journey."
    },
    {
      icon: <Trophy className="h-12 w-12 sm:h-14 sm:w-14 text-red-500" />,
      title: "Proven Results",
      description: "Thousands of success stories from our dedicated members."
    },
    {
      icon: <Clock className="h-12 w-12 sm:h-14 sm:w-14 text-red-500" />,
      title: "24/7 Access",
      description: "Train on your schedule with round-the-clock gym access."
    }
  ];

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section id="about" className="relative py-20 bg-gradient-to-b from-gray-100 via-white to-gray-100 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className={`text-center mb-16 transition-all duration-1000 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">About Body Forge</h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            We're more than just a gym. We're a community dedicated to helping you achieve your fitness goals and live a healthier, stronger life.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`text-center p-6 bg-white rounded-lg shadow-lg transform transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 hover:scale-105`}
            >
              <div className="flex justify-center mb-4">
                {feature.icon}
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600 text-sm sm:text-base">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Why Choose Section */}
        <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className={`transition-all duration-1000 ${mounted ? "opacity-100 translate-x-0" : "opacity-0 translate-x-10"}`}>
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-6">Why Choose Body Forge?</h3>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-6">
              At Body Forge, we believe fitness is not just about physical transformation—it's about building confidence, discipline, and a lifestyle that empowers you to be your best self.
            </p>
            <ul className="space-y-3 text-gray-600">
              {[
                "Modern facilities with the latest equipment",
                "Personalized training programs",
                "Nutritional guidance and meal planning",
                "Supportive community environment"
              ].map((item, i) => (
                <li key={i} className="flex items-center transition-all duration-300 hover:text-red-500">
                  <span className="w-2 h-2 bg-red-500 rounded-full mr-3 flex-shrink-0"></span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className={`bg-gray-300 h-96 rounded-lg flex items-center justify-center overflow-hidden transform transition-transform duration-500 hover:scale-105 hover:shadow-xl`}>
            <span className="text-gray-500 text-lg">Gym Interior Photo</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
