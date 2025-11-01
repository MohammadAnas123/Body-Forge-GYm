import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Activity } from "lucide-react";

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-900 text-white px-3 py-2 rounded-md shadow-md border border-blue-500/40">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-blue-400">
          Duration: {payload[0].value} mins
        </p>
      </div>
    );
  }
  return null;
};

// WeeklyActivity Component
const WeeklyActivity = ({ workoutStats }) => {
  return (
    <div className="bg-black/50 border border-blue-500/30 rounded-lg sm:rounded-xl p-4 sm:p-6">
      <h3 className="text-base sm:text-lg font-bold text-white mb-4 flex items-center">
        <Activity className="mr-2 text-blue-500" size={16} />
        Weekly Activity
      </h3>

      {/* ✅ Chart container with slight left shift */}
      <div className="w-full flex justify-center">
        <ResponsiveContainer
          width="98%"
          height={200}
        >
          <BarChart
            data={workoutStats}
            margin={{ top: 10, right: 10, left: -35, bottom: -5 }} // shifted slightly more left
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis
              dataKey="day"
              stroke="#888"
              tick={{ fontSize: 11 }}
              interval={0}
              tickMargin={8}
            />
            <YAxis stroke="#888" tick={{ fontSize: 11 }} />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="duration"
              fill="url(#colorGradient)"
              radius={[8, 8, 0, 0]}
              animationDuration={1000}
            />
            {/* ✅ Gradient Fill */}
            <defs>
              <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#1e3a8a" stopOpacity={0.8} />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default WeeklyActivity;
