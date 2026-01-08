'use client';

import { Session } from '../storage/db';

interface TimelineBarProps {
  sessions: Session[];
  colors: Record<string, string>;
  isToday?: boolean;
}

export default function TimelineBar({ sessions, colors, isToday }: TimelineBarProps) {
  if (sessions.length === 0) return null;

  // Calculate day boundaries
  // If Today: 00:00 to Now (or 24:00?) -> User said "day strip", usually fixed scale is better for comparison.
  // Let's use 00:00 to 24:00 fixed scale for consistent visualization.
  const startOfDay = new Date(sessions[0].startTime);
  startOfDay.setHours(0, 0, 0, 0);
  const startMs = startOfDay.getTime();
  const totalMs = 24 * 60 * 60 * 1000;

  return (
    <div className="mb-6">
      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Day Visualization</h3>
      <div className="h-8 bg-gray-100 rounded-lg overflow-hidden flex w-full relative">
        {sessions.map((session) => {
          const sStart = session.startTime;
          const sEnd = session.endTime || Date.now();
          
          // Clip to today boundaries (0-24h)
          const clippedStart = Math.max(sStart, startMs);
          const clippedEnd = Math.min(sEnd, startMs + totalMs);
          
          if (clippedEnd <= clippedStart) return null;

          const left = ((clippedStart - startMs) / totalMs) * 100;
          const width = ((clippedEnd - clippedStart) / totalMs) * 100;
          
          // Enforce min width for visibility (e.g. 0.5%)
          const visualWidth = Math.max(width, 0.5);

          return (
            <div
              key={session.id}
              className={`absolute top-0 bottom-0 ${colors[session.activityId] || 'bg-gray-400'}`}
              style={{
                left: `${left}%`,
                width: `${visualWidth}%`,
                opacity: 0.8
              }}
              title={new Date(sStart).toLocaleTimeString()}
            />
          );
        })}
        
        {/* Current time indicator if today */}
        {isToday && (
          <div 
            className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10"
            style={{
              left: `${((Date.now() - startMs) / totalMs) * 100}%`
            }}
          />
        )}
      </div>
      <div className="flex justify-between text-[10px] text-gray-400 mt-1">
        <span>00:00</span>
        <span>12:00</span>
        <span>24:00</span>
      </div>
    </div>
  );
}
