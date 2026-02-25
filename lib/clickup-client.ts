/**
 * ClickUp API Client
 * Handles all API communication with ClickUp v2 API
 */

const CLICKUP_API_BASE = 'https://api.clickup.com/api/v2';

export interface ClickUpConfig {
  apiToken: string;
  teamId: string;
  spaceId: string;
  projectsFolderId: string;
}

export interface ClickUpList {
  id: string;
  name: string;
  folder: {
    id: string;
    name: string;
  };
  space: {
    id: string;
  };
  statuses: Array<{
    status: string;
    type: string;
    orderindex: number;
    color: string;
  }>;
}

export interface ClickUpTag {
  name: string;
  tag_fg: string;
  tag_bg: string;
}

export interface ClickUpTaskLocation {
  id: string;
  name: string;
}

export interface ClickUpTask {
  id: string;
  name: string;
  status: {
    status: string;
    type: string;
  };
  time_estimate: number | null; // milliseconds
  time_spent: number | null; // milliseconds
  due_date: string | null; // Unix timestamp in ms
  list: {
    id: string;
    name: string;
  };
  locations?: ClickUpTaskLocation[]; // Additional lists this task is added to
  tags?: ClickUpTag[];
  parent?: string | null; // Parent task ID if this is a subtask
  custom_fields?: Array<{
    id: string;
    name: string;
    type: string;
    value: any;
  }>;
}

export interface TimeEntryInterval {
  id: string;
  start: string;
  end: string;
  time: string; // milliseconds as string
}

export interface TimeEntryRaw {
  user: {
    id: number;
    username: string;
  };
  time: number; // total milliseconds
  intervals: TimeEntryInterval[];
}

// Flattened time entry for easier processing
export interface TimeEntry {
  id: string;
  duration: number; // milliseconds
  start: string;
  end: string | null;
  user: {
    id: string;
    username: string;
  };
}


export class ClickUpClient {
  private config: ClickUpConfig;

  constructor(config: ClickUpConfig) {
    this.config = config;
  }

  private async request<T>(endpoint: string): Promise<T> {
    const url = `${CLICKUP_API_BASE}${endpoint}`;

    const response = await fetch(url, {
      headers: {
        'Authorization': this.config.apiToken,
        'Content-Type': 'application/json',
      },
      // No caching - always fetch fresh data
      cache: 'no-store'
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `ClickUp API error (${response.status}): ${errorText}`
      );
    }

    return response.json();
  }

  /**
   * Get all lists (projects) in a folder
   */
  async getListsInFolder(folderId: string): Promise<ClickUpList[]> {
    const response = await this.request<{ lists: ClickUpList[] }>(
      `/folder/${folderId}/list`
    );
    return response.lists;
  }

  /**
   * Get all tasks in a list with pagination support
   */
  async getTasksInList(
    listId: string,
    page: number = 0
  ): Promise<ClickUpTask[]> {
    const response = await this.request<{ tasks: ClickUpTask[] }>(
      `/list/${listId}/task?page=${page}&include_closed=true&subtasks=true`
    );
    return response.tasks;
  }

  /**
   * Get all tasks for a list (handles pagination automatically)
   */
  async getAllTasksInList(listId: string): Promise<ClickUpTask[]> {
    let allTasks: ClickUpTask[] = [];
    let page = 0;
    let hasMore = true;

    while (hasMore) {
      const tasks = await this.getTasksInList(listId, page);
      allTasks = allTasks.concat(tasks);

      // ClickUp returns max 100 tasks per page
      hasMore = tasks.length === 100;
      page++;
    }

    return allTasks;
  }

  /**
   * Get time entries for a specific task
   * Flattens the intervals from the raw API response
   */
  async getTimeEntriesForTask(taskId: string): Promise<TimeEntry[]> {
    const response = await this.request<{ data: TimeEntryRaw[] }>(
      `/task/${taskId}/time`
    );

    // Flatten intervals from each user's time entries
    const entries: TimeEntry[] = [];
    for (const rawEntry of response.data || []) {
      for (const interval of rawEntry.intervals || []) {
        entries.push({
          id: interval.id,
          duration: parseInt(interval.time),
          start: interval.start,
          end: interval.end,
          user: {
            id: String(rawEntry.user.id),
            username: rawEntry.user.username,
          },
        });
      }
    }

    return entries;
  }

  /**
   * Get time entries within a date range for a team
   */
  async getTimeEntriesInRange(
    startDate: number,
    endDate: number
  ): Promise<TimeEntry[]> {
    const response = await this.request<{ data: TimeEntry[] }>(
      `/team/${this.config.teamId}/time_entries?start_date=${startDate}&end_date=${endDate}`
    );
    return response.data || [];
  }

  /**
   * Get tasks from a folder that are linked to a specific list via locations
   * This handles the case where tasks from Projects are added to Sprint lists
   */
  async getTasksLinkedToList(folderId: string, targetListId: string): Promise<ClickUpTask[]> {
    // Get all lists in the folder
    const lists = await this.getListsInFolder(folderId);

    // Fetch tasks from all lists in parallel
    const taskPromises = lists.map(list => this.getAllTasksInList(list.id));
    const taskArrays = await Promise.all(taskPromises);

    // Flatten and filter for tasks that have the target list in their locations
    const linkedTasks: ClickUpTask[] = [];
    for (const tasks of taskArrays) {
      for (const task of tasks) {
        if (task.locations && task.locations.some(loc => loc.id === targetListId)) {
          linkedTasks.push(task);
        }
      }
    }

    return linkedTasks;
  }

  /**
   * Get the projects folder ID from config
   */
  getProjectsFolderId(): string {
    return this.config.projectsFolderId;
  }
}

/**
 * Create a ClickUp client instance from environment variables
 */
export function createClickUpClient(): ClickUpClient {
  const config: ClickUpConfig = {
    apiToken: process.env.CLICKUP_API_TOKEN || '',
    teamId: process.env.CLICKUP_TEAM_ID || '',
    spaceId: process.env.CLICKUP_SPACE_ID || '',
    projectsFolderId: process.env.CLICKUP_PROJECTS_FOLDER_ID || '',
  };

  // Validate configuration
  if (!config.apiToken) {
    throw new Error('CLICKUP_API_TOKEN is not set');
  }
  if (!config.teamId) {
    throw new Error('CLICKUP_TEAM_ID is not set');
  }
  if (!config.projectsFolderId) {
    throw new Error('CLICKUP_PROJECTS_FOLDER_ID is not set');
  }

  return new ClickUpClient(config);
}
