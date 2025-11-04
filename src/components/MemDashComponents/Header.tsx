import React from "react";
import { ArrowLeft, Flame, LogOut, User } from "lucide-react";

const Header = ({ currentStreak, userName, handleLogout }) => {
  const gymName =
    import.meta.env.VITE_GYM_NAME ||
    process.env.REACT_APP_GYM_NAME ||
    "GYMNAME";

  return (
    <header className="bg-gradient-to-r from-black via-gray-900 to-black border-b border-red-500/30 sticky top-0 z-50 shadow-lg shadow-red-500/10">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-3 sm:py-4">
          {/* Left Section */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            {/* Back arrow with better hover effect */}
            <button
              onClick={() => window.history.back()}
              className="text-gray-300 hover:text-red-500 transition-all duration-300 hover:scale-110 p-1 rounded-lg hover:bg-red-500/10"
              aria-label="Go back"
            >
              <ArrowLeft size={20} className="sm:w-6 sm:h-6" />
            </button>

            {/* Gym Name with gradient */}
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold tracking-wide flex items-center">
              <span className="text-white">
                {gymName.split(" ")[0]}
              </span>
              <span className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent ml-1">
                {gymName.split(" ")[1] ? gymName.split(" ")[1] : ""}
              </span>
            </h1>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Streak with enhanced design */}
            {currentStreak > 0 && (
              <div className="flex items-center space-x-1.5 sm:space-x-2 px-2.5 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-full border border-red-500/40 shadow-md shadow-red-500/20 hover:shadow-lg hover:shadow-red-500/30 transition-all duration-300">
                <Flame className="text-orange-500 w-4 h-4 sm:w-5 sm:h-5 animate-pulse" />
                <span className="text-white text-xs sm:text-sm font-bold whitespace-nowrap">
                  {currentStreak} {currentStreak === 1 ? 'Day' : 'Days'}
                </span>
              </div>
            )}

            {/* Profile Section */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* Desktop: Welcome text with better styling */}
              <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 bg-white/5 rounded-lg border border-white/10">
                <User size={18} className="text-red-500" />
                <span className="text-sm text-gray-300">
                  Hi,&nbsp;
                  <span className="font-bold text-white">{userName}</span>
                </span>
              </div>

              {/* Mobile: user icon with badge effect */}
              <div className="md:hidden relative p-2 bg-white/5 rounded-full border border-white/10 hover:bg-red-500/10 hover:border-red-500/30 transition-all duration-300">
                <User size={18} className="text-gray-300" />
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              </div>

              {/* Logout with enhanced hover */}
              <button
                onClick={handleLogout}
                type="button"
                className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-500/10 rounded-lg border border-transparent hover:border-red-500/30 transition-all duration-300 hover:scale-105"
                aria-label="Logout"
              >
                <LogOut size={18} className="sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;