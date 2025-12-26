'use client';

import { WeeklyData } from '@/lib/weekly-service';

interface WeeklyChartProps {
  data: WeeklyData[];
}

export function WeeklyChart({ data }: WeeklyChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
        <p className="text-gray-500 dark:text-gray-400 text-center">No weekly data available</p>
      </div>
    );
  }

  const maxHours = Math.max(...data.map(w => w.totalHours), 1);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Weekly Hours Breakdown
      </h3>

      <div className="space-y-4">
        {data.map((week, index) => (
          <div key={index}>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {week.weekLabel}
              </span>
              <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                {week.totalHours}h
              </span>
            </div>

            {/* Bar */}
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-8 overflow-hidden">
              <div
                className="bg-blue-600 h-8 rounded-full flex items-center justify-end px-3 transition-all duration-300"
                style={{ width: `${(week.totalHours / maxHours) * 100}%` }}
              >
                {week.totalHours > 0 && (
                  <span className="text-xs font-medium text-white">
                    {week.totalHours}h
                  </span>
                )}
              </div>
            </div>

            {/* Project breakdown for this week */}
            {week.projects.length > 0 && (
              <div className="mt-2 ml-4 space-y-1">
                {week.projects.slice(0, 3).map((project, pIdx) => (
                  <div key={pIdx} className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                    <span className="truncate mr-2">{project.projectName}</span>
                    <span className="font-medium">{project.hours}h</span>
                  </div>
                ))}
                {week.projects.length > 3 && (
                  <div className="text-xs text-gray-500 dark:text-gray-500">
                    +{week.projects.length - 3} more projects
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Total ({data.length} weeks)
          </span>
          <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
            {Math.round(data.reduce((sum, w) => sum + w.totalHours, 0) * 10) / 10}h
          </span>
        </div>
      </div>
    </div>
  );
}
