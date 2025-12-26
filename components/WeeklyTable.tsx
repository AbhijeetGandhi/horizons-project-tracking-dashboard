'use client';

import { WeeklyData } from '@/lib/weekly-service';
import { useState } from 'react';
import React from 'react';

interface WeeklyTableProps {
  data: WeeklyData[];
}

export function WeeklyTable({ data }: WeeklyTableProps) {
  const [expandedWeek, setExpandedWeek] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
        <p className="text-gray-500 dark:text-gray-400 text-center">No weekly data available</p>
      </div>
    );
  }

  const toggleWeek = (index: number) => {
    setExpandedWeek(expandedWeek === index ? null : index);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Week
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Total Hours
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Projects
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Details
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {data.map((week, index) => (
              <React.Fragment key={index}>
                <tr
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                  onClick={() => toggleWeek(index)}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {week.weekLabel}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-blue-600 dark:text-blue-400">
                    {week.totalHours}h
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-700 dark:text-gray-300">
                    {week.projects.length}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <button
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleWeek(index);
                      }}
                    >
                      {expandedWeek === index ? '▼' : '▶'}
                    </button>
                  </td>
                </tr>

                {/* Expanded project details */}
                {expandedWeek === index && week.projects.length > 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 bg-gray-50 dark:bg-gray-900/50">
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                          Project Breakdown:
                        </h4>
                        <table className="min-w-full">
                          <thead>
                            <tr className="text-xs text-gray-500 dark:text-gray-400">
                              <th className="text-left pb-2">Project</th>
                              <th className="text-right pb-2">Hours</th>
                            </tr>
                          </thead>
                          <tbody className="text-sm">
                            {week.projects.map((project, pIdx) => (
                              <tr key={pIdx} className="border-t border-gray-200 dark:border-gray-700">
                                <td className="py-2 text-gray-900 dark:text-white">
                                  {project.projectName}
                                </td>
                                <td className="py-2 text-right font-medium text-blue-600 dark:text-blue-400">
                                  {project.hours}h
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
          <tfoot className="bg-gray-50 dark:bg-gray-900">
            <tr className="font-bold">
              <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                Total ({data.length} weeks)
              </td>
              <td className="px-6 py-4 text-right text-sm text-blue-600 dark:text-blue-400">
                {Math.round(data.reduce((sum, w) => sum + w.totalHours, 0) * 10) / 10}h
              </td>
              <td className="px-6 py-4"></td>
              <td className="px-6 py-4"></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
