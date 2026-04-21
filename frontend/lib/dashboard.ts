import type { ApplicationStatus } from '@/lib/applications';
import { authenticatedApiRequest } from '@/lib/api';
import type { TaskPriority, TaskStatus } from '@/lib/tasks';

export interface DashboardSummary {
  active_applications: number;
  open_tasks: number;
  overdue_tasks: number;
  upcoming_tasks: number;
}

export interface DashboardStatusItem {
  status: ApplicationStatus;
  count: number;
}

export interface DashboardStatusBreakdown {
  items: DashboardStatusItem[];
}

export interface DashboardTaskItem {
  id: string;
  title: string;
  priority: TaskPriority;
  status: TaskStatus;
  due_at: string | null;
  application_id: string | null;
  application_company_name: string | null;
  application_job_title: string | null;
}

export interface DashboardTaskListResponse {
  items: DashboardTaskItem[];
  total: number;
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  return authenticatedApiRequest<DashboardSummary>('/api/v1/dashboard/summary');
}

export async function getDashboardStatusBreakdown(): Promise<DashboardStatusBreakdown> {
  return authenticatedApiRequest<DashboardStatusBreakdown>('/api/v1/dashboard/status-breakdown');
}

export async function getDashboardOverdueTasks(limit = 5): Promise<DashboardTaskListResponse> {
  return authenticatedApiRequest<DashboardTaskListResponse>(`/api/v1/dashboard/tasks/overdue?limit=${limit}`);
}

export async function getDashboardUpcomingTasks(limit = 5): Promise<DashboardTaskListResponse> {
  return authenticatedApiRequest<DashboardTaskListResponse>(`/api/v1/dashboard/tasks/upcoming?limit=${limit}`);
}
