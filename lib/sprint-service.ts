/**
 * Sprint Service
 * Fetches and aggregates sprint data for development vs maintenance analysis
 */

import { ClickUpClient, ClickUpTask, TimeEntry } from './clickup-client';

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
 * Check if a task is completed
 */
function isCompleted(task: ClickUpTask): boolean {
  const status = task.status.status.toLowerCase();
  const type = task.status.type?.toLowerCase();
  return status === 'complete' || type === 'closed' || type === 'done';
}

/**
 * Check if a task has any time logged
 */
function hasTimeLogged(task: ClickUpTask): boolean {
  return (task.time_spent || 0) > 0;
}

/**
 * Check if a task should be included in sprint analytics
 * Only completed and in-progress tasks are included
 */
function shouldIncludeTask(task: ClickUpTask): boolean {
  const status = task.status.status.toLowerCase();
  return isCompleted(task) || status === 'in progress';
}

/**
 * Extract project name from task - checks task locations (for tasks added to projects),
 * primary list, and task name patterns
 */
function extractProjectName(task: ClickUpTask, knownProjects: string[]): string | null {
  // First, check if the task has locations (additional lists it's added to)
  // This handles tasks created in sprints and added to project lists
  if (task.locations && task.locations.length > 0) {
    for (const location of task.locations) {
      const matchedFromLocation = knownProjects.find(p =>
        p.toLowerCase() === location.name.toLowerCase() ||
        location.name.toLowerCase().includes(p.toLowerCase()) ||
        p.toLowerCase().includes(location.name.toLowerCase())
      );
      if (matchedFromLocation) return matchedFromLocation;
    }
  }

  // Next, check if the task's primary list matches a known project
  // This handles tasks that are linked from the Projects folder
  if (task.list?.name) {
    const listName = task.list.name;
    const matchedFromList = knownProjects.find(p =>
      p.toLowerCase() === listName.toLowerCase() ||
      listName.toLowerCase().includes(p.toLowerCase()) ||
      p.toLowerCase().includes(listName.toLowerCase())
    );
    if (matchedFromList) return matchedFromList;
  }

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
 * Parse sprint date range into start and end timestamps
 * Returns null if parsing fails
 */
function parseSprintDateRange(sprintName: string): { start: number; end: number } | null {
  const dateRange = extractDateRange(sprintName);
  if (!dateRange) return null;

  // Pattern: "12/29 - 1/11"
  const match = dateRange.match(/(\d{1,2})\/(\d{1,2})\s*-\s*(\d{1,2})\/(\d{1,2})/);
  if (!match) return null;

  const [, startMonth, startDay, endMonth, endDay] = match;

  // Determine the year - assume current year, handle year boundary
  const now = new Date();
  let startYear = now.getFullYear();
  let endYear = now.getFullYear();

  // If end month < start month, end is in next year
  if (parseInt(endMonth) < parseInt(startMonth)) {
    endYear = startYear + 1;
  }

  // If start month is much larger than current month, it's from last year
  if (parseInt(startMonth) > now.getMonth() + 3) {
    startYear = startYear - 1;
    if (parseInt(endMonth) < parseInt(startMonth)) {
      endYear = startYear + 1;
    } else {
      endYear = startYear;
    }
  }

  // Create dates at start of day (local time) and end of day (local time)
  // Add buffer to end to ensure we capture all time entries on the last day
  const startDate = new Date(startYear, parseInt(startMonth) - 1, parseInt(startDay), 0, 0, 0, 0);
  const endDate = new Date(endYear, parseInt(endMonth) - 1, parseInt(endDay), 23, 59, 59, 999);

  return { start: startDate.getTime(), end: endDate.getTime() };
}

/**
 * Calculate hours from time entries within a date range
 */
function getHoursInRange(timeEntries: TimeEntry[], start: number, end: number): number {
  let totalMs = 0;
  for (const entry of timeEntries) {
    const entryStart = parseInt(entry.start);
    if (entryStart >= start && entryStart <= end) {
      totalMs += entry.duration;
    }
  }
  return totalMs / 1000 / 60 / 60;
}

/**
 * Process sprint tasks into SprintData
 * Includes completed tasks and in-progress tasks
 * For in-progress tasks, only counts time logged during the sprint period
 */
function processSprintTasks(
  sprintId: string,
  sprintName: string,
  tasks: ClickUpTask[],
  knownProjects: string[],
  taskTimeEntries: Map<string, TimeEntry[]>
): SprintData {
  // Filter for completed and in-progress tasks
  const includedTasks = tasks.filter(task => shouldIncludeTask(task));

  // Parse sprint date range for filtering in-progress task time
  const sprintRange = parseSprintDateRange(sprintName);

  const sprintTasks: SprintTask[] = [];

  for (const task of includedTasks) {
    let hoursSpent: number;

    if (isCompleted(task)) {
      // For completed tasks, use the task's total time_spent
      hoursSpent = msToHours(task.time_spent);
    } else {
      // For in-progress tasks, filter time entries by sprint date range
      const timeEntries = taskTimeEntries.get(task.id) || [];
      if (sprintRange && timeEntries.length > 0) {
        hoursSpent = getHoursInRange(timeEntries, sprintRange.start, sprintRange.end);
      } else if (timeEntries.length > 0) {
        // If no sprint range, use total from time entries
        hoursSpent = timeEntries.reduce((sum, e) => sum + e.duration, 0) / 1000 / 60 / 60;
      } else {
        // Fallback to task's time_spent
        hoursSpent = msToHours(task.time_spent);
      }
    }

    if (hoursSpent > 0) {
      sprintTasks.push({
        id: task.id,
        name: task.name,
        hoursSpent,
        isMaintenance: isMaintenance(task),
        projectName: extractProjectName(task, knownProjects),
      });
    }
  }

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
 * Also fetches tasks from Projects folder that are linked to each sprint
 */
export async function getSprintData(
  client: ClickUpClient,
  sprintFolderId: string,
  knownProjects: string[] = []
): Promise<SprintSummary> {
  // Get all sprint lists
  const sprintLists = await client.getListsInFolder(sprintFolderId);

  // Get the projects folder ID to find linked tasks
  const projectsFolderId = client.getProjectsFolderId();

  // Pre-fetch ALL tasks from Projects folder ONCE to avoid rate limits
  // Then filter locally for each sprint
  let allProjectTasks: ClickUpTask[] = [];
  if (projectsFolderId) {
    const projectLists = await client.getListsInFolder(projectsFolderId);
    const projectTaskPromises = projectLists.map(list => client.getAllTasksInList(list.id));
    const projectTaskArrays = await Promise.all(projectTaskPromises);
    allProjectTasks = projectTaskArrays.flat();
  }

  // Create a map of sprint list ID -> linked tasks from projects
  const sprintLinkedTasksMap = new Map<string, ClickUpTask[]>();
  for (const task of allProjectTasks) {
    if (task.locations) {
      for (const loc of task.locations) {
        const existing = sprintLinkedTasksMap.get(loc.id) || [];
        existing.push(task);
        sprintLinkedTasksMap.set(loc.id, existing);
      }
    }
  }

  // Fetch direct tasks for all sprints in parallel
  const sprintDataPromises = sprintLists.map(async (sprint) => {
    // Get tasks directly in the sprint list
    const directTasks = await client.getAllTasksInList(sprint.id);

    // Get linked tasks from pre-fetched project tasks
    const linkedTasks = sprintLinkedTasksMap.get(sprint.id) || [];

    // Combine and deduplicate tasks (by ID)
    const taskMap = new Map<string, ClickUpTask>();
    for (const task of directTasks) {
      taskMap.set(task.id, task);
    }
    for (const task of linkedTasks) {
      if (!taskMap.has(task.id)) {
        taskMap.set(task.id, task);
      }
    }

    const allTasks = Array.from(taskMap.values());

    // For in-progress tasks, fetch their time entries to filter by sprint date
    const inProgressTasks = allTasks.filter(t =>
      t.status.status.toLowerCase() === 'in progress'
    );

    // Fetch time entries for in-progress tasks (in parallel)
    const taskTimeEntries = new Map<string, TimeEntry[]>();
    if (inProgressTasks.length > 0) {
      const timeEntryPromises = inProgressTasks.map(async (task) => {
        try {
          const entries = await client.getTimeEntriesForTask(task.id);
          return { taskId: task.id, entries };
        } catch {
          return { taskId: task.id, entries: [] };
        }
      });

      const timeEntryResults = await Promise.all(timeEntryPromises);
      for (const result of timeEntryResults) {
        taskTimeEntries.set(result.taskId, result.entries);
      }
    }

    return processSprintTasks(sprint.id, sprint.name, allTasks, knownProjects, taskTimeEntries);
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
