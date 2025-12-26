import { createClickUpClient } from '@/lib/clickup-client';
import { getDashboardSummary } from '@/lib/project-service';
import { ProjectsTable } from '@/components/ProjectsTable';
import { ProjectCard } from '@/components/ProjectCard';
import { RefreshButton } from '@/components/RefreshButton';
import Link from 'next/link';

export const revalidate = 30; // Revalidate every 30 seconds

export default async function CompletedProjectsPage() {
  let summary;
  let error = null;

  try {
    const client = createClickUpClient();
    const folderId = process.env.CLICKUP_PROJECTS_FOLDER_ID || '';
    summary = await getDashboardSummary(client, folderId);
  } catch (e) {
    error = e instanceof Error ? e.message : 'Unknown error occurred';
    console.error('Error fetching dashboard data:', e);
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <Link
              href="/"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              ← Back to Active Projects
            </Link>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
            Completed Projects
          </h1>
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-red-800 dark:text-red-400 mb-2">
              Configuration Error
            </h2>
            <p className="text-red-700 dark:text-red-300">{error}</p>
          </div>
        </div>
      </main>
    );
  }

  if (!summary) {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <Link
              href="/"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              ← Back to Active Projects
            </Link>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
            Completed Projects
          </h1>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
            <p className="text-yellow-800 dark:text-yellow-300">No data available</p>
          </div>
        </div>
      </main>
    );
  }

  // Filter for completed projects only
  const completedProjects = summary.projects.filter(p => p.status === 'Completed');

  // Calculate totals for completed projects
  const completedHoursSpent = completedProjects.reduce((sum, p) => sum + p.hoursSpent, 0);
  const completedHoursEstimated = completedProjects.reduce((sum, p) => sum + p.hoursEstimated, 0);

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Navigation */}
        <div className="mb-6 flex justify-between items-center">
          <Link
            href="/"
            className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-2"
          >
            <span>←</span> Back to Active Projects
          </Link>
          <RefreshButton />
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Completed Projects Archive
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Historical view of all completed projects
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6 shadow-sm border border-green-200 dark:border-green-800">
            <div className="text-sm font-medium text-green-600 dark:text-green-400 mb-2">
              Total Completed
            </div>
            <div className="text-3xl font-bold text-green-700 dark:text-green-300">
              {completedProjects.length}
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 shadow-sm border border-blue-200 dark:border-blue-800">
            <div className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-2">
              Total Hours Spent
            </div>
            <div className="text-3xl font-bold text-blue-700 dark:text-blue-300">
              {Math.round(completedHoursSpent * 10) / 10}h
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
              Total Hours Estimated
            </div>
            <div className="text-3xl font-bold text-gray-700 dark:text-gray-300">
              {Math.round(completedHoursEstimated * 10) / 10}h
            </div>
          </div>
        </div>

        {/* Variance Summary */}
        {completedHoursEstimated > 0 && (
          <div className="mb-8 bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Overall Performance
            </h3>
            <div className="flex items-center gap-4">
              <div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Variance: </span>
                <span className={`text-lg font-bold ${
                  completedHoursSpent > completedHoursEstimated
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-green-600 dark:text-green-400'
                }`}>
                  {completedHoursSpent > completedHoursEstimated ? '+' : '-'}
                  {Math.abs(Math.round((completedHoursSpent - completedHoursEstimated) * 10) / 10)}h
                </span>
              </div>
              <div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Efficiency: </span>
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  {Math.round((completedHoursEstimated / completedHoursSpent) * 100)}%
                </span>
              </div>
            </div>
          </div>
        )}

        {completedProjects.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center border border-gray-200 dark:border-gray-700">
            <div className="text-gray-400 dark:text-gray-500 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No Completed Projects Yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Completed projects will appear here once they have a completed "launch" task.
            </p>
          </div>
        ) : (
          <>
            {/* Projects Table */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                All Completed Projects
              </h2>
              <ProjectsTable projects={completedProjects} />
            </div>

            {/* Project Cards Grid */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Project Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {completedProjects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            </div>
          </>
        )}

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>Last updated: {new Date().toLocaleString()}</p>
        </div>
      </div>
    </main>
  );
}
