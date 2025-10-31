import React from 'react';
import { Ruler, Weight, Apple, Dumbbell } from 'lucide-react';

const QuickLink = ({ setActiveTab }) => {
  const actions = [
    {
      id: 'measurements',
      icon: <Ruler className="text-red-500 mx-auto mb-2 sm:mb-3 group-hover:scale-110 transition-transform" size={28} />,
      title: 'Track Progress',
      subtitle: 'Body measurements',
      gradient: 'from-red-500/20 to-red-600/10',
      border: 'border-red-500/30',
      hover: 'hover:from-red-500/30',
    },
    {
      id: 'bmi',
      icon: <Weight className="text-blue-500 mx-auto mb-2 sm:mb-3 group-hover:scale-110 transition-transform" size={28} />,
      title: 'BMI Check',
      subtitle: 'Calculate your BMI',
      gradient: 'from-blue-500/20 to-blue-600/10',
      border: 'border-blue-500/30',
      hover: 'hover:from-blue-500/30',
    },
    {
      id: 'diet',
      icon: <Apple className="text-green-500 mx-auto mb-2 sm:mb-3 group-hover:scale-110 transition-transform" size={28} />,
      title: 'Diet Plan',
      subtitle: 'Nutrition guide',
      gradient: 'from-green-500/20 to-green-600/10',
      border: 'border-green-500/30',
      hover: 'hover:from-green-500/30',
    },
    {
      id: 'workout',
      icon: <Dumbbell className="text-purple-500 mx-auto mb-2 sm:mb-3 group-hover:scale-110 transition-transform" size={28} />,
      title: 'Workout Log',
      subtitle: 'Track exercises',
      gradient: 'from-purple-500/20 to-purple-600/10',
      border: 'border-purple-500/30',
      hover: 'hover:from-purple-500/30',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {actions.map((action) => (
        <button
          key={action.id}
          onClick={() => setActiveTab(action.id)}
          className={`bg-gradient-to-br ${action.gradient} border ${action.border} rounded-lg sm:rounded-xl p-4 sm:p-6 ${action.hover} transition-all group flex flex-col items-center justify-center text-center`}
        >
          {action.icon}
          <p className="text-white font-semibold text-xs sm:text-sm">{action.title}</p>
          <p className="text-gray-400 text-[10px] sm:text-xs mt-1 hidden sm:block">{action.subtitle}</p>
        </button>
      ))}
    </div>
  );
};

export default QuickLink;
