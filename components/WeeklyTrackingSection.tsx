'use client';

import { useState } from 'react';
import { ProjectMetrics } from '@/lib/project-service';
import { getWeeklyData } from '@/lib/weekly-service';
import { TimePeriodFilter, TimePeriod } from '@/components/TimePeriodFilter';
import { WeeklyChart } from '@/components/WeeklyChart';
import { WeeklyTable } from '@/components/WeeklyTable';

interface WeeklyTrackingSectionProps {
  projects: ProjectMetrics[];
}

export function WeeklyTrackingSection({ projects }: WeeklyTrackingSectionProps) {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('week');

  // Map time periods to weeks back
  const weeksMap: Record<TimePeriod, number> = {
    week: 1,
    month: 4,
    quarter: 12,
    year: 52,
    custom: 12, // Default for custom
  };

  const weeklyData = getWeeklyData(projects, weeksMap[timePeriod]);

  return (
    <div className="mb-8 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Time Tracking
        </h2>
        <TimePeriodFilter
          selected={timePeriod}
          onSelect={setTimePeriod}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WeeklyChart data={weeklyData} />
        <WeeklyTable data={weeklyData} />
      </div>
    </div>
  );
}
