import React from "react";
import { CheckCircle2, Clock, Dumbbell, Flame } from "lucide-react";

const RecentWorkouts = ({ workoutLogs, setActiveTab }) => {
  return (
    <div className="bg-black/50 border border-green-500/30 rounded-lg sm:rounded-xl p-4 sm:p-6">
      <h3 className="text-base sm:text-lg font-bold text-white mb-4 flex items-center">
        <CheckCircle2 className="mr-2 text-green-500" size={16} />
        Recent Workouts
      </h3>

      {/* container with a specific class so CSS targets only this element */}
      <div
        className="recent-workouts-list space-y-2 space-x-1 sm:space-y-3 overflow-y-auto pr-1"
        style={{ maxHeight: 200 }}
      >
        {/* scoped styles for the scrollbar (WebKit + Firefox) */}
        <style>{`
          /* Scope to the container using the class */
          .recent-workouts-list {
            scrollbar-width: thin;
            scrollbar-color: rgba(34,197,94,0.18) transparent; /* Firefox */
          }

          /* WebKit (Chrome, Edge, Safari) */
          .recent-workouts-list::-webkit-scrollbar {
            width: 6px;
          }
          .recent-workouts-list::-webkit-scrollbar-track {
            background: transparent;
          }
          .recent-workouts-list::-webkit-scrollbar-thumb {
            background: rgba(34,197,94,0); /* hidden by default */
            border-radius: 9999px;
            box-shadow: none;
            transition: background 150ms ease, box-shadow 150ms ease;
          }
          /* show thumb on hover of the container */
          .recent-workouts-list:hover::-webkit-scrollbar-thumb {
            background: linear-gradient(180deg, rgba(34,197,94,0.18), rgba(34,197,94,0.12));
            box-shadow: 0 0 8px rgba(34,197,94,0.06), inset 0 0 2px rgba(0,0,0,0.4);
          }

          /* Slightly stronger on thumb hover */
          .recent-workouts-list:hover::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(180deg, rgba(34,197,94,0.28), rgba(34,197,94,0.16));
            box-shadow: 0 0 10px rgba(34,197,94,0.08);
          }
        `}</style>

        {workoutLogs && workoutLogs.length > 0 ? (
          workoutLogs.slice(0, 10).map((workout) => (
            <div
              key={workout.id}
              className="bg-gradient-to-r from-green-500/5 to-transparent border border-green-500/20 rounded-lg p-2.5 sm:p-3 hover:from-green-500/15 hover:border-green-500/40 hover:shadow-lg hover:scale-[1.01] transition-all cursor-pointer"
            >
              <div className="flex justify-between items-center mb-1.5">
                <p className="text-white font-semibold text-xs sm:text-sm truncate pr-2">
                  {workout.type}
                </p>
                <p className="text-gray-400 text-[10px] sm:text-xs whitespace-nowrap">
                  {new Date(workout.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>

              <div className="flex justify-start gap-3 sm:gap-4 text-[10px] sm:text-xs text-gray-300">
                <div className="flex items-center gap-1">
                  <Clock className="text-blue-400 flex-shrink-0" size={11} />
                  <span>{workout.duration}m</span>
                </div>
                <div className="flex items-center gap-1">
                  <Dumbbell className="text-purple-400 flex-shrink-0" size={11} />
                  <span>{workout.exercises} ex</span>
                </div>
                <div className="flex items-center gap-1">
                  <Flame className="text-orange-400 flex-shrink-0" size={11} />
                  <span>{workout.calories} cal</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-6 sm:py-8 text-gray-500">
            <Dumbbell className="mx-auto mb-2 opacity-50" size={28} />
            <p className="text-xs sm:text-sm">No workouts logged yet</p>
            <button
              onClick={() => setActiveTab("workout")}
              className="mt-3 text-xs sm:text-sm text-green-500 hover:text-green-400"
            >
              Log your first workout →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentWorkouts;
