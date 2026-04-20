import { authenticatedApiRequest } from '@/lib/api';

export interface ContactRecord {
  id: string;
  company_name: string | null;
  full_name: string;
  title: string | null;
  email: string | null;
  linkedin_url: string | null;
  phone: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ContactListResponse {
  items: ContactRecord[];
  total: number;
}

export interface ContactMutationPayload {
  company_name?: string | null;
  full_name?: string;
  title?: string | null;
  email?: string | null;
  linkedin_url?: string | null;
  phone?: string | null;
  notes?: string | null;
}

export interface ContactListFilters {
  applicationId?: string;
}

function buildQueryString(filters: ContactListFilters): string {
  const params = new URLSearchParams();

  if (filters.applicationId) {
    params.set('application_id', filters.applicationId);
  }

  const query = params.toString();
  return query ? `?${query}` : '';
}

export async function listContacts(filters: ContactListFilters = {}): Promise<ContactListResponse> {
  return authenticatedApiRequest<ContactListResponse>(`/api/v1/contacts${buildQueryString(filters)}`);
}

export async function createContact(payload: ContactMutationPayload): Promise<ContactRecord> {
  return authenticatedApiRequest<ContactRecord>('/api/v1/contacts', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateContact(contactId: string, payload: ContactMutationPayload): Promise<ContactRecord> {
  return authenticatedApiRequest<ContactRecord>(`/api/v1/contacts/${contactId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function deleteContact(contactId: string): Promise<void> {
  return authenticatedApiRequest<void>(`/api/v1/contacts/${contactId}`, {
    method: 'DELETE',
  });
}

export async function linkContactToApplication(applicationId: string, contactId: string): Promise<ContactRecord> {
  return authenticatedApiRequest<ContactRecord>(`/api/v1/applications/${applicationId}/contacts/${contactId}`, {
    method: 'POST',
  });
}

export async function unlinkContactFromApplication(applicationId: string, contactId: string): Promise<void> {
  return authenticatedApiRequest<void>(`/api/v1/applications/${applicationId}/contacts/${contactId}`, {
    method: 'DELETE',
  });
}
