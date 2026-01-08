'use client';

import { useTimeTrackerStore } from '../store/timeTrackerStore';
import { formatDuration } from '../utils/format';
import { useEffect, useState } from 'react';
import { timeEngine } from '../domain/timeEngine';

interface ComparisonItem {
  activityId: string;
  todayDuration: number;
  avgDuration: number;
  diff: number;
}

export default function StatsComparison() {
  const { activities } = useTimeTrackerStore();
  const [comparisons, setComparisons] = useState<ComparisonItem[] | null>(null);

  useEffect(() => {
    timeEngine.getTodayComparison().then(setComparisons);
  }, []);

  if (!comparisons || comparisons.length === 0) return null;

  // Helpers to get name
  const getName = (id: string) => activities.find(a => a.id === id)?.name || 'Unknown';

  return (
    <div className="bg-blue-50 p-4 rounded-xl mb-6">
      <h3 className="text-xs font-bold text-blue-800 uppercase tracking-wide mb-3">Today vs 7D Avg</h3>
      <div className="space-y-3">
        {comparisons.map(item => {
          const isUp = item.diff > 0;
          return (
            <div key={item.activityId} className="flex justify-between items-center text-sm">
              <span className="font-medium text-blue-900">{getName(item.activityId)}</span>
              <div className="flex items-center gap-2">
                <span className="text-blue-900">{formatDuration(item.todayDuration)}</span>
                <span className="text-blue-400 text-xs">/</span>
                <span className="text-blue-600">{formatDuration(item.avgDuration)}</span>
                <span className={`text-xs font-medium ${isUp ? 'text-green-600' : 'text-red-500'}`}>
                  {isUp ? '↑' : '↓'} {formatDuration(Math.abs(item.diff))}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
