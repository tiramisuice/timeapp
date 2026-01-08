'use client';

import { useTimeTrackerStore } from '../store/timeTrackerStore';
import { formatDuration } from '../utils/format';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import StatsComparison from './StatsComparison';

interface TotalsListProps {
  colors: Record<string, string>;
  emojis: Record<string, string>;
  names: Record<string, string>;
  isToday?: boolean; // New prop to optionally show comparison
  viewMode?: 'activity' | 'category'; // New prop
}

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
  'bg-cyan-500': '#06b6d4',
  'bg-lime-500': '#84cc16'
};

// Category colors mapping (static for now)
const CAT_COLORS: Record<string, string> = {
  'Output': '#3b82f6', // blue
  'Health': '#22c55e', // green
  'Social': '#ec4899', // pink
  'Life': '#eab308',   // yellow
  'Passive': '#6b7280', // gray
  'Other': '#9ca3af'
};

export default function TotalsList({ colors, emojis, names, isToday, viewMode = 'activity' }: TotalsListProps) {
  const { statsData } = useTimeTrackerStore();

  if (!statsData) return <div className="text-center text-gray-400 mt-10">Loading stats...</div>;

  const { totalTime, activities, categories } = statsData as any; // categories added in engine

  if (totalTime === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-400">
        <div className="text-4xl mb-2">📉</div>
        <p>No activity tracked for this period</p>
      </div>
    );
  }

  // Data preparation based on view mode
  let chartData = [];
  let listData = [];

  if (viewMode === 'category' && categories) {
    listData = categories;
    chartData = categories.map((item: any) => ({
      name: item.category,
      value: item.duration,
      color: CAT_COLORS[item.category] || '#ccc'
    }));
  } else {
    listData = activities;
    chartData = activities.map((item: any) => ({
      name: names[item.activityId] || 'Unknown',
      value: item.duration,
      color: TW_COLORS[colors[item.activityId]] || '#ccc'
    }));
  }
  
  chartData = chartData.filter((d: any) => d.value > 0);

  return (
    <div className="space-y-6">
      {/* Total Time */}
      <div className="text-center mb-6">
        <div className="text-sm text-gray-500 uppercase tracking-wide">Total Time</div>
        <div className="text-4xl font-bold mt-1 text-gray-900">{formatDuration(totalTime)}</div>
      </div>

      {/* Comparison (Only for Today) */}
      {isToday && <StatsComparison />}

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
              {chartData.map((entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: number | undefined) => value ? formatDuration(value) : ''}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* List */}
      <div className="space-y-3">
        {listData.map((item: any) => {
          const percent = Math.round((item.duration / totalTime) * 100);
          
          if (viewMode === 'category') {
             return (
              <div key={item.category} className="flex items-center justify-between bg-white p-3 rounded-lg shadow-sm border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: CAT_COLORS[item.category] || '#ccc' }} />
                  <div>
                    <div className="font-medium">{item.category}</div>
                    <div className="text-xs text-gray-400">{percent}%</div>
                  </div>
                </div>
                <div className="font-mono font-medium text-gray-700">
                  {formatDuration(item.duration)}
                </div>
              </div>
             );
          }

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
