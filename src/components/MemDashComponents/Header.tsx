import React from "react";
import { ArrowLeft, Flame, LogOut } from "lucide-react";

const Header = ({ currentStreak, userName, handleLogout }) => {
  // Read the gym name from the environment variable
  const gymName =
    import.meta.env.VITE_GYM_NAME || // For Vite
    process.env.REACT_APP_GYM_NAME || // For CRA
    "GYMNAME"; // Default fallback

  return (
    <header className="bg-black/50 backdrop-blur-sm border-b border-red-500/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-3 sm:py-4">
          {/* Left Section */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            <a
              href="/"
              className="text-white hover:text-red-500 transition-colors"
            >
              <ArrowLeft size={22} />
            </a>
            <h1 className="text-xl sm:text-2xl text-white font-bold tracking-wide">
              {gymName.split(" ")[0]}
              <span className="text-red-500">
                {gymName.split(" ")[1] ? " " + gymName.split(" ")[1] : ""}
              </span>
            </h1>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-3 sm:space-x-6">
            {currentStreak > 0 && (
              <div className="hidden md:flex items-center space-x-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-red-500/20 rounded-full border border-red-500/30">
                <Flame className="text-red-500" size={16} />
                <span className="text-white text-xs sm:text-sm font-semibold">
                  {currentStreak} Day Streak 🔥
                </span>
              </div>
            )}

            <div className="flex items-center space-x-2 sm:space-x-4">
              <span className="text-xs sm:text-sm text-white">
                Welcome,&nbsp;
                <span className="font-bold text-red-500">{userName}</span>
              </span>
              <button
                onClick={handleLogout}
                type="button"
                className="text-white hover:text-red-500 transition-colors"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
