import React from "react";
import {
  Calendar,
  Dumbbell,
  Flame,
  Weight,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

const StatsOverview = ({ getDaysRemaining, activeMembership, weeklyWorkouts, weightChange, totalCalories }) => {
  const stats = [
    {
      label: "Days Left",
      value: getDaysRemaining(),
      subLabel: activeMembership?.package_name || "No Active Plan",
      icon: <Calendar size={26} className="text-red-500" />,
      gradient: "from-red-500/20 to-red-600/10",
      border: "border-red-500/30",
      hover: "hover:from-red-500/30",
      subColor: "text-red-400",
    },
    {
      label: "This Week",
      value: weeklyWorkouts,
      subLabel: "Workouts",
      icon: <Dumbbell size={26} className="text-blue-500" />,
      gradient: "from-blue-500/20 to-blue-600/10",
      border: "border-blue-500/30",
      hover: "hover:from-blue-500/30",
      subColor: "text-blue-400",
    },
    {
      label: "Weight",
      value: `${weightChange > 0 ? "+" : ""}${weightChange}`,
      subLabel: (
        <span
          className={`flex items-center ${
            weightChange < 0 ? "text-green-400" : "text-red-400"
          }`}
        >
          {weightChange < 0 ? (
            <TrendingDown size={9} className="mr-1" />
          ) : (
            <TrendingUp size={9} className="mr-1" />
          )}
          {Math.abs(weightChange)} kg {weightChange < 0 ? "lost" : "gained"}
        </span>
      ),
      icon: <Weight size={26} className="text-green-500" />,
      gradient: "from-green-500/20 to-green-600/10",
      border: "border-green-500/30",
      hover: "hover:from-green-500/30",
    },
    {
      label: "Calories",
      value: `${(totalCalories / 1000).toFixed(1)}k`,
      subLabel: "This week",
      icon: <Flame size={26} className="text-purple-500" />,
      gradient: "from-purple-500/20 to-purple-600/10",
      border: "border-purple-500/30",
      hover: "hover:from-purple-500/30",
      subColor: "text-purple-400",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {stats.map((item, index) => (
        <div
          key={index}
          className={`relative bg-gradient-to-br ${item.gradient} border ${item.border} rounded-xl 
            p-3 sm:p-5 ${item.hover} transition-all transform hover:scale-[1.03] 
            hover:shadow-[0_0_15px_rgba(255,255,255,0.05)] group`}
        >
          {/* Glow effect */}
          <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

          <div className="flex items-center justify-between relative z-10">
            <div className="leading-tight sm:leading-normal">
              <p className="text-gray-400 text-[10px] sm:text-xs mb-0.5 sm:mb-1">{item.label}</p>
              <p className="text-xl sm:text-3xl font-bold text-white">{item.value}</p>
              <p
                className={`text-[9px] sm:text-xs mt-0.5 sm:mt-1 truncate ${
                  item.subColor || "text-gray-400"
                }`}
              >
                {item.subLabel}
              </p>
            </div>
            {item.icon}
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsOverview;
