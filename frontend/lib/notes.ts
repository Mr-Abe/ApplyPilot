import { authenticatedApiRequest } from '@/lib/api';

export const noteTypes = ['general', 'interview', 'call', 'followup'] as const;

export type NoteType = (typeof noteTypes)[number];

export interface NoteRecord {
  id: string;
  application_id: string | null;
  note_type: NoteType;
  body: string;
  created_at: string;
  updated_at: string;
}

export interface NoteListResponse {
  items: NoteRecord[];
  total: number;
}

export interface NoteMutationPayload {
  note_type?: NoteType;
  body?: string;
}

export function noteTypeLabel(noteType: NoteType): string {
  if (noteType === 'followup') {
    return 'Follow-up';
  }

  return noteType.charAt(0).toUpperCase() + noteType.slice(1);
}

export async function listApplicationNotes(applicationId: string): Promise<NoteListResponse> {
  return authenticatedApiRequest<NoteListResponse>(`/api/v1/applications/${applicationId}/notes`);
}

export async function createApplicationNote(applicationId: string, payload: NoteMutationPayload): Promise<NoteRecord> {
  return authenticatedApiRequest<NoteRecord>(`/api/v1/applications/${applicationId}/notes`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateApplicationNote(
  applicationId: string,
  noteId: string,
  payload: NoteMutationPayload,
): Promise<NoteRecord> {
  return authenticatedApiRequest<NoteRecord>(`/api/v1/applications/${applicationId}/notes/${noteId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function deleteApplicationNote(applicationId: string, noteId: string): Promise<void> {
  return authenticatedApiRequest<void>(`/api/v1/applications/${applicationId}/notes/${noteId}`, {
    method: 'DELETE',
  });
}
