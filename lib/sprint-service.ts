/**
 * Sprint Service
 * Fetches and aggregates sprint data for development vs maintenance analysis
 */

import { ClickUpClient, ClickUpTask } from './clickup-client';

export interface SprintTask {
  id: string;
  name: string;
  hoursSpent: number;
  isMaintenance: boolean;
  projectName: string | null; // Extracted from task name pattern like "Project: Task"
}

export interface SprintData {
  id: string;
  name: string;
  dateRange: string; // Extracted from name like "12/29 - 1/11"
  tasks: SprintTask[];
  totalHours: number;
  developmentHours: number;
  maintenanceHours: number;
}

export interface SprintSummary {
  sprints: SprintData[];
  totalDevelopmentHours: number;
  totalMaintenanceHours: number;
  totalHours: number;
  // Breakdown by project
  projectBreakdown: ProjectTimeBreakdown[];
}

export interface ProjectTimeBreakdown {
  projectName: string;
  developmentHours: number;
  maintenanceHours: number;
  totalHours: number;
}

/**
 * Convert milliseconds to hours
 */
function msToHours(ms: number | null): number {
  if (!ms) return 0;
  return ms / 1000 / 60 / 60;
}

/**
 * Check if a task is tagged as maintenance
 */
function isMaintenance(task: ClickUpTask): boolean {
  if (!task.tags || task.tags.length === 0) return false;
  return task.tags.some(tag => tag.name.toLowerCase() === 'maintenance');
}

/**
 * Extract project name from task - tries to match with known projects
 * or extracts from task name pattern
 */
function extractProjectName(task: ClickUpTask, knownProjects: string[]): string | null {
  // Check task name for project patterns like "ProjectName: Task" or "ProjectName - Task"
  const colonMatch = task.name.match(/^([^:]+):/);
  if (colonMatch) {
    const potentialProject = colonMatch[1].trim();
    // Check if it matches a known project
    const matchedProject = knownProjects.find(p =>
      p.toLowerCase().includes(potentialProject.toLowerCase()) ||
      potentialProject.toLowerCase().includes(p.toLowerCase())
    );
    if (matchedProject) return matchedProject;
  }

  // Try to match task name against known projects
  for (const project of knownProjects) {
    if (task.name.toLowerCase().includes(project.toLowerCase())) {
      return project;
    }
  }

  return null; // Will be categorized as "Other"
}

/**
 * Extract date range from sprint name
 */
function extractDateRange(sprintName: string): string {
  // Pattern: "Horizons 21 (12/29 - 1/11)"
  const match = sprintName.match(/\(([^)]+)\)/);
  return match ? match[1] : '';
}

/**
 * Process sprint tasks into SprintData
 */
function processSprintTasks(
  sprintId: string,
  sprintName: string,
  tasks: ClickUpTask[],
  knownProjects: string[]
): SprintData {
  const sprintTasks: SprintTask[] = tasks.map(task => {
    const hoursSpent = msToHours(task.time_spent);
    return {
      id: task.id,
      name: task.name,
      hoursSpent,
      isMaintenance: isMaintenance(task),
      projectName: extractProjectName(task, knownProjects),
    };
  });

  const totalHours = sprintTasks.reduce((sum, t) => sum + t.hoursSpent, 0);
  const maintenanceHours = sprintTasks
    .filter(t => t.isMaintenance)
    .reduce((sum, t) => sum + t.hoursSpent, 0);
  const developmentHours = totalHours - maintenanceHours;

  return {
    id: sprintId,
    name: sprintName,
    dateRange: extractDateRange(sprintName),
    tasks: sprintTasks,
    totalHours: Math.round(totalHours * 10) / 10,
    developmentHours: Math.round(developmentHours * 10) / 10,
    maintenanceHours: Math.round(maintenanceHours * 10) / 10,
  };
}

/**
 * Get all sprint data from the Sprint Folder
 */
export async function getSprintData(
  client: ClickUpClient,
  sprintFolderId: string,
  knownProjects: string[] = []
): Promise<SprintSummary> {
  // Get all sprint lists
  const sprintLists = await client.getListsInFolder(sprintFolderId);

  // Fetch tasks for all sprints in parallel
  const sprintDataPromises = sprintLists.map(async (sprint) => {
    const tasks = await client.getAllTasksInList(sprint.id);
    return processSprintTasks(sprint.id, sprint.name, tasks, knownProjects);
  });

  const sprints = await Promise.all(sprintDataPromises);

  // Sort sprints by name (they have numbered names like "Horizons 0", "Horizons 1", etc.)
  sprints.sort((a, b) => {
    const numA = parseInt(a.name.match(/\d+/)?.[0] || '0');
    const numB = parseInt(b.name.match(/\d+/)?.[0] || '0');
    return numA - numB;
  });

  // Calculate totals
  const totalDevelopmentHours = sprints.reduce((sum, s) => sum + s.developmentHours, 0);
  const totalMaintenanceHours = sprints.reduce((sum, s) => sum + s.maintenanceHours, 0);
  const totalHours = totalDevelopmentHours + totalMaintenanceHours;

  // Calculate project breakdown
  const projectMap = new Map<string, { dev: number; maint: number }>();

  for (const sprint of sprints) {
    for (const task of sprint.tasks) {
      const projectName = task.projectName || 'Other';
      const existing = projectMap.get(projectName) || { dev: 0, maint: 0 };

      if (task.isMaintenance) {
        existing.maint += task.hoursSpent;
      } else {
        existing.dev += task.hoursSpent;
      }

      projectMap.set(projectName, existing);
    }
  }

  const projectBreakdown: ProjectTimeBreakdown[] = Array.from(projectMap.entries())
    .map(([name, data]) => ({
      projectName: name,
      developmentHours: Math.round(data.dev * 10) / 10,
      maintenanceHours: Math.round(data.maint * 10) / 10,
      totalHours: Math.round((data.dev + data.maint) * 10) / 10,
    }))
    .sort((a, b) => b.totalHours - a.totalHours);

  return {
    sprints,
    totalDevelopmentHours: Math.round(totalDevelopmentHours * 10) / 10,
    totalMaintenanceHours: Math.round(totalMaintenanceHours * 10) / 10,
    totalHours: Math.round(totalHours * 10) / 10,
    projectBreakdown,
  };
}
