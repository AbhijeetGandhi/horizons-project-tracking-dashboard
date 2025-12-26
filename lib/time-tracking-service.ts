/**
 * Time Tracking Service
 * Handles weekly and time-based tracking analytics
 */

import { ClickUpClient, TimeEntry } from './clickup-client';

export interface WeeklyBreakdown {
  weekStart: string; // ISO date string (Monday of the week)
  weekEnd: string; // ISO date string (Sunday of the week)
  totalHours: number;
  projectBreakdowns: ProjectWeeklyHours[];
}

export interface ProjectWeeklyHours {
  projectId: string;
  projectName: string;
  hours: number;
  taskBreakdowns: TaskWeeklyHours[];
}

export interface TaskWeeklyHours {
  taskId: string;
  taskName: string;
  hours: number;
}

/**
 * Get the Monday of the week for a given date
 */
function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  return new Date(d.setDate(diff));
}

/**
 * Get week start/end dates for the past N weeks
 */
function getWeekRanges(weeksBack: number = 12): Array<{ start: Date; end: Date }> {
  const ranges: Array<{ start: Date; end: Date }> = [];
  const now = new Date();

  for (let i = 0; i < weeksBack; i++) {
    const weekStart = getWeekStart(now);
    weekStart.setDate(weekStart.getDate() - (i * 7));
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    ranges.push({ start: weekStart, end: weekEnd });
  }

  return ranges.reverse(); // Oldest to newest
}

/**
 * Convert milliseconds to hours
 */
function msToHours(ms: number): number {
  return ms / 1000 / 60 / 60;
}

/**
 * Format date as ISO string (YYYY-MM-DD)
 */
function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Get weekly breakdown of hours across all projects
 */
export async function getWeeklyBreakdown(
  client: ClickUpClient,
  folderId: string,
  weeksBack: number = 12
): Promise<WeeklyBreakdown[]> {
  const weekRanges = getWeekRanges(weeksBack);
  const breakdowns: WeeklyBreakdown[] = [];

  // Get all lists (projects) in the folder
  const lists = await client.getListsInFolder(folderId);

  for (const weekRange of weekRanges) {
    const startTimestamp = Math.floor(weekRange.start.getTime());
    const endTimestamp = Math.floor(weekRange.end.getTime());

    // Fetch time entries for this week
    const timeEntries = await client.getTimeEntriesInRange(
      startTimestamp,
      endTimestamp
    );

    // Group by project and task
    const projectMap = new Map<string, ProjectWeeklyHours>();

    for (const entry of timeEntries) {
      const projectId = entry.task.id; // This would need to map to list ID in reality
      const projectName = 'Unknown'; // Would need to fetch from task data

      if (!projectMap.has(projectId)) {
        projectMap.set(projectId, {
          projectId,
          projectName,
          hours: 0,
          taskBreakdowns: [],
        });
      }

      const projectData = projectMap.get(projectId)!;
      projectData.hours += msToHours(entry.duration);

      // Add task breakdown
      const existingTask = projectData.taskBreakdowns.find(
        t => t.taskId === entry.task.id
      );

      if (existingTask) {
        existingTask.hours += msToHours(entry.duration);
      } else {
        projectData.taskBreakdowns.push({
          taskId: entry.task.id,
          taskName: entry.task.name,
          hours: msToHours(entry.duration),
        });
      }
    }

    const totalHours = Array.from(projectMap.values()).reduce(
      (sum, p) => sum + p.hours,
      0
    );

    breakdowns.push({
      weekStart: formatDate(weekRange.start),
      weekEnd: formatDate(weekRange.end),
      totalHours: Math.round(totalHours * 10) / 10,
      projectBreakdowns: Array.from(projectMap.values()).map(p => ({
        ...p,
        hours: Math.round(p.hours * 10) / 10,
        taskBreakdowns: p.taskBreakdowns.map(t => ({
          ...t,
          hours: Math.round(t.hours * 10) / 10,
        })),
      })),
    });
  }

  return breakdowns;
}

/**
 * Get time entries for a specific project within a date range
 */
export async function getProjectTimeInRange(
  client: ClickUpClient,
  projectId: string,
  startDate: Date,
  endDate: Date
): Promise<{ totalHours: number; entries: TimeEntry[] }> {
  const startTimestamp = Math.floor(startDate.getTime());
  const endTimestamp = Math.floor(endDate.getTime());

  const allEntries = await client.getTimeEntriesInRange(
    startTimestamp,
    endTimestamp
  );

  // Filter entries for tasks in this project
  // Note: This is simplified - in reality we'd need to map tasks to lists
  const projectEntries = allEntries.filter(entry => {
    // TODO: Filter by project/list ID
    return true;
  });

  const totalHours = projectEntries.reduce(
    (sum, entry) => sum + msToHours(entry.duration),
    0
  );

  return {
    totalHours: Math.round(totalHours * 10) / 10,
    entries: projectEntries,
  };
}
