import { ProjectMetrics } from '@/lib/project-service';

interface ProjectsTableProps {
  projects: ProjectMetrics[];
}

function formatDueDate(dateString: string | null): string {
  if (!dateString) return '-';

  const date = new Date(parseInt(dateString));
  const now = new Date();
  const diffTime = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  // Format as MMM DD
  const formatted = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  if (diffDays < 0) return `${formatted} (overdue)`;
  if (diffDays === 0) return `${formatted} (today)`;
  if (diffDays === 1) return `${formatted} (tomorrow)`;
  return formatted;
}

function getNextDueDate(project: ProjectMetrics): string | null {
  const incompleteTasks = project.tasks.filter(t => !t.isCompleted && t.dueDate);
  if (incompleteTasks.length === 0) return null;

  // Find earliest due date
  const earliest = incompleteTasks.reduce((prev, curr) => {
    if (!prev.dueDate) return curr;
    if (!curr.dueDate) return prev;
    return parseInt(curr.dueDate) < parseInt(prev.dueDate) ? curr : prev;
  });

  return earliest.dueDate;
}

export function ProjectsTable({ projects }: ProjectsTableProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Project Name
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Progress
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Hours Spent
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Hours Estimated
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Hours Remaining
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Tasks
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Next Due Date
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {projects.map((project) => (
              <tr key={project.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {project.name}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="flex items-center justify-end gap-2">
                    <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${project.percentComplete}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {project.percentComplete}%
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold text-blue-600 dark:text-blue-400">
                  {project.hoursSpent}h
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-700 dark:text-gray-300">
                  {project.hoursEstimated}h
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold text-orange-600 dark:text-orange-400">
                  {project.hoursRemaining}h
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-700 dark:text-gray-300">
                  {project.completedTaskCount}/{project.taskCount}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-700 dark:text-gray-300">
                  {formatDueDate(getNextDueDate(project))}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-gray-50 dark:bg-gray-900">
            <tr className="font-bold">
              <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                Total ({projects.length} projects)
              </td>
              <td className="px-6 py-4"></td>
              <td className="px-6 py-4 text-right text-sm text-blue-600 dark:text-blue-400">
                {projects.reduce((sum, p) => sum + p.hoursSpent, 0).toFixed(1)}h
              </td>
              <td className="px-6 py-4 text-right text-sm text-gray-700 dark:text-gray-300">
                {projects.reduce((sum, p) => sum + p.hoursEstimated, 0).toFixed(1)}h
              </td>
              <td className="px-6 py-4 text-right text-sm text-orange-600 dark:text-orange-400">
                {projects.reduce((sum, p) => sum + p.hoursRemaining, 0).toFixed(1)}h
              </td>
              <td className="px-6 py-4 text-right text-sm text-gray-700 dark:text-gray-300">
                {projects.reduce((sum, p) => sum + p.completedTaskCount, 0)}/
                {projects.reduce((sum, p) => sum + p.taskCount, 0)}
              </td>
              <td className="px-6 py-4"></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
