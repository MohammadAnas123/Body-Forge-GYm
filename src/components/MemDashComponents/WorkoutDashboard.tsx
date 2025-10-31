import React from "react";
import {
  ArrowLeft,
  Dumbbell,
  Plus,
  Clock,
  Activity,
  Flame,
  ChevronRight,
  BarChart3,
  Award,
  Target,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
} from "recharts";

const WorkoutDashboard = ({
  setActiveTab,
  setShowWorkoutModal,
  workoutLogs = [],
  workoutStats = [],
  totalWorkouts = 0,
  currentStreak = 0,
  weeklyWorkouts = 0,
  CustomTooltip,
}) => {
  // calculate total time in hours
  const totalHours = (workoutLogs.reduce((sum, w) => sum + (w.duration || 0), 0) / 60).toFixed(1);

  const totalCalories = workoutLogs.reduce((sum, w) => sum + (w.calories || 0), 0).toLocaleString();

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

      {/* Main Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Workout History */}
          <div className="bg-black/50 border border-purple-500/30 rounded-xl p-4 sm:p-6">
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <h2 className="text-2xl sm:text-3xl font-bold text-white flex items-center">
                <Dumbbell className="mr-2 sm:mr-3 text-purple-500" size={28} />
                Workout History
              </h2>
              <button
                onClick={() => setShowWorkoutModal(true)}
                className="bg-purple-500 hover:bg-purple-600 text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg flex items-center transition-colors text-sm sm:text-base"
              >
                <Plus size={16} className="mr-1 sm:mr-2" />
                Log Workout
              </button>
            </div>

            {workoutLogs.length > 0 ? (
              <div className="space-y-3 sm:space-y-4">
                {workoutLogs.map((workout) => (
                  <div
                    key={workout.id}
                    className="bg-gradient-to-r from-purple-500/10 to-transparent border border-purple-500/20 rounded-lg p-3 sm:p-5 hover:from-purple-500/20 transition-all cursor-pointer"
                  >
                    <div className="flex justify-between items-start mb-2 sm:mb-3">
                      <div>
                        <h3 className="text-white font-bold text-sm sm:text-lg">{workout.type}</h3>
                        <p className="text-gray-400 text-xs sm:text-sm">
                          {new Date(workout.date).toLocaleDateString("en-US", {
                            weekday: "long",
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                      <ChevronRight className="text-gray-600" size={20} />
                    </div>
                    <div className="grid grid-cols-3 gap-2 sm:gap-4">
                      <div className="bg-black/30 rounded-lg p-2 sm:p-3 text-center">
                        <Clock className="text-blue-400 mx-auto mb-1" size={14} />
                        <p className="text-white font-semibold text-sm">{workout.duration}</p>
                        <p className="text-gray-400 text-xs">minutes</p>
                      </div>
                      <div className="bg-black/30 rounded-lg p-2 sm:p-3 text-center">
                        <Activity className="text-purple-400 mx-auto mb-1" size={14} />
                        <p className="text-white font-semibold text-sm">{workout.exercises}</p>
                        <p className="text-gray-400 text-xs">exercises</p>
                      </div>
                      <div className="bg-black/30 rounded-lg p-2 sm:p-3 text-center">
                        <Flame className="text-orange-400 mx-auto mb-1" size={14} />
                        <p className="text-white font-semibold text-sm">{workout.calories}</p>
                        <p className="text-gray-400 text-xs">calories</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 sm:py-12">
                <Dumbbell className="mx-auto mb-3 sm:mb-4 text-purple-500 opacity-50" size={48} />
                <h3 className="text-lg sm:text-xl font-bold text-white mb-2">No Workouts Logged</h3>
                <p className="text-gray-400 mb-4 sm:mb-6 text-sm sm:text-base">
                  Start logging your workouts to track your fitness journey
                </p>
                <button
                  onClick={() => setShowWorkoutModal(true)}
                  className="bg-purple-500 hover:bg-purple-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold transition-colors inline-flex items-center text-sm sm:text-base"
                >
                  <Plus size={16} className="mr-1 sm:mr-2" />
                  Log First Workout
                </button>
              </div>
            )}
          </div>

          {/* This Week's Activity */}
          <div className="bg-black/50 border border-blue-500/30 rounded-xl p-4 sm:p-6">
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4 flex items-center">
              <BarChart3 className="mr-2 sm:mr-3 text-blue-500" size={24} />
              This Week's Activity
            </h3>
            <div style={{ width: "100%", height: 180 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={workoutStats}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="day" stroke="#888" />
                  <YAxis stroke="#888" />
                  <Tooltip content={CustomTooltip} />
                  <Bar dataKey="calories" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className="space-y-6">
          {/* Monthly Stats */}
          <div className="bg-black/50 border border-green-500/30 rounded-xl p-4 sm:p-6 space-y-3">
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 flex items-center">
              <Award className="mr-2 sm:mr-3 text-green-500" size={24} />
              This Month
            </h3>
            <div className="space-y-3">
              <div className="bg-gradient-to-r from-green-500/10 to-transparent border border-green-500/20 rounded-lg p-3 sm:p-4">
                <p className="text-gray-400 text-xs sm:text-sm mb-1">Total Workouts</p>
                <p className="text-2xl sm:text-3xl font-bold text-white">{totalWorkouts}</p>
              </div>
              <div className="bg-gradient-to-r from-blue-500/10 to-transparent border border-blue-500/20 rounded-lg p-3 sm:p-4">
                <p className="text-gray-400 text-xs sm:text-sm mb-1">Total Time</p>
                <p className="text-2xl sm:text-3xl font-bold text-white">{totalHours}</p>
                <p className="text-blue-400 text-xs sm:text-sm">hours</p>
              </div>
              <div className="bg-gradient-to-r from-orange-500/10 to-transparent border border-orange-500/20 rounded-lg p-3 sm:p-4">
                <p className="text-gray-400 text-xs sm:text-sm mb-1">Calories Burned</p>
                <p className="text-2xl sm:text-3xl font-bold text-white">{totalCalories}</p>
              </div>
            </div>
          </div>

          {/* Achievements */}
          <div className="bg-black/50 border border-yellow-500/30 rounded-xl p-4 sm:p-6 space-y-3">
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 flex items-center">
              <Flame className="mr-2 sm:mr-3 text-yellow-500" size={24} />
              Achievements
            </h3>
            <div className="space-y-2">
              {currentStreak > 0 && (
                <div className="flex items-center space-x-2 sm:space-x-3 p-2 sm:p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <div className="bg-yellow-500/20 p-1 sm:p-2 rounded-lg">
                    <Award className="text-yellow-500" size={18} />
                  </div>
                  <div>
                    <p className="text-white font-semibold text-xs sm:text-sm">
                      {currentStreak} Day Streak
                    </p>
                    <p className="text-gray-400 text-xs">Keep it up!</p>
                  </div>
                </div>
              )}
              {weeklyWorkouts >= 5 && (
                <div className="flex items-center space-x-2 sm:space-x-3 p-2 sm:p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                  <div className="bg-purple-500/20 p-1 sm:p-2 rounded-lg">
                    <Target className="text-purple-500" size={18} />
                  </div>
                  <div>
                    <p className="text-white font-semibold text-xs sm:text-sm">Goal Crusher</p>
                    <p className="text-gray-400 text-xs">Met weekly target</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkoutDashboard;
