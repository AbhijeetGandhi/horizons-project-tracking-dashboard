'use client';

import { useState } from 'react';

export type TimePeriod = 'week' | 'month' | 'quarter' | 'year' | 'custom';

interface TimePeriodFilterProps {
  selected: TimePeriod;
  onSelect: (period: TimePeriod) => void;
  customStart?: string;
  customEnd?: string;
  onCustomDateChange?: (start: string, end: string) => void;
}

export function TimePeriodFilter({
  selected,
  onSelect,
  customStart,
  customEnd,
  onCustomDateChange,
}: TimePeriodFilterProps) {
  const [showCustomDates, setShowCustomDates] = useState(false);

  const periods: { value: TimePeriod; label: string }[] = [
    { value: 'week', label: 'Week' },
    { value: 'month', label: 'Month' },
    { value: 'quarter', label: 'Quarter' },
    { value: 'year', label: 'Year' },
    { value: 'custom', label: 'Custom' },
  ];

  const handlePeriodClick = (period: TimePeriod) => {
    onSelect(period);
    if (period === 'custom') {
      setShowCustomDates(true);
    } else {
      setShowCustomDates(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-2">
          Time Period:
        </span>

        {periods.map((period) => (
          <button
            key={period.value}
            onClick={() => handlePeriodClick(period.value)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              selected === period.value
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {period.label}
          </button>
        ))}
      </div>

      {/* Custom date inputs */}
      {showCustomDates && selected === 'custom' && onCustomDateChange && (
        <div className="mt-4 flex gap-4 items-center">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={customStart || ''}
              onChange={(e) => onCustomDateChange(e.target.value, customEnd || '')}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={customEnd || ''}
              onChange={(e) => onCustomDateChange(customStart || '', e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>
      )}
    </div>
  );
}
