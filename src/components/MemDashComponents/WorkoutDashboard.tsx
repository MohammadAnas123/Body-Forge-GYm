import React from "react";
import {Edit2, Trash2,
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
        <ArrowLeft size={18} className="mr-2" />
          Back to Dashboard
      </button>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Workout History */}
          <div className="bg-black/50 border border-purple-500/30 rounded-xl p-4 sm:p-6">
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <div className="flex flex-col">
                <h2 className="text-base sm:text-lg font-bold text-white flex items-center">
                  <Dumbbell className="mr-2 sm:mr-3 text-purple-500" size={18} />
                  Workout History
                </h2>
                <p className="text-[11px] sm:text-sm text-gray-400/80 ml-7 sm:ml-8 mt-0.5 font-medium">
                  Last 10 workouts
                </p>
              </div>
              <button
                onClick={() => setShowWorkoutModal(true)}
                className="bg-purple-500 hover:bg-purple-600 text-white px-2 sm:px-3 py-1.5 sm:py-1.5 rounded-lg flex items-center transition-colors text-[13px] sm:text-sm"
              >
                <Plus size={15} className="mr-1 sm:mr-2" />
                Log Workout
              </button>
            </div>

            {workoutLogs.length > 0 ? (
              <div
                className="workout-list space-y-2 sm:space-y-3 overflow-y-auto pr-1"
                style={{ maxHeight: 400 }}
              >

                {workoutLogs.slice(0, 10).map((workout) => {
                  const isToday = new Date(workout.date).toDateString() === new Date().toDateString();
                  const [showActions, setShowActions] = React.useState(false);

                  return (
                    <div key={workout.id} className="relative">
                      <div
                        className="bg-gradient-to-r from-purple-500/10 to-transparent border border-purple-500/20 rounded-lg p-3 sm:p-3 hover:from-purple-500/20 transition-all"
                      >
                        <div className="flex justify-between items-start mb-2 sm:mb-3">
                          <div>
                            <h3 className="text-white font-bold text-sm sm:text-base">{workout.type}</h3>
                            <p className="text-gray-400 text-xs sm:text-sm">
                              {new Date(workout.date).toLocaleDateString("en-US", {
                                weekday: "long",
                                month: "short",
                                day: "numeric",
                              })}
                              {isToday && (
                                <span className="ml-2 text-green-400 text-xs font-semibold">• Today</span>
                              )}
                            </p>
                          </div>
                          <button
                            onClick={() => setShowActions(!showActions)}
                            className="text-gray-600 hover:text-purple-400 transition-colors p-1 rounded-lg hover:bg-purple-500/10"
                            aria-label="More options"
                          >
                            <ChevronRight 
                              className={`transform transition-transform ${showActions ? 'rotate-90' : ''}`} 
                              size={18} 
                            />
                          </button>
                        </div>

                        {/* Action Buttons */}
                        {showActions && (
                          <div className="flex gap-2 mb-3 animate-in slide-in-from-top-2 duration-200">
                            <button
                              onClick={() => {
                                // Add your edit logic here
                                console.log('Edit workout:', workout.id);
                                setShowActions(false);
                              }}
                              disabled={!isToday}
                              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                                isToday
                                  ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border border-blue-500/30'
                                  : 'bg-gray-700/30 text-gray-500 cursor-not-allowed border border-gray-700/30'
                              }`}
                            >
                              <Edit2 size={14} />
                              Edit
                            </button>
                            <button
                              onClick={() => {
                                // Add your delete logic here
                                if (confirm('Are you sure you want to delete this workout log?')) {
                                  console.log('Delete workout:', workout.id);
                                  setShowActions(false);
                                }
                              }}
                              className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30 transition-all"
                            >
                              <Trash2 size={14} />
                              Delete
                            </button>
                          </div>
                        )}

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
                    </div>
                  );
                })}

                {/* Scrollbar styling */}
                <style>{`
                  .workout-list {
                    scrollbar-width: thin;
                    scrollbar-color: rgba(128,90,213,0.18) transparent;
                  }
                  .workout-list::-webkit-scrollbar {
                    width: 6px;
                  }
                  .workout-list::-webkit-scrollbar-track {
                    background: transparent;
                  }
                  .workout-list::-webkit-scrollbar-thumb {
                    background: rgba(128,90,213,0);
                    border-radius: 9999px;
                    box-shadow: none;
                    transition: background 150ms ease, box-shadow 150ms ease;
                  }
                  .workout-list:hover::-webkit-scrollbar-thumb {
                    background: linear-gradient(180deg, rgba(128,90,213,0.18), rgba(128,90,213,0.12));
                    box-shadow: 0 0 8px rgba(128,90,213,0.06), inset 0 0 2px rgba(0,0,0,0.4);
                  }
                  .workout-list:hover::-webkit-scrollbar-thumb:hover {
                    background: linear-gradient(180deg, rgba(128,90,213,0.28), rgba(128,90,213,0.16));
                    box-shadow: 0 0 10px rgba(128,90,213,0.08);
                  }
                `}</style>
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
            <h3 className="text-base sm:text-lg font-bold text-white mb-3 sm:mb-4 flex items-center">
              <BarChart3 className="mr-2 sm:mr-3 text-blue-500" size={16} />
              This Week's Activity
            </h3>
            <div style={{ width: "100%", height: 180 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={workoutStats} 
                  margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
                >
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
        <div className="space-y-4">
          {/* Monthly Stats */}
          <div className="bg-black/50 border border-green-500/30 rounded-xl p-4 sm:p-6 space-y-3">
            <h3 className="text-base sm:text-lg font-bold text-white mb-2 flex items-center">
              <Award className="mr-2 sm:mr-3 text-green-500" size={18} />
              This Month
            </h3>
            <div className="space-y-3">
              <div className="bg-gradient-to-r from-green-500/10 to-transparent border border-green-500/20 rounded-lg p-3 sm:p-4">
                <p className="text-gray-400 text-xs sm:text-sm mb-1">Total Workouts</p>
                <p className="text-xl sm:text-2xl font-bold text-white">{totalWorkouts}</p>
              </div>
              <div className="bg-gradient-to-r from-blue-500/10 to-transparent border border-blue-500/20 rounded-lg p-3 sm:p-4">
                <p className="text-gray-400 text-xs sm:text-sm mb-1">Total Time</p>
                <p className="text-xl sm:text-2xl font-bold text-white">{totalHours}</p>
                <p className="text-blue-400 text-xs sm:text-sm">hours</p>
              </div>
              <div className="bg-gradient-to-r from-orange-500/10 to-transparent border border-orange-500/20 rounded-lg p-3 sm:p-4">
                <p className="text-gray-400 text-xs sm:text-sm mb-1">Calories Burned</p>
                <p className="text-xl sm:text-2xl font-bold text-white">{totalCalories}</p>
              </div>
            </div>
          </div>

          {/* Achievements */}
          <div className="bg-black/50 border border-yellow-500/30 rounded-xl p-4 sm:p-6 space-y-3">
            <h3 className="text-base sm:text-lg font-bold text-white mb-2 flex items-center">
              <Flame className="mr-2 sm:mr-3 text-yellow-500" size={18} />
              Achievements
            </h3>
            <div className="space-y-2">
              {currentStreak > 0 && (
                <div className="flex items-center space-x-2 sm:space-x-3 p-2 sm:p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <div className="bg-yellow-500/20 p-1 sm:p-2 rounded-lg">
                    <Award className="text-yellow-500" size={16} />
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
                    <Target className="text-purple-500" size={16} />
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
