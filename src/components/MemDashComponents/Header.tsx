import React from "react";
import { ArrowLeft, Flame, LogOut, User } from "lucide-react";

const Header = ({ currentStreak, userName, handleLogout }) => {
  const gymName =
    import.meta.env.VITE_GYM_NAME ||
    process.env.REACT_APP_GYM_NAME ||
    "GYMNAME";

  return (
    <header className="bg-black/50 backdrop-blur-sm border-b border-red-500/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-3 sm:py-4">
          {/* Left Section */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Back arrow */}
            <a
              href="/"
              className="text-white hover:text-red-500 transition-colors"
            >
              <ArrowLeft size={22} />
            </a>

            {/* Gym Name */}
            <h1 className="text-base sm:text-lg text-white font-bold tracking-wide truncate max-w-[120px] sm:max-w-none">
              {gymName.split(" ")[0]}
              <span className="text-red-500">
                {gymName.split(" ")[1] ? " " + gymName.split(" ")[1] : ""}
              </span>
            </h1>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-1 sm:space-x-3">
            {/* Streak always visible */}
            {currentStreak > 0 && (
              <div className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-1 sm:py-1.5 bg-red-500/20 rounded-full border border-red-500/30">
                <Flame className="text-orange-500 w-2.5 h-2.5 sm:w-5 sm:h-5" />
                <span className="text-white text-[10px] sm:text-xs font-semibold">
                {currentStreak} Day Streak
                </span>
              </div>
            )}

            {/* Profile / Logout */}
            <div className="flex items-center space-x-1 sm:space-x-3">
              {/* Desktop: Welcome text */}
              <span className="hidden sm:inline text-sm text-white">
                Welcome,&nbsp;
                <span className="font-bold text-red-500">{userName}</span>
              </span>

              {/* Mobile: user icon visible */}
              <User
                size={22}
                className="block sm:hidden text-white hover:text-red-500 transition-colors"
              />

              {/* Logout */}
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
