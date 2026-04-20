import { authenticatedApiRequest } from '@/lib/api';

export const taskStatuses = ['open', 'completed'] as const;
export const taskPriorities = ['low', 'medium', 'high'] as const;
export const taskTimingFilters = ['all', 'overdue', 'upcoming'] as const;

export type TaskStatus = (typeof taskStatuses)[number];
export type TaskPriority = (typeof taskPriorities)[number];
export type TaskTimingFilter = (typeof taskTimingFilters)[number];

export interface TaskRecord {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  due_at: string | null;
  completed_at: string | null;
  priority: TaskPriority;
  application_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface TaskListResponse {
  items: TaskRecord[];
  total: number;
}

export interface TaskMutationPayload {
  title?: string;
  description?: string | null;
  status?: TaskStatus;
  due_at?: string | null;
  completed_at?: string | null;
  priority?: TaskPriority;
  application_id?: string | null;
}

export interface TaskListFilters {
  applicationId?: string;
  status?: TaskStatus | '';
  timing?: TaskTimingFilter;
}

function buildQueryString(filters: TaskListFilters): string {
  const params = new URLSearchParams();

  if (filters.applicationId) {
    params.set('application_id', filters.applicationId);
  }

  if (filters.status) {
    params.set('status', filters.status);
  }

  if (filters.timing) {
    params.set('timing', filters.timing);
  }

  const query = params.toString();
  return query ? `?${query}` : '';
}

export function toDateTimeInputValue(value: string | null): string {
  if (!value) {
    return '';
  }

  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60_000);
  return localDate.toISOString().slice(0, 16);
}

export function toIsoDateTime(value: string): string | null {
  if (!value) {
    return null;
  }

  return new Date(value).toISOString();
}

export function taskStatusLabel(status: TaskStatus): string {
  return status === 'completed' ? 'Completed' : 'Open';
}

export function taskPriorityLabel(priority: TaskPriority): string {
  return priority.charAt(0).toUpperCase() + priority.slice(1);
}

export async function listTasks(filters: TaskListFilters = {}): Promise<TaskListResponse> {
  return authenticatedApiRequest<TaskListResponse>(`/api/v1/tasks${buildQueryString(filters)}`);
}

export async function createTask(payload: TaskMutationPayload): Promise<TaskRecord> {
  return authenticatedApiRequest<TaskRecord>('/api/v1/tasks', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateTask(taskId: string, payload: TaskMutationPayload): Promise<TaskRecord> {
  return authenticatedApiRequest<TaskRecord>(`/api/v1/tasks/${taskId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function deleteTask(taskId: string): Promise<void> {
  return authenticatedApiRequest<void>(`/api/v1/tasks/${taskId}`, {
    method: 'DELETE',
  });
}
