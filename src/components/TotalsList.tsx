'use client';

import { useTimeTrackerStore } from '../store/timeTrackerStore';
import { formatDuration } from '../utils/format';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface TotalsListProps {
  colors: Record<string, string>; // activityId -> color class
  emojis: Record<string, string>; // activityId -> emoji
  names: Record<string, string>; // activityId -> name
}

// Helper to get hex color from tailwind class (simplified map for MVP)
// Since we store bg-blue-500, we need hex for Recharts.
const TW_COLORS: Record<string, string> = {
  'bg-blue-500': '#3b82f6',
  'bg-green-500': '#22c55e',
  'bg-orange-500': '#f97316',
  'bg-gray-500': '#6b7280',
  'bg-pink-500': '#ec4899',
  'bg-purple-500': '#a855f7',
  'bg-indigo-500': '#6366f1',
  'bg-yellow-500': '#eab308',
  'bg-red-500': '#ef4444',
  'bg-teal-500': '#14b8a6',
};

export default function TotalsList({ colors, emojis, names }: TotalsListProps) {
  const { statsData } = useTimeTrackerStore();

  if (!statsData) return <div className="text-center text-gray-400 mt-10">Loading stats...</div>;

  const { totalTime, activities } = statsData;

  if (totalTime === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-400">
        <div className="text-4xl mb-2">📉</div>
        <p>No activity tracked for this period</p>
      </div>
    );
  }

  // Prepare chart data
  const chartData = activities.map(item => ({
    name: names[item.activityId] || 'Unknown',
    value: item.duration,
    color: TW_COLORS[colors[item.activityId]] || '#ccc'
  })).filter(d => d.value > 0);

  return (
    <div className="space-y-6">
      {/* Total Time */}
      <div className="text-center mb-6">
        <div className="text-sm text-gray-500 uppercase tracking-wide">Total Time</div>
        <div className="text-4xl font-bold mt-1 text-gray-900">{formatDuration(totalTime)}</div>
      </div>

      {/* Chart */}
      <div className="h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: number) => formatDuration(value)}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* List */}
      <div className="space-y-3">
        {activities.map((item) => {
          const percent = Math.round((item.duration / totalTime) * 100);
          return (
            <div key={item.activityId} className="flex items-center justify-between bg-white p-3 rounded-lg shadow-sm border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="text-2xl">{emojis[item.activityId]}</div>
                <div>
                  <div className="font-medium">{names[item.activityId]}</div>
                  <div className="text-xs text-gray-400">{percent}%</div>
                </div>
              </div>
              <div className="font-mono font-medium text-gray-700">
                {formatDuration(item.duration)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
