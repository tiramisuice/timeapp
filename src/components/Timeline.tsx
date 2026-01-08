'use client';

import { Session } from '../storage/db';
import { formatDuration, formatTime, formatDate } from '../utils/format';

interface TimelineProps {
  sessions: Session[];
  emojis: Record<string, string>;
  names: Record<string, string>;
  colors: Record<string, string>;
}

export default function Timeline({ sessions, emojis, names, colors }: TimelineProps) {
  if (sessions.length === 0) {
    return <div className="text-center text-gray-400 py-8">No timeline data</div>;
  }

  // Group by date
  const groupedSessions: Record<string, Session[]> = {};
  sessions.forEach(session => {
    const dateKey = new Date(session.startTime).toDateString();
    if (!groupedSessions[dateKey]) {
      groupedSessions[dateKey] = [];
    }
    groupedSessions[dateKey].push(session);
  });

  return (
    <div className="space-y-6 pb-4">
      {Object.entries(groupedSessions).map(([dateKey, daysSessions]) => (
        <div key={dateKey}>
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 sticky top-0 bg-gray-50 py-2">
            {formatDate(new Date(dateKey))}
          </h3>
          
          <div className="space-y-0 relative">
            {/* Vertical line */}
            <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-gray-200"></div>

            {daysSessions.map((session) => {
              const isActive = session.endTime === null;
              const duration = isActive 
                ? Date.now() - session.startTime 
                : (session.endTime! - session.startTime);
              
              return (
                <div key={session.id} className="relative flex items-start gap-4 py-3 group">
                  {/* Dot */}
                  <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center bg-white border-2 ${colors[session.activityId]?.replace('bg-', 'border-') || 'border-gray-300'} shadow-sm`}>
                    <span className="text-sm">{emojis[session.activityId]}</span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 bg-white p-3 rounded-lg shadow-sm border border-gray-100">
                    <div className="flex justify-between items-start">
                      <div className="font-medium text-gray-900">
                        {names[session.activityId]}
                      </div>
                      <div className="text-xs font-mono text-gray-500">
                        {formatDuration(duration)}
                      </div>
                    </div>
                    
                    <div className="text-xs text-gray-400 mt-1">
                      {formatTime(new Date(session.startTime))} - {isActive ? 'Now' : formatTime(new Date(session.endTime!))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
