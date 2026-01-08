'use client';

import { useState, useEffect } from 'react';
import RangePicker from '@/components/RangePicker';
import TotalsList from '@/components/TotalsList';
import Timeline from '@/components/Timeline';
import TimelineBar from '@/components/TimelineBar';
import { getTodayRange, getLast7DaysRange, getCurrentMonthRange, DateRange } from '@/domain/ranges';
import { useTimeTrackerStore } from '@/store/timeTrackerStore';

type ViewMode = 'overview' | 'timeline';
type AggregateMode = 'activity' | 'category';

export default function StatsPage() {
  const ranges = [getTodayRange(), getLast7DaysRange(), getCurrentMonthRange()];
  const [selectedRange, setSelectedRange] = useState<DateRange>(ranges[0]);
  const [viewMode, setViewMode] = useState<ViewMode>('overview');
  const [aggregateMode, setAggregateMode] = useState<AggregateMode>('activity');
  
  const { activities, loadStats, statsData, isLoading } = useTimeTrackerStore();

  useEffect(() => {
    loadStats(selectedRange);
  }, [selectedRange, loadStats]);

  // Precompute lookups
  const colors = activities.reduce((acc, a) => ({ ...acc, [a.id]: a.color }), {});
  const emojis = activities.reduce((acc, a) => ({ ...acc, [a.id]: a.emoji }), {});
  const names = activities.reduce((acc, a) => ({ ...acc, [a.id]: a.name }), {});

  const isToday = selectedRange.label === 'Today';

  return (
    <div className="h-full flex flex-col p-4 max-w-md mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Statistics</h1>
        
        {/* View Switcher */}
        <div className="flex bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setViewMode('overview')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
              viewMode === 'overview' ? 'bg-white shadow-sm text-black' : 'text-gray-500'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setViewMode('timeline')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
              viewMode === 'timeline' ? 'bg-white shadow-sm text-black' : 'text-gray-500'
            }`}
          >
            Timeline
          </button>
        </div>
      </div>
      
      <RangePicker 
        ranges={ranges}
        selectedRange={selectedRange}
        onSelect={setSelectedRange}
      />

      <div className="flex-1 overflow-y-auto pb-24 scrollbar-hide">
        {viewMode === 'overview' ? (
          <>
            {/* Aggregate Mode Switcher */}
            <div className="flex justify-center mb-4">
              <div className="flex bg-gray-50 p-0.5 rounded-lg text-xs">
                <button
                  onClick={() => setAggregateMode('activity')}
                  className={`px-3 py-1 rounded-md transition-all ${
                    aggregateMode === 'activity' ? 'bg-white shadow-sm text-black' : 'text-gray-400'
                  }`}
                >
                  By Activity
                </button>
                <button
                  onClick={() => setAggregateMode('category')}
                  className={`px-3 py-1 rounded-md transition-all ${
                    aggregateMode === 'category' ? 'bg-white shadow-sm text-black' : 'text-gray-400'
                  }`}
                >
                  By Category
                </button>
              </div>
            </div>

            <TotalsList 
              colors={colors}
              emojis={emojis}
              names={names}
              isToday={isToday}
              viewMode={aggregateMode}
            />
          </>
        ) : (
          <>
            {isToday && statsData?.sessions && (
              <TimelineBar 
                sessions={statsData.sessions}
                colors={colors}
                isToday={isToday}
              />
            )}
            <Timeline 
              sessions={statsData?.sessions || []}
              colors={colors}
              emojis={emojis}
              names={names}
            />
          </>
        )}
      </div>
    </div>
  );
}
