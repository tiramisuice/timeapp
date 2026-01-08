'use client';

import { Activity } from '../storage/db';
import TimerDisplay from './TimerDisplay';

interface ActivityButtonProps {
  activity: Activity;
  isActive: boolean;
  activeStartTime?: number;
  onClick: () => void;
}

export default function ActivityButton({ activity, isActive, activeStartTime, onClick }: ActivityButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`
        relative flex flex-col items-center justify-center p-4 rounded-xl transition-all active:scale-95
        ${isActive 
          ? `bg-gray-900 text-white shadow-lg ring-2 ring-offset-2 ring-gray-900 ${activity.color.replace('bg-', 'ring-')}` 
          : 'bg-white hover:bg-gray-50 border border-gray-100 shadow-sm'}
        aspect-square h-full w-full
      `}
    >
      <div className={`text-4xl mb-2 ${isActive ? 'scale-110' : ''} transition-transform`}>
        {activity.emoji}
      </div>
      
      <div className="font-semibold text-center leading-tight">
        {activity.name}
      </div>

      {isActive && activeStartTime && (
        <div className="mt-2 text-white/90">
          <TimerDisplay startTime={activeStartTime} />
        </div>
      )}
      
      {/* Color indicator dot if not active, or background tint? 
          Plan says "Active activity is clearly highlighted".
          I'm using dark mode for active.
          Maybe show color bar or dot.
      */}
      {!isActive && (
        <div className={`absolute top-3 right-3 w-2 h-2 rounded-full ${activity.color}`} />
      )}
    </button>
  );
}
