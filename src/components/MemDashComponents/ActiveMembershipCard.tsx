import React from 'react';
import { CreditCard } from 'lucide-react';

const ActiveMembershipCard = ({ activeMembership, getDaysRemaining }) => {
  if (!activeMembership) return null;

  return (
    <div className="bg-black/50 border border-red-500/30 rounded-2xl p-4 sm:p-6 shadow-lg">
      <h2 className="text-base sm:text-lg font-bold text-white mb-4 flex items-center justify-between">
        <span className="flex items-center">
          <CreditCard className="mr-2 sm:mr-3 text-red-500" size={18} />
          Active Membership
        </span>
      </h2>

      {/* Info row */}
      <div className="flex justify-between text-center sm:text-center">
        {/* Left - Package */}
        <div className="flex-1 text-left">
          <p className="text-gray-400 text-[10px] sm:text-xs">Package</p>
          <p className="text-white font-semibold text-[12px] sm:text-base">
            {activeMembership.package_name}
          </p>
        </div>

        {/* Center - Start Date */}
        <div className="flex-1 text-center">
          <p className="text-gray-400 text-[10px] sm:text-xs">Start Date</p>
          <p className="text-white font-semibold text-[12px] sm:text-base">
            {new Date(activeMembership.start_date).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </p>
        </div>

        {/* Right - End Date */}
        <div className="flex-1 text-right">
          <p className="text-gray-400 text-[10px] sm:text-xs">End Date</p>
          <p className="text-white font-semibold text-[12px] sm:text-base">
            {new Date(activeMembership.end_date).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-4 bg-red-500/20 rounded-full h-1.5 sm:h-2 overflow-hidden">
        <div
          className="bg-red-500 h-full rounded-full transition-all"
          style={{
            width: `${Math.min(100, (getDaysRemaining() / 30) * 100)}%`,
          }}
        />
      </div>
    </div>
  );
};

export default ActiveMembershipCard;
