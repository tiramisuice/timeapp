'use client';

import { useState, useEffect } from 'react';
import RangePicker from '@/components/RangePicker';
import TotalsList from '@/components/TotalsList';
import { getTodayRange, getLast7DaysRange, getCurrentMonthRange, DateRange } from '@/domain/ranges';
import { useTimeTrackerStore } from '@/store/timeTrackerStore';

export default function StatsPage() {
  const ranges = [getTodayRange(), getLast7DaysRange(), getCurrentMonthRange()];
  const [selectedRange, setSelectedRange] = useState<DateRange>(ranges[0]);
  
  const { activities, loadStats, isLoading } = useTimeTrackerStore();

  useEffect(() => {
    loadStats(selectedRange);
  }, [selectedRange, loadStats]);

  // Precompute lookups
  const colors = activities.reduce((acc, a) => ({ ...acc, [a.id]: a.color }), {});
  const emojis = activities.reduce((acc, a) => ({ ...acc, [a.id]: a.emoji }), {});
  const names = activities.reduce((acc, a) => ({ ...acc, [a.id]: a.name }), {});

  return (
    <div className="h-full flex flex-col p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Statistics</h1>
      
      <RangePicker 
        ranges={ranges}
        selectedRange={selectedRange}
        onSelect={setSelectedRange}
      />

      <div className="flex-1 overflow-y-auto">
        <TotalsList 
          colors={colors}
          emojis={emojis}
          names={names}
        />
      </div>
    </div>
  );
}
