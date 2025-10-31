import React from "react";
import { ArrowLeft, Plus, TrendingUp, Ruler } from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

const AddMeasurements = ({
  measurements,
  setActiveTab,
  setShowMeasurementModal,
}) => {
  // Prepare last 10 measurements for chart
  const chartData = measurements?.slice(-10).map((m) => ({
    date: new Date(m.created_at).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    weight: m.weight,
    chest: m.chest,
    waist: m.waist,
  }));

  const latestMeasurements = measurements?.slice(-5).reverse() || [];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-row justify-between items-center gap-2 sm:gap-3">
        <button onClick={() => setActiveTab('overview')}
            className="text-white hover:text-red-500 flex items-center transition-colors"
        >
            <ArrowLeft size={20} className="mr-2" />
              Back to Dashboard
        </button>

        <button
            onClick={() => setShowMeasurementModal(true)}
            className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg flex items-center transition-colors text-xs shadow-lg whitespace-nowrap"
            >
            <Plus size={15} className="mr-1" />
            Add Measurement
        </button>

      </div>

      {/* Chart + Latest Measurements */}
      {measurements && measurements.length > 0 ? (
        <div className="space-y-4 sm:space-y-6">
          {/* Trend Chart */}
          <div className="bg-black/50 border border-red-500/30 rounded-lg sm:rounded-xl p-3 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4 flex items-center">
              <TrendingUp className="mr-2 text-red-500" size={20} />
              Body Measurements Trend
            </h2>

            <div className="w-full h-[200px] sm:h-[300px] -ml-4 sm:-ml-6">
              <ResponsiveContainer width="104%" height="100%">
                <LineChart 
                  data={chartData} 
                  margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis
                    dataKey="date"
                    stroke="#888"
                    tick={{ fontSize: 10 }}
                    interval="preserveStartEnd"
                  />
                  <YAxis stroke="#888" tick={{ fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(0,0,0,0.9)",
                      border: "1px solid rgba(239,68,68,0.4)",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                    labelStyle={{ color: "#fff", fontSize: "12px" }}
                    itemStyle={{ color: "#ddd", fontSize: "11px" }}
                  />
                  <Legend 
                    wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }}
                    iconSize={10}
                  />
                  <Line
                    type="monotone"
                    dataKey="weight"
                    stroke="#ef4444"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                    name="Weight (kg)"
                  />
                  <Line
                    type="monotone"
                    dataKey="chest"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                    name="Chest (cm)"
                  />
                  <Line
                    type="monotone"
                    dataKey="waist"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                    name="Waist (cm)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Latest Measurement Cards - Clean Compact Design */}
          <div className="space-y-3">
            <h3 className="text-base sm:text-lg font-semibold text-white flex items-center">
              Recent Measurements
              <span className="ml-2 text-xs text-gray-500">
                (Last {latestMeasurements.length})
              </span>
            </h3>
            
            <div className="space-y-2">
              {latestMeasurements.map((m, idx) => (
                <div
                  key={m.id}
                  className={`bg-black/30 border rounded-lg p-3 sm:p-4 transition-all ${
                    idx === 0 
                      ? 'border-red-500/40 hover:border-red-500/60' 
                      : 'border-gray-800 hover:border-gray-700'
                  }`}
                >
                  {/* Header Row */}
                  <div className="flex justify-between items-center mb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 text-xs sm:text-sm font-medium">
                        {new Date(m.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    {idx === 0 && (
                      <span className="bg-red-500/20 text-red-400 px-2 py-0.5 rounded text-[10px] sm:text-xs font-medium">
                        Latest
                      </span>
                    )}
                  </div>

                  {/* Measurements Grid */}
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {[
                      { label: "Weight", value: m.weight, unit: "kg" },
                      { label: "Chest", value: m.chest, unit: "cm" },
                      { label: "Waist", value: m.waist, unit: "cm" },
                      { label: "Hips", value: m.hips, unit: "cm" },
                      { label: "Arms", value: m.arms, unit: "cm" },
                      { label: "Thighs", value: m.thighs, unit: "cm" },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="bg-gray-900/50 rounded p-2 text-center"
                      >
                        <p className="text-gray-500 text-[10px] sm:text-xs mb-0.5">
                          {item.label}
                        </p>
                        <p className="text-white font-semibold text-sm sm:text-base">
                          {item.value ?? "-"}
                        </p>
                        <p className="text-gray-600 text-[9px] sm:text-[10px]">
                          {item.unit}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-black/50 border border-red-500/30 rounded-lg sm:rounded-xl p-8 sm:p-12 text-center">
          <Ruler className="mx-auto mb-4 text-red-500 opacity-50" size={48} />
          <h3 className="text-lg sm:text-2xl font-bold text-white mb-2">
            No Measurements Yet
          </h3>
          <p className="text-gray-400 text-sm sm:text-base mb-4 sm:mb-6 max-w-md mx-auto">
            Start tracking your body measurements to see your progress over time
          </p>
          <button
            onClick={() => setShowMeasurementModal(true)}
            className="bg-red-500 hover:bg-red-600 text-white px-5 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold transition-colors inline-flex items-center shadow-lg"
          >
            <Plus size={18} className="mr-2" />
            Add First Measurement
          </button>
        </div>
      )}
    </div>
  );
};

export default AddMeasurements;