import React, { useState, useEffect, useRef } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { BarChart3, Weight, ChevronDown } from "lucide-react";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-900 text-white px-3 py-2 rounded-md shadow-md border border-red-500/40">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-red-400">Weight: {payload[0].value} kg</p>
      </div>
    );
  }
  return null;
};

const WeightProgress = ({
  filteredWeightData,
  selectedPeriod,
  setSelectedPeriod,
  setActiveTab,
}) => {
  const [isMobile, setIsMobile] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const periods = ["7d", "30d", "90d", "all"];

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Close dropdown when clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const chartHeight = isMobile ? 150 : 250;
  const chartMarginLeft = isMobile ? -40 : -35;

  return (
    <div className="lg:col-span-2 bg-black/50 border border-red-500/30 rounded-lg sm:rounded-xl p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 gap-3">
        {/* Left: Title + Icon + Period Selector (Mobile) */}
        <div className="flex items-center justify-between w-full sm:w-auto">
          <div className="flex items-center gap-2">
            <BarChart3
              className={`text-red-500 ${isMobile ? "w-5 h-5" : "w-6 h-6"}`}
            />
            <h2
              className={`font-bold text-white ${
                isMobile ? "text-lg" : "text-xl sm:text-2xl"
              }`}
            >
              Weight Progress
            </h2>
            {!isMobile && (
              <p className="text-gray-400 text-xs sm:text-sm mt-1 ml-3">
                {filteredWeightData.length} data points
              </p>
            )}
          </div>

          {/* Period Selector - Mobile (Right side) */}
          {isMobile && (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen((prev) => !prev)}
                className="flex items-center justify-between gap-2 bg-gray-800/80 border border-red-500/30 px-4 py-2 rounded-lg text-sm text-white font-medium hover:bg-gray-800 transition-colors min-w-[100px]"
              >
                <span>{selectedPeriod.toUpperCase()}</span>
                <ChevronDown 
                  size={16} 
                  className={`transition-transform duration-200 ${
                    dropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-full min-w-[100px] bg-gray-900 border border-red-500/30 rounded-lg shadow-xl overflow-hidden z-20">
                  {periods.map((period, index) => (
                    <button
                      key={period}
                      onClick={() => {
                        setSelectedPeriod(period);
                        setDropdownOpen(false);
                      }}
                      className={`w-full text-center px-4 py-2.5 text-sm font-medium transition-colors ${
                        selectedPeriod === period
                          ? 'bg-red-500/20 text-red-400 border-l-2 border-red-500'
                          : 'text-gray-300 hover:bg-red-500/10 hover:text-white'
                      } ${
                        index !== periods.length - 1 ? 'border-b border-gray-800' : ''
                      }`}
                    >
                      {period.toUpperCase()}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Period Selector - Desktop */}
        {!isMobile && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {periods.map((period) => (
              <button
                key={period}
                className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm whitespace-nowrap flex-shrink-0 ${
                  selectedPeriod === period
                    ? "bg-red-500 text-white"
                    : "bg-gray-800 text-gray-400"
                }`}
                onClick={() => setSelectedPeriod(period)}
              >
                {period.toUpperCase()}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Chart or Empty State */}
      {filteredWeightData.length > 0 ? (
        <div className="w-full flex justify-start">
          <ResponsiveContainer width="97%" height={chartHeight}>
            <AreaChart
              data={filteredWeightData}
              margin={{ top: 10, right: 10, left: chartMarginLeft, bottom: 0 }}
            >
              <defs>
                <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis
                dataKey="date"
                stroke="#888"
                tick={{ fontSize: isMobile ? 9 : 11 }}
              />
              <YAxis
                stroke="#888"
                tick={{ fontSize: isMobile ? 9 : 11 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="weight"
                stroke="#ef4444"
                fill="url(#weightGradient)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-40 sm:h-64 flex items-center justify-center text-gray-500">
          <div className="text-center px-4">
            <Weight className="mx-auto mb-3 opacity-50" size={40} />
            <p className="text-sm">No measurement data yet</p>
            <button
              onClick={() => setActiveTab("measurements")}
              className="mt-3 text-xs sm:text-sm text-red-500 hover:text-red-400"
            >
              Add your first measurement →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeightProgress;