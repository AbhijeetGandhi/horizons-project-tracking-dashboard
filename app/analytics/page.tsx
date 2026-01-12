import { createClickUpClient } from '@/lib/clickup-client';
import { getSprintData } from '@/lib/sprint-service';
import { getProjectMetrics } from '@/lib/project-service';
import { SprintCharts } from '@/components/SprintCharts';
import { RefreshButton } from '@/components/RefreshButton';
import Link from 'next/link';

export const revalidate = 60; // Revalidate every 60 seconds

export default async function AnalyticsPage() {
  let sprintSummary;
  let error = null;

  try {
    const client = createClickUpClient();
    const folderId = process.env.CLICKUP_PROJECTS_FOLDER_ID || '';
    const sprintFolderId = process.env.CLICKUP_SPRINT_FOLDER_ID || '';

    if (!sprintFolderId) {
      throw new Error('CLICKUP_SPRINT_FOLDER_ID is not set');
    }

    // Get known project names from the Projects folder
    const projectMetrics = await getProjectMetrics(client, folderId);
    const knownProjects = projectMetrics.map(p => p.name);

    // Get sprint data
    sprintSummary = await getSprintData(client, sprintFolderId, knownProjects);
  } catch (e) {
    error = e instanceof Error ? e.message : 'Unknown error occurred';
    console.error('Error fetching analytics data:', e);
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <Link
              href="/"
              className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Dashboard
            </Link>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
            Weekly Analytics
          </h1>
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-red-800 dark:text-red-400 mb-2">
              Error Loading Analytics
            </h2>
            <p className="text-red-700 dark:text-red-300">{error}</p>
          </div>
        </div>
      </main>
    );
  }

  if (!sprintSummary) {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
            Weekly Analytics
          </h1>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
            <p className="text-yellow-800 dark:text-yellow-300">No data available</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-2 mb-4"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </Link>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                Weekly Analytics
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Development vs Maintenance time breakdown across all sprints
              </p>
            </div>
            <RefreshButton />
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Hours</div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {sprintSummary.totalHours}h
            </div>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Development Hours</div>
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {sprintSummary.totalDevelopmentHours}h
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {((sprintSummary.totalDevelopmentHours / sprintSummary.totalHours) * 100).toFixed(1)}% of total
            </div>
          </div>
          <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Maintenance Hours</div>
            <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
              {sprintSummary.totalMaintenanceHours}h
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {((sprintSummary.totalMaintenanceHours / sprintSummary.totalHours) * 100).toFixed(1)}% of total
            </div>
          </div>
        </div>

        {/* Charts */}
        <SprintCharts sprintSummary={sprintSummary} />

        {/* Sprint Details Table */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Sprint Details
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
                  {sprintSummary.sprints.map((sprint) => (
                    <tr key={sprint.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
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
                      Total ({sprintSummary.sprints.length} sprints)
                    </td>
                    <td className="px-6 py-4"></td>
                    <td className="px-6 py-4 text-right text-sm text-blue-600 dark:text-blue-400">
                      {sprintSummary.totalDevelopmentHours}h
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-orange-600 dark:text-orange-400">
                      {sprintSummary.totalMaintenanceHours}h
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-gray-900 dark:text-white">
                      {sprintSummary.totalHours}h
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>Last updated: {new Date().toLocaleString()}</p>
        </div>
      </div>
    </main>
  );
}
