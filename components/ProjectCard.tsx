import { ProjectMetrics } from '@/lib/project-service';

interface ProjectCardProps {
  project: ProjectMetrics;
}

function getNextDueDate(project: ProjectMetrics): { date: string; isOverdue: boolean; label: string } | null {
  const incompleteTasks = project.tasks.filter(t => !t.isCompleted && t.dueDate);
  if (incompleteTasks.length === 0) return null;

  // Prioritize launch task if it exists and is incomplete
  const launchTask = incompleteTasks.find(t => t.name.toLowerCase().includes('launch') && t.dueDate);

  // Use launch task if found, otherwise find latest due date
  const latest = launchTask || incompleteTasks.reduce((prev, curr) => {
    if (!prev.dueDate) return curr;
    if (!curr.dueDate) return prev;
    return parseInt(curr.dueDate) > parseInt(prev.dueDate) ? curr : prev;
  });

  if (!latest.dueDate) return null;

  const date = new Date(parseInt(latest.dueDate));
  const now = new Date();
  const diffTime = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  const formatted = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const isOverdue = diffDays < 0;

  let label = formatted;
  if (diffDays < 0) label = `${formatted} (overdue)`;
  else if (diffDays === 0) label = `${formatted} (today)`;
  else if (diffDays === 1) label = `${formatted} (tomorrow)`;

  return { date: formatted, isOverdue, label };
}

export function ProjectCard({ project }: ProjectCardProps) {
  const statusColors = {
    'Not Started': 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
    'In Progress': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    'Completed': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  };

  const nextDue = getNextDueDate(project);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
          {project.name}
        </h3>
        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
          {project.percentComplete}%
        </span>
      </div>

      {/* Status badge */}
      <div className="mb-4">
        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${statusColors[project.status]}`}>
          {project.status}
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-4">
        <div
          className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
          style={{ width: `${project.percentComplete}%` }}
        />
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Hours Spent</div>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {project.hoursSpent}h
          </div>
        </div>
        <div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Estimated</div>
          <div className="text-2xl font-bold text-gray-700 dark:text-gray-300">
            {project.hoursEstimated}h
          </div>
        </div>
        <div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Remaining</div>
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
            {project.hoursRemaining}h
          </div>
        </div>
      </div>

      {/* Task count and budget */}
      <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-3">
        <span>Tasks: {project.completedTaskCount}/{project.taskCount}</span>
        {project.hoursEstimated > 0 && (
          <span>
            {project.hoursSpent > project.hoursEstimated && (
              <span className="text-red-600 dark:text-red-400 font-medium">
                Over budget by {Math.round((project.hoursSpent - project.hoursEstimated) * 10) / 10}h
              </span>
            )}
          </span>
        )}
      </div>

      {/* Due date */}
      {nextDue && (
        <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 text-sm">
            <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className={nextDue.isOverdue ? 'text-red-600 dark:text-red-400 font-medium' : 'text-gray-600 dark:text-gray-400'}>
              Due date: {nextDue.label}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
