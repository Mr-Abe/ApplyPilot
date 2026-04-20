'use client';

import { useCallback, useEffect, useState } from 'react';

import { formatDateTimeLabel } from '@/lib/applications';
import {
  createApplicationNote,
  deleteApplicationNote,
  listApplicationNotes,
  noteTypeLabel,
  noteTypes,
  updateApplicationNote,
  type NoteMutationPayload,
  type NoteRecord,
} from '@/lib/notes';

interface ApplicationNotesPanelProps {
  applicationId: string;
}

interface NoteFormValues {
  note_type: 'general' | 'interview' | 'call' | 'followup';
  body: string;
}

function buildInitialValues(note?: NoteRecord): NoteFormValues {
  return {
    note_type: note?.note_type ?? 'general',
    body: note?.body ?? '',
  };
}

export function ApplicationNotesPanel({ applicationId }: ApplicationNotesPanelProps) {
  const [items, setItems] = useState<NoteRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [createValues, setCreateValues] = useState<NoteFormValues>(buildInitialValues());
  const [editValues, setEditValues] = useState<Record<string, NoteFormValues>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadNotes = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await listApplicationNotes(applicationId);
      setItems(response.items);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to load notes for this application.');
    } finally {
      setIsLoading(false);
    }
  }, [applicationId]);

  useEffect(() => {
    void loadNotes();
  }, [loadNotes]);

  function updateCreateField<K extends keyof NoteFormValues>(field: K, value: NoteFormValues[K]) {
    setCreateValues((current) => ({ ...current, [field]: value }));
  }

  function updateEditField<K extends keyof NoteFormValues>(noteId: string, field: K, value: NoteFormValues[K]) {
    setEditValues((current) => ({
      ...current,
      [noteId]: {
        ...(current[noteId] ?? buildInitialValues(items.find((item) => item.id === noteId))),
        [field]: value,
      },
    }));
  }

  async function handleCreate(payload: NoteMutationPayload) {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await createApplicationNote(applicationId, payload);
      setCreateValues(buildInitialValues());
      setSuccessMessage('Note added successfully.');
      await loadNotes();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to save the note.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleUpdate(noteId: string, payload: NoteMutationPayload) {
    setErrorMessage(null);

    try {
      await updateApplicationNote(applicationId, noteId, payload);
      setEditingId(null);
      setSuccessMessage('Note updated successfully.');
      await loadNotes();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to update the note.');
    }
  }

  async function handleDelete(noteId: string) {
    setErrorMessage(null);

    try {
      await deleteApplicationNote(applicationId, noteId);
      setSuccessMessage('Note deleted successfully.');
      await loadNotes();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to delete the note.');
    }
  }

  return (
    <section className="card detail-panel">
      <div className="detail-panel__header">
        <div>
          <h2>Notes</h2>
          <p>Capture interview takeaways, call summaries, and follow-up context for this opportunity.</p>
        </div>
      </div>

      {successMessage ? <p className="auth-message auth-message--success">{successMessage}</p> : null}
      {errorMessage ? <p className="auth-message auth-message--error">{errorMessage}</p> : null}

      <div className="page-stack">
        <div className="detail-subpanel">
          <h3>Add note</h3>
          <form
            className="form-stack"
            onSubmit={(event) => {
              event.preventDefault();
              void handleCreate({
                note_type: createValues.note_type,
                body: createValues.body.trim(),
              });
            }}
          >
            <div className="form-grid">
              <label className="field">
                <span>Type</span>
                <select
                  onChange={(event) => updateCreateField('note_type', event.target.value as NoteFormValues['note_type'])}
                  value={createValues.note_type}
                >
                  {noteTypes.map((noteType) => (
                    <option key={noteType} value={noteType}>
                      {noteTypeLabel(noteType)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field field--full">
                <span>Note</span>
                <textarea
                  onChange={(event) => updateCreateField('body', event.target.value)}
                  required
                  rows={4}
                  value={createValues.body}
                />
              </label>
            </div>
            <button className="button" disabled={isSubmitting} type="submit">
              {isSubmitting ? 'Saving...' : 'Add note'}
            </button>
          </form>
        </div>

        <div className="detail-subpanel">
          <h3>Recent notes</h3>
          {isLoading ? <p>Loading notes...</p> : null}
          {!isLoading && items.length === 0 ? <p>No notes added yet for this application.</p> : null}
          {!isLoading && items.length > 0 ? (
            <div className="mini-list">
              {items.map((note) => {
                const currentValues = editValues[note.id] ?? buildInitialValues(note);

                return (
                  <article className="mini-list__item mini-list__item--stacked" key={note.id}>
                    <div className="resource-card__header">
                      <p className="note-meta-row">
                        <span className={`note-type-badge note-type-badge--${note.note_type}`}>{noteTypeLabel(note.note_type)}</span>
                        <span>Updated {formatDateTimeLabel(note.updated_at)}</span>
                      </p>
                      <div className="resource-card__actions">
                        <button
                          className="button button--secondary button--small"
                          onClick={() => setEditingId((current) => (current === note.id ? null : note.id))}
                          type="button"
                        >
                          {editingId === note.id ? 'Cancel' : 'Edit'}
                        </button>
                        <button className="button button--small" onClick={() => void handleDelete(note.id)} type="button">
                          Delete
                        </button>
                      </div>
                    </div>

                    {editingId === note.id ? (
                      <form
                        className="form-stack"
                        onSubmit={(event) => {
                          event.preventDefault();
                          void handleUpdate(note.id, {
                            note_type: currentValues.note_type,
                            body: currentValues.body.trim(),
                          });
                        }}
                      >
                        <div className="form-grid">
                          <label className="field">
                            <span>Type</span>
                            <select
                              onChange={(event) => updateEditField(note.id, 'note_type', event.target.value as NoteFormValues['note_type'])}
                              value={currentValues.note_type}
                            >
                              {noteTypes.map((noteType) => (
                                <option key={noteType} value={noteType}>
                                  {noteTypeLabel(noteType)}
                                </option>
                              ))}
                            </select>
                          </label>
                          <label className="field field--full">
                            <span>Note</span>
                            <textarea
                              onChange={(event) => updateEditField(note.id, 'body', event.target.value)}
                              required
                              rows={4}
                              value={currentValues.body}
                            />
                          </label>
                        </div>
                        <button className="button" type="submit">Save note</button>
                      </form>
                    ) : (
                      <p className="note-body">{note.body}</p>
                    )}
                  </article>
                );
              })}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
