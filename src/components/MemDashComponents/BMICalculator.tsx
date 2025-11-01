import React, { useState } from "react";
import { ArrowLeft, Weight } from "lucide-react";

const BMICalculator = ({ setActiveTab }) => {
  const [bmiData, setBmiData] = useState({
    height: "",
    weight: "",
    bmi: null,
    category: "",
  });

  const calculateBMI = () => {
    const heightInM = bmiData.height / 100;
    const bmiValue = (bmiData.weight / (heightInM * heightInM)).toFixed(1);

    let category = "";
    if (bmiValue < 18.5) category = "Underweight";
    else if (bmiValue < 25) category = "Normal";
    else if (bmiValue < 30) category = "Overweight";
    else category = "Obese";

    setBmiData({ ...bmiData, bmi: bmiValue, category });
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={() => setActiveTab("overview")}
        className="text-white hover:text-red-500 flex items-center transition-colors"
      >
        <ArrowLeft size={18} className="mr-2" />
        Back to Dashboard
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* BMI Input & Result */}
        <div className="bg-black/50 border border-blue-500/30 rounded-xl p-6">
          <h2 className="text-base font-bold text-white mb-6 flex items-center">
            <Weight className="mr-3 text-blue-500" size={18} />
            BMI Calculator
          </h2>

          <div className="space-y-4">
            <div>
              <label className="text-white block mb-2 font-medium text-sm">Height (cm)</label>
              <input
                type="number"
                value={bmiData.height}
                onChange={(e) => setBmiData({ ...bmiData, height: e.target.value })}
                className="w-full bg-black/50 border border-gray-700 text-white rounded-lg px-4 py-2 focus:border-blue-500 focus:outline-none transition-colors text-sm"
                placeholder="e.g., 175"
              />
            </div>
            <div>
              <label className="text-white block mb-2 font-medium text-sm">Weight (kg)</label>
              <input
                type="number"
                value={bmiData.weight}
                onChange={(e) => setBmiData({ ...bmiData, weight: e.target.value })}
                className="w-full bg-black/50 border border-gray-700 text-white rounded-lg px-4 py-2 focus:border-blue-500 focus:outline-none transition-colors text-sm"
                placeholder="e.g., 70"
              />
            </div>

            <button
              onClick={calculateBMI}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg font-semibold transition-colors mt-4 text-sm"
            >
              Calculate BMI
            </button>
          </div>

          {bmiData.bmi && (
            <div className="mt-6 p-4 bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/30 rounded-lg">
              <div className="text-center">
                <p className="text-gray-400 text-sm mb-3">Your BMI</p>
                <div className="flex items-center justify-center gap-3">
                  <span className="text-4xl sm:text-5xl font-bold text-white">{bmiData.bmi}</span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                      bmiData.category === "Normal"
                        ? "bg-green-500/20 text-green-400"
                        : bmiData.category === "Overweight"
                        ? "bg-yellow-500/20 text-yellow-400"
                        : bmiData.category === "Underweight"
                        ? "bg-blue-500/20 text-blue-400"
                        : "bg-red-500/20 text-red-400"
                    }`}
                  >
                    {bmiData.category}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* BMI Categories */}
        <div className="bg-black/50 border border-gray-700 rounded-xl p-6">
          <h3 className="text-base font-bold text-white mb-4">BMI Categories</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 sm:p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg text-sm">
              <span className="text-white font-medium">Underweight</span>
              <span className="text-blue-400 font-semibold">&lt; 18.5</span>
            </div>
            <div className="flex items-center justify-between p-3 sm:p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-sm">
              <span className="text-white font-medium">Normal Weight</span>
              <span className="text-green-400 font-semibold">18.5 - 24.9</span>
            </div>
            <div className="flex items-center justify-between p-3 sm:p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-sm">
              <span className="text-white font-medium">Overweight</span>
              <span className="text-yellow-400 font-semibold">25 - 29.9</span>
            </div>
            <div className="flex items-center justify-between p-3 sm:p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-sm">
              <span className="text-white font-medium">Obese</span>
              <span className="text-red-400 font-semibold">≥ 30</span>
            </div>
          </div>

          {bmiData.bmi && (
            <div className="mt-6 p-3 sm:p-4 bg-gray-800/50 rounded-lg text-sm">
              <p className="text-gray-300 leading-relaxed">
                <strong className="text-white">Note:</strong> BMI is a general indicator and doesn't account for muscle mass, bone density, or body composition. Consult with fitness professionals for personalized assessments.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BMICalculator;
