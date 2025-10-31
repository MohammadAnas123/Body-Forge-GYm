import React from "react";
import { ArrowLeft } from "lucide-react";

const DietPlan = ({ setActiveTab }) => {
  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={() => setActiveTab("overview")}
        className="text-white hover:text-red-500 flex items-center transition-colors"
      >
        <ArrowLeft size={20} className="mr-2" />
        Back to Dashboard
      </button>

      {/* Diet Plan Container */}
      <div className="bg-black/50 border border-green-500/30 rounded-xl p-4 sm:p-6 space-y-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
          General Diet Guidelines
        </h2>

        {/* Macronutrient Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/30 rounded-lg p-4 text-center">
            <p className="text-gray-400 text-sm mb-1">Calories</p>
            <p className="text-2xl sm:text-3xl font-bold text-white">2,200</p>
            <p className="text-blue-400 text-xs sm:text-sm mt-1">Daily Target</p>
          </div>
          <div className="bg-gradient-to-br from-red-500/20 to-red-600/10 border border-red-500/30 rounded-lg p-4 text-center">
            <p className="text-gray-400 text-sm mb-1">Protein</p>
            <p className="text-2xl sm:text-3xl font-bold text-white">165g</p>
            <p className="text-red-400 text-xs sm:text-sm mt-1">30% of diet</p>
          </div>
          <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 border border-yellow-500/30 rounded-lg p-4 text-center">
            <p className="text-gray-400 text-sm mb-1">Carbs</p>
            <p className="text-2xl sm:text-3xl font-bold text-white">220g</p>
            <p className="text-yellow-400 text-xs sm:text-sm mt-1">40% of diet</p>
          </div>
          <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/30 rounded-lg p-4 text-center">
            <p className="text-gray-400 text-sm mb-1">Fats</p>
            <p className="text-2xl sm:text-3xl font-bold text-white">73g</p>
            <p className="text-purple-400 text-xs sm:text-sm mt-1">30% of diet</p>
          </div>
        </div>

        {/* Meals Sections */}
        <div className="space-y-4">
          {[
            {
              title: "Breakfast (7-9 AM)",
              color: "green",
              items: [
                "Oatmeal with fruits and nuts",
                "Eggs (2-3) with whole wheat toast",
                "Protein shake with banana",
              ],
            },
            {
              title: "Lunch (12-2 PM)",
              color: "green",
              items: [
                "Grilled chicken/fish with brown rice",
                "Large portion of vegetables",
                "Lentils or beans",
              ],
            },
            {
              title: "Dinner (7-9 PM)",
              color: "green",
              items: [
                "Lean protein (chicken/fish/tofu)",
                "Steamed vegetables",
                "Small portion of complex carbs",
              ],
            },
            {
              title: "Hydration & Snacks",
              color: "blue",
              items: [
                "Drink 3-4 liters of water daily",
                "Nuts and fruits for snacks",
                "Greek yogurt or protein bars",
              ],
            },
          ].map((meal, idx) => (
            <div
              key={idx}
              className={`bg-gradient-to-r from-${meal.color}-500/10 to-transparent border border-${meal.color}-500/20 rounded-lg p-4`}
            >
              <h3
                className={`font-bold text-lg mb-2 text-${meal.color}-500`}
              >
                {meal.title}
              </h3>
              <ul className="list-disc list-inside text-gray-300 space-y-1">
                {meal.items.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className="text-center text-gray-400 text-sm italic mt-6">
          This is a general nutrition plan. Consult with a nutritionist for a
          personalized diet plan based on your specific goals.
        </p>
      </div>
    </div>
  );
};

export default DietPlan;
