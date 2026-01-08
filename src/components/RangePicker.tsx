'use client';

import { DateRange } from '../domain/ranges';

interface RangePickerProps {
  ranges: DateRange[];
  selectedRange: DateRange;
  onSelect: (range: DateRange) => void;
}

export default function RangePicker({ ranges, selectedRange, onSelect }: RangePickerProps) {
  return (
    <div className="bg-gray-100 p-1 rounded-lg flex text-sm font-medium mb-6">
      {ranges.map((range) => {
        const isSelected = selectedRange.label === range.label;
        return (
          <button
            key={range.label}
            onClick={() => onSelect(range)}
            className={`
              flex-1 py-2 rounded-md transition-all
              ${isSelected ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-gray-700'}
            `}
          >
            {range.label}
          </button>
        );
      })}
    </div>
  );
}
