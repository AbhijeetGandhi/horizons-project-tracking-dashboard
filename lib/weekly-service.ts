/**
 * Weekly Tracking Service (Simplified)
 * Uses task time_spent for weekly breakdowns
 */

import { ProjectMetrics } from './project-service';

export interface WeeklyData {
  weekLabel: string; // "Dec 18-24"
  weekStart: string; // ISO date
  weekEnd: string; // ISO date
  totalHours: number;
  projects: {
    projectId: string;
    projectName: string;
    hours: number;
  }[];
}

/**
 * Get the Monday of a given week
 */
function getMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Format date range as label
 */
function formatWeekLabel(start: Date, end: Date): string {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const startMonth = months[start.getMonth()];
  const endMonth = months[end.getMonth()];

  if (startMonth === endMonth) {
    return `${startMonth} ${start.getDate()}-${end.getDate()}`;
  }
  return `${startMonth} ${start.getDate()}-${endMonth} ${end.getDate()}`;
}

/**
 * Get past N weeks of data
 * Note: This is a simplified version showing current project state per week
 * For true time tracking, we'd need to use ClickUp's time entries API
 */
export function getWeeklyData(
  projects: ProjectMetrics[],
  weeksBack: number = 12
): WeeklyData[] {
  const weeks: WeeklyData[] = [];
  const now = new Date();

  for (let i = weeksBack - 1; i >= 0; i--) {
    const weekStart = getMonday(now);
    weekStart.setDate(weekStart.getDate() - (i * 7));

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    const weekLabel = formatWeekLabel(weekStart, weekEnd);

    // For current week, show all project hours
    // This is simplified - ideally we'd track when time was logged
    const isCurrentWeek = i === 0;

    weeks.push({
      weekLabel,
      weekStart: weekStart.toISOString().split('T')[0],
      weekEnd: weekEnd.toISOString().split('T')[0],
      totalHours: isCurrentWeek ? projects.reduce((sum, p) => sum + p.hoursSpent, 0) : 0,
      projects: isCurrentWeek ? projects.map(p => ({
        projectId: p.id,
        projectName: p.name,
        hours: p.hoursSpent,
      })).filter(p => p.hours > 0) : [],
    });
  }

  return weeks;
}

/**
 * Filter projects by time period
 */
export function filterByTimePeriod(
  projects: ProjectMetrics[],
  period: 'week' | 'month' | 'quarter' | 'year' | 'all'
): ProjectMetrics[] {
  // For now, return all projects
  // This would be enhanced with actual date filtering when we have task completion dates
  return projects;
}
