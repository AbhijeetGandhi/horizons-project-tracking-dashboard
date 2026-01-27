'use client';

import { useState } from 'react';

interface SprintTask {
  id: string;
  name: string;
  hoursSpent: number;
  isMaintenance: boolean;
  projectName: string | null;
}

interface Sprint {
  id: string;
  name: string;
  dateRange: string | null;
  tasks: SprintTask[];
  totalHours: number;
  developmentHours: number;
  maintenanceHours: number;
}

interface SprintDetailsTableProps {
  sprints: Sprint[];
  totalDevelopmentHours: number;
  totalMaintenanceHours: number;
  totalHours: number;
}

function escapeCsvField(field: string): string {
  if (field.includes(',') || field.includes('"') || field.includes('\n')) {
    return `"${field.replace(/"/g, '""')}"`;
  }
  return field;
}

function exportSprintToCsv(sprint: Sprint) {
  const headers = ['Task Name', 'Project', 'Type', 'Hours'];
  const rows = sprint.tasks
    .sort((a, b) => b.hoursSpent - a.hoursSpent)
    .map(task => [
      escapeCsvField(task.name),
      escapeCsvField(task.projectName || 'Other'),
      task.isMaintenance ? 'Maintenance' : 'Development',
      task.hoursSpent.toFixed(2),
    ]);

  // Add summary row
  rows.push([]);
  rows.push(['SUMMARY', '', '', '']);
  rows.push(['Total Tasks', sprint.tasks.length.toString(), '', '']);
  rows.push(['Development Hours', '', '', sprint.developmentHours.toString()]);
  rows.push(['Maintenance Hours', '', '', sprint.maintenanceHours.toString()]);
  rows.push(['Total Hours', '', '', sprint.totalHours.toString()]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(',')),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${sprint.name.replace(/[^a-zA-Z0-9]/g, '_')}_tasks.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function exportAllSprintsToCsv(sprints: Sprint[]) {
  const headers = ['Sprint', 'Date Range', 'Task Name', 'Project', 'Type', 'Hours'];
  const rows: string[][] = [];

  for (const sprint of sprints) {
    for (const task of sprint.tasks.sort((a, b) => b.hoursSpent - a.hoursSpent)) {
      rows.push([
        escapeCsvField(sprint.name),
        escapeCsvField(sprint.dateRange || ''),
        escapeCsvField(task.name),
        escapeCsvField(task.projectName || 'Other'),
        task.isMaintenance ? 'Maintenance' : 'Development',
        task.hoursSpent.toFixed(2),
      ]);
    }
  }

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(',')),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `all_sprints_tasks.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function SprintDetailsTable({
  sprints,
  totalDevelopmentHours,
  totalMaintenanceHours,
  totalHours,
}: SprintDetailsTableProps) {
  // Get the latest 3 sprints (reversed so newest first)
  const latestSprints = [...sprints].reverse().slice(0, 3);
  const [expandedSprint, setExpandedSprint] = useState<string | null>(null);

  const toggleSprint = (sprintId: string) => {
    setExpandedSprint(expandedSprint === sprintId ? null : sprintId);
  };

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Recent Sprints (Task Breakdown)
        </h2>
        <button
          onClick={() => exportAllSprintsToCsv(latestSprints)}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Export All to CSV
        </button>
      </div>
      <div className="space-y-4">
        {latestSprints.map((sprint) => (
          <div
            key={sprint.id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            {/* Sprint Header - Clickable */}
            <button
              onClick={() => toggleSprint(sprint.id)}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <svg
                  className={`w-5 h-5 text-gray-500 transition-transform ${
                    expandedSprint === sprint.id ? 'rotate-90' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
                <div className="text-left">
                  <div className="font-semibold text-gray-900 dark:text-white">
                    {sprint.name}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {sprint.dateRange} • {sprint.tasks.length} tasks
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-6 text-sm">
                <div className="text-right">
                  <div className="text-blue-600 dark:text-blue-400 font-medium">
                    {sprint.developmentHours}h dev
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-orange-600 dark:text-orange-400 font-medium">
                    {sprint.maintenanceHours}h maint
                  </div>
                </div>
                <div className="text-right min-w-[60px]">
                  <div className="font-bold text-gray-900 dark:text-white">
                    {sprint.totalHours}h
                  </div>
                </div>
              </div>
            </button>

            {/* Expanded Task List */}
            {expandedSprint === sprint.id && (
              <div className="border-t border-gray-200 dark:border-gray-700">
                <div className="px-6 py-3 bg-gray-50 dark:bg-gray-900">
                  <div className="grid grid-cols-12 gap-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    <div className="col-span-5">Task</div>
                    <div className="col-span-3">Project</div>
                    <div className="col-span-2 text-right">Type</div>
                    <div className="col-span-2 text-right">Hours</div>
                  </div>
                </div>
                <div className="divide-y divide-gray-100 dark:divide-gray-700/50 max-h-96 overflow-y-auto">
                  {sprint.tasks.length === 0 ? (
                    <div className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 italic">
                      No tasks with hours in this sprint
                    </div>
                  ) : (
                    sprint.tasks
                      .sort((a, b) => b.hoursSpent - a.hoursSpent)
                      .map((task) => (
                        <div
                          key={task.id}
                          className="px-6 py-3 grid grid-cols-12 gap-4 text-sm hover:bg-gray-50 dark:hover:bg-gray-700/30"
                        >
                          <div className="col-span-5 text-gray-900 dark:text-white truncate">
                            {task.name}
                          </div>
                          <div className="col-span-3 text-gray-500 dark:text-gray-400 truncate">
                            {task.projectName || 'Other'}
                          </div>
                          <div className="col-span-2 text-right">
                            {task.isMaintenance ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400">
                                Maint
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                                Dev
                              </span>
                            )}
                          </div>
                          <div className="col-span-2 text-right font-medium text-gray-900 dark:text-white">
                            {task.hoursSpent.toFixed(1)}h
                          </div>
                        </div>
                      ))
                  )}
                </div>
                {/* Task Summary */}
                <div className="px-6 py-3 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="grid grid-cols-12 gap-4 text-sm font-medium flex-1">
                      <div className="col-span-5 text-gray-700 dark:text-gray-300">
                        Total ({sprint.tasks.length} tasks)
                      </div>
                      <div className="col-span-3"></div>
                      <div className="col-span-2 text-right text-gray-500">
                        {sprint.tasks.filter(t => t.isMaintenance).length} maint / {sprint.tasks.filter(t => !t.isMaintenance).length} dev
                      </div>
                      <div className="col-span-2 text-right text-gray-900 dark:text-white">
                        {sprint.totalHours}h
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        exportSprintToCsv(sprint);
                      }}
                      className="ml-4 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600 transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Export CSV
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* All Sprints Summary Table */}
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 mt-8">
        All Sprints Summary
      </h2>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Sprint
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Date Range
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Development
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Maintenance
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {sprints.map((sprint) => (
                <tr
                  key={sprint.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {sprint.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500 dark:text-gray-400">
                    {sprint.dateRange}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-blue-600 dark:text-blue-400">
                    {sprint.developmentHours}h
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-orange-600 dark:text-orange-400">
                    {sprint.maintenanceHours}h
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold text-gray-900 dark:text-white">
                    {sprint.totalHours}h
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50 dark:bg-gray-900">
              <tr className="font-bold">
                <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                  Total ({sprints.length} sprints)
                </td>
                <td className="px-6 py-4"></td>
                <td className="px-6 py-4 text-right text-sm text-blue-600 dark:text-blue-400">
                  {totalDevelopmentHours}h
                </td>
                <td className="px-6 py-4 text-right text-sm text-orange-600 dark:text-orange-400">
                  {totalMaintenanceHours}h
                </td>
                <td className="px-6 py-4 text-right text-sm text-gray-900 dark:text-white">
                  {totalHours}h
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
