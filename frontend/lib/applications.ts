import { authenticatedApiRequest } from '@/lib/api';

export const applicationStatuses = [
  'wishlist',
  'applying',
  'applied',
  'screening',
  'interview',
  'final_round',
  'offer',
  'rejected',
  'withdrawn',
] as const;

export type ApplicationStatus = (typeof applicationStatuses)[number];
export type ApplicationSortField = 'date_applied' | 'next_action_due_at';
export type SortOrder = 'asc' | 'desc';
export type ArchiveState = 'active' | 'archived' | 'all';

export interface ApplicationRecord {
  id: string;
  company_name: string;
  job_title: string;
  location: string | null;
  work_type: string | null;
  source: string | null;
  posting_url: string | null;
  salary_min: number | null;
  salary_max: number | null;
  resume_version: string | null;
  cover_letter_version: string | null;
  date_found: string | null;
  date_applied: string | null;
  status: ApplicationStatus;
  next_action: string | null;
  next_action_due_at: string | null;
  notes_summary: string | null;
  archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface ApplicationListResponse {
  items: ApplicationRecord[];
  total: number;
}

export interface ApplicationListFilters {
  archiveState?: ArchiveState;
  search?: string;
  sortBy?: ApplicationSortField;
  sortOrder?: SortOrder;
  status?: ApplicationStatus | '';
}

export interface ApplicationMutationPayload {
  company_name?: string;
  job_title?: string;
  location?: string | null;
  work_type?: string | null;
  source?: string | null;
  posting_url?: string | null;
  salary_min?: number | null;
  salary_max?: number | null;
  resume_version?: string | null;
  cover_letter_version?: string | null;
  date_found?: string | null;
  date_applied?: string | null;
  status?: ApplicationStatus;
  next_action?: string | null;
  next_action_due_at?: string | null;
  notes_summary?: string | null;
  archived?: boolean;
}

function buildQueryString(filters: ApplicationListFilters): string {
  const params = new URLSearchParams();

  if (filters.status) {
    params.set('status', filters.status);
  }

  if (filters.search?.trim()) {
    params.set('search', filters.search.trim());
  }

  if (filters.sortBy) {
    params.set('sort_by', filters.sortBy);
  }

  if (filters.sortOrder) {
    params.set('sort_order', filters.sortOrder);
  }

  if (filters.archiveState) {
    params.set('archive_state', filters.archiveState);
  }

  const query = params.toString();
  return query ? `?${query}` : '';
}

export function formatDateLabel(value: string | null): string {
  if (!value) {
    return '—';
  }

  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
  }).format(new Date(value));
}

export function formatDateTimeLabel(value: string | null): string {
  if (!value) {
    return '—';
  }

  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

export function formatCurrencyRange(min: number | null, max: number | null): string {
  if (min === null && max === null) {
    return '—';
  }

  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  });

  if (min !== null && max !== null) {
    return `${formatter.format(min)} – ${formatter.format(max)}`;
  }

  if (min !== null) {
    return `From ${formatter.format(min)}`;
  }

  return `Up to ${formatter.format(max as number)}`;
}

export function toDateInputValue(value: string | null): string {
  return value ?? '';
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

export async function listApplications(filters: ApplicationListFilters): Promise<ApplicationListResponse> {
  return authenticatedApiRequest<ApplicationListResponse>(`/api/v1/applications${buildQueryString(filters)}`);
}

export async function getApplication(applicationId: string): Promise<ApplicationRecord> {
  return authenticatedApiRequest<ApplicationRecord>(`/api/v1/applications/${applicationId}`);
}

export async function createApplication(payload: ApplicationMutationPayload): Promise<ApplicationRecord> {
  return authenticatedApiRequest<ApplicationRecord>('/api/v1/applications', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateApplication(applicationId: string, payload: ApplicationMutationPayload): Promise<ApplicationRecord> {
  return authenticatedApiRequest<ApplicationRecord>(`/api/v1/applications/${applicationId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function archiveApplication(applicationId: string): Promise<ApplicationRecord> {
  return updateApplication(applicationId, { archived: true });
}
