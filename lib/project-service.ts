/**
 * Project Service
 * Aggregates ClickUp data into project metrics
 */

import { ClickUpClient, ClickUpTask } from './clickup-client';

export interface ProjectMetrics {
  id: string;
  name: string;
  hoursSpent: number;
  hoursEstimated: number;
  hoursRemaining: number;
  percentComplete: number;
  taskCount: number;
  completedTaskCount: number;
  tasks: TaskMetrics[];
  status: 'Not Started' | 'In Progress' | 'Completed';
  isLaunched: boolean;
}

export interface TaskMetrics {
  id: string;
  name: string;
  status: string;
  statusType: string; // 'open', 'closed', 'custom'
  hoursSpent: number;
  hoursEstimated: number;
  hoursRemaining: number;
  isCompleted: boolean;
  dueDate: string | null;
}

export interface DashboardSummary {
  projects: ProjectMetrics[];
  totalHoursSpent: number;
  totalHoursEstimated: number;
  totalHoursRemaining: number;
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
}

/**
 * Convert milliseconds to hours
 */
function msToHours(ms: number | null): number {
  if (!ms) return 0;
  return ms / 1000 / 60 / 60;
}

/**
 * Calculate task metrics from ClickUp task data
 */
function calculateTaskMetrics(task: ClickUpTask): TaskMetrics {
  const hoursSpent = msToHours(task.time_spent);
  const hoursEstimated = msToHours(task.time_estimate);
  const isCompleted = task.status.type === 'closed' || task.status.type === 'done';

  let hoursRemaining = 0;
  if (!isCompleted) {
    if (hoursEstimated > 0) {
      hoursRemaining = Math.max(0, hoursEstimated - hoursSpent);
    }
  }

  return {
    id: task.id,
    name: task.name,
    status: task.status.status,
    statusType: task.status.type,
    hoursSpent,
    hoursEstimated,
    hoursRemaining,
    isCompleted,
    dueDate: (task as any).due_date || null,
  };
}

/**
 * Determine if project is launched (has a completed "launch" task)
 */
function isProjectLaunched(tasks: TaskMetrics[]): boolean {
  return tasks.some(task =>
    task.name.toLowerCase().includes('launch') && task.isCompleted
  );
}

/**
 * Determine project status
 */
function getProjectStatus(
  tasks: TaskMetrics[],
  isLaunched: boolean,
  hoursSpent: number
): 'Not Started' | 'In Progress' | 'Completed' {
  if (isLaunched) {
    return 'Completed';
  }

  if (hoursSpent === 0 && tasks.every(t => !t.isCompleted)) {
    return 'Not Started';
  }

  return 'In Progress';
}

/**
 * Calculate project metrics from tasks
 */
function calculateProjectMetrics(
  projectId: string,
  projectName: string,
  tasks: ClickUpTask[]
): ProjectMetrics {
  const taskMetrics = tasks.map(calculateTaskMetrics);

  const hoursSpent = taskMetrics.reduce((sum, t) => sum + t.hoursSpent, 0);
  const hoursEstimated = taskMetrics.reduce((sum, t) => sum + t.hoursEstimated, 0);
  const hoursRemaining = taskMetrics.reduce((sum, t) => sum + t.hoursRemaining, 0);

  const completedTaskCount = taskMetrics.filter(t => t.isCompleted).length;
  const taskCount = taskMetrics.length;

  let percentComplete = 0;
  if (taskCount > 0 && completedTaskCount === taskCount) {
    // If all tasks are completed, show 100%
    percentComplete = 100;
  } else if (hoursEstimated > 0) {
    percentComplete = Math.min(100, (hoursSpent / hoursEstimated) * 100);
  } else if (taskCount > 0) {
    percentComplete = (completedTaskCount / taskCount) * 100;
  }

  const isLaunched = isProjectLaunched(taskMetrics);
  const status = getProjectStatus(taskMetrics, isLaunched, hoursSpent);

  return {
    id: projectId,
    name: projectName,
    hoursSpent: Math.round(hoursSpent * 10) / 10,
    hoursEstimated: Math.round(hoursEstimated * 10) / 10,
    hoursRemaining: Math.round(hoursRemaining * 10) / 10,
    percentComplete: Math.round(percentComplete),
    taskCount,
    completedTaskCount,
    tasks: taskMetrics,
    status,
    isLaunched,
  };
}

/**
 * Fetch and calculate all project metrics
 */
export async function getProjectMetrics(
  client: ClickUpClient,
  folderId: string
): Promise<ProjectMetrics[]> {
  // Get all lists (projects) in the folder
  const lists = await client.getListsInFolder(folderId);

  // Fetch tasks for each project in parallel
  const projectsWithTasks = await Promise.all(
    lists.map(async (list) => {
      const tasks = await client.getAllTasksInList(list.id);
      return {
        id: list.id,
        name: list.name,
        tasks,
      };
    })
  );

  // Calculate metrics for each project
  return projectsWithTasks.map(project =>
    calculateProjectMetrics(project.id, project.name, project.tasks)
  );
}

/**
 * Get dashboard summary with all metrics
 */
export async function getDashboardSummary(
  client: ClickUpClient,
  folderId: string
): Promise<DashboardSummary> {
  const projects = await getProjectMetrics(client, folderId);

  const totalHoursSpent = projects.reduce((sum, p) => sum + p.hoursSpent, 0);
  const totalHoursEstimated = projects.reduce((sum, p) => sum + p.hoursEstimated, 0);
  const totalHoursRemaining = projects.reduce((sum, p) => sum + p.hoursRemaining, 0);

  const completedProjects = projects.filter(p => p.status === 'Completed').length;
  const activeProjects = projects.length - completedProjects;

  return {
    projects: projects.sort((a, b) => b.hoursRemaining - a.hoursRemaining), // Sort by hours remaining desc
    totalHoursSpent: Math.round(totalHoursSpent * 10) / 10,
    totalHoursEstimated: Math.round(totalHoursEstimated * 10) / 10,
    totalHoursRemaining: Math.round(totalHoursRemaining * 10) / 10,
    totalProjects: projects.length,
    activeProjects,
    completedProjects,
  };
}
