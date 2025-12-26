import { createClickUpClient } from '@/lib/clickup-client';
import { getDashboardSummary } from '@/lib/project-service';
import { SummaryCards } from '@/components/SummaryCards';
import { ProjectsTable } from '@/components/ProjectsTable';
import { ProjectCard } from '@/components/ProjectCard';
import { RefreshButton } from '@/components/RefreshButton';
import { WeeklyTrackingSection } from '@/components/WeeklyTrackingSection';
import Link from 'next/link';

export const revalidate = 30; // Revalidate every 30 seconds

export default async function HomePage() {
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

  // Configuration for timeline calculation
  const teamSize = parseInt(process.env.TEAM_SIZE || '1');
  const hoursPerWeek = parseInt(process.env.HOURS_PER_WEEK || '40');

  if (error) {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
            Etherwise Project Tracker
          </h1>
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-red-800 dark:text-red-400 mb-2">
              Configuration Error
            </h2>
            <p className="text-red-700 dark:text-red-300">{error}</p>
            <div className="mt-4 text-sm text-red-600 dark:text-red-400">
              <p className="font-medium mb-2">Please ensure you have set up your .env.local file with:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>CLICKUP_API_TOKEN</li>
                <li>CLICKUP_TEAM_ID</li>
                <li>CLICKUP_PROJECTS_FOLDER_ID</li>
              </ul>
              <p className="mt-2">See .env.local.example for reference.</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!summary) {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
            Etherwise Project Tracker
          </h1>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
            <p className="text-yellow-800 dark:text-yellow-300">No data available</p>
          </div>
        </div>
      </main>
    );
  }

  // Filter for active projects only (Not Started or In Progress)
  const activeProjects = summary.projects.filter(
    p => p.status === 'Not Started' || p.status === 'In Progress'
  );

  // Calculate active project totals
  const activeHoursSpent = activeProjects.reduce((sum, p) => sum + p.hoursSpent, 0);
  const activeHoursEstimated = activeProjects.reduce((sum, p) => sum + p.hoursEstimated, 0);
  const activeHoursRemaining = activeProjects.reduce((sum, p) => sum + p.hoursRemaining, 0);

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Etherwise Project Tracker
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Overview of all active projects and their time tracking
            </p>
          </div>
          <div className="flex gap-3">
            <RefreshButton />
            <Link
              href="/completed"
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-sm flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              View Completed Projects ({summary.completedProjects})
            </Link>
          </div>
        </div>

        {/* Summary Cards - showing only active projects */}
        <SummaryCards
          summary={{
            ...summary,
            totalHoursSpent: activeHoursSpent,
            totalHoursEstimated: activeHoursEstimated,
            totalHoursRemaining: activeHoursRemaining,
            projects: activeProjects,
          }}
          teamSize={teamSize}
          hoursPerWeek={hoursPerWeek}
        />

        {/* Projects Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Not Started</div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {activeProjects.filter(p => p.status === 'Not Started').length}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">In Progress</div>
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {activeProjects.filter(p => p.status === 'In Progress').length}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Active</div>
            <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
              {activeProjects.length}
            </div>
          </div>
        </div>

        {/* Weekly Tracking Section */}
        <WeeklyTrackingSection projects={activeProjects} />

        {/* Projects Table - Active only */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Active Projects
          </h2>
          <ProjectsTable projects={activeProjects} />
        </div>

        {/* Project Cards Grid - Active only */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Project Details
          </h2>
          {activeProjects.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center border border-gray-200 dark:border-gray-700">
              <p className="text-gray-500 dark:text-gray-400">
                No active projects. All projects are completed! 🎉
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>Last updated: {new Date().toLocaleString()}</p>
        </div>
      </div>
    </main>
  );
}
