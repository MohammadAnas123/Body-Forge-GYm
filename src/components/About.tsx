
import { Dumbbell, Users, Trophy, Clock } from 'lucide-react';

const About = () => {
  const features = [
    {
      icon: <Dumbbell className="h-12 w-12 text-red-500" />,
      title: "Premium Equipment",
      description: "State-of-the-art fitness equipment and machines for all your workout needs."
    },
    {
      icon: <Users className="h-12 w-12 text-red-500" />,
      title: "Expert Trainers",
      description: "Certified personal trainers to guide you through your fitness journey."
    },
    {
      icon: <Trophy className="h-12 w-12 text-red-500" />,
      title: "Proven Results",
      description: "Thousands of success stories from our dedicated members."
    },
    {
      icon: <Clock className="h-12 w-12 text-red-500" />,
      title: "24/7 Access",
      description: "Train on your schedule with round-the-clock gym access."
    }
  ];

  return (
    <section id="about" className="py-20 bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">About Body Forge</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We're more than just a gym. We're a community dedicated to helping you achieve your fitness goals 
            and live a healthier, stronger life.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="text-center p-6 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex justify-center mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h3 className="text-3xl font-bold text-gray-900 mb-6">Why Choose SuperFit?</h3>
            <p className="text-lg text-gray-600 mb-6">
              At SuperFit, we believe fitness is not just about physical transformation—it's about building 
              confidence, discipline, and a lifestyle that empowers you to be your best self.
            </p>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-center">
                <span className="w-2 h-2 bg-red-500 rounded-full mr-3"></span>
                Modern facilities with the latest equipment
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-red-500 rounded-full mr-3"></span>
                Personalized training programs
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-red-500 rounded-full mr-3"></span>
                Nutritional guidance and meal planning
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-red-500 rounded-full mr-3"></span>
                Supportive community environment
              </li>
            </ul>
          </div>
          <div className="bg-gray-300 h-96 rounded-lg flex items-center justify-center">
            <span className="text-gray-500 text-lg">Gym Interior Photo</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
