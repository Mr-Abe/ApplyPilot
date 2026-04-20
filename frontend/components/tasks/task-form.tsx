'use client';

import { useMemo, useState } from 'react';

import {
  taskPriorities,
  taskStatuses,
  toDateTimeInputValue,
  toIsoDateTime,
  type TaskMutationPayload,
  type TaskRecord,
} from '@/lib/tasks';

interface TaskFormProps {
  initialValues?: Partial<TaskRecord>;
  defaultApplicationId?: string;
  hideApplicationField?: boolean;
  onSubmit: (payload: TaskMutationPayload) => Promise<void>;
  submitLabel: string;
}

interface FormValues {
  title: string;
  description: string;
  status: 'open' | 'completed';
  due_at: string;
  priority: 'low' | 'medium' | 'high';
  application_id: string;
}

function buildInitialValues(initialValues?: Partial<TaskRecord>, defaultApplicationId?: string): FormValues {
  return {
    title: initialValues?.title ?? '',
    description: initialValues?.description ?? '',
    status: initialValues?.status ?? 'open',
    due_at: toDateTimeInputValue(initialValues?.due_at ?? null),
    priority: initialValues?.priority ?? 'medium',
    application_id: initialValues?.application_id ?? defaultApplicationId ?? '',
  };
}

function normalizeOptional(value: string): string | null {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

export function TaskForm({
  initialValues,
  defaultApplicationId,
  hideApplicationField = false,
  onSubmit,
  submitLabel,
}: TaskFormProps) {
  const initialState = useMemo(
    () => buildInitialValues(initialValues, defaultApplicationId),
    [defaultApplicationId, initialValues],
  );
  const [values, setValues] = useState<FormValues>(initialState);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField<K extends keyof FormValues>(field: K, value: FormValues[K]) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await onSubmit({
        title: values.title.trim(),
        description: normalizeOptional(values.description),
        status: values.status,
        due_at: values.due_at ? toIsoDateTime(values.due_at) : null,
        priority: values.priority,
        application_id: hideApplicationField ? defaultApplicationId ?? null : normalizeOptional(values.application_id),
      });

      if (!initialValues?.id) {
        setValues(buildInitialValues(undefined, defaultApplicationId));
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to save the task.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="form-stack" onSubmit={handleSubmit}>
      {errorMessage ? <p className="auth-message auth-message--error">{errorMessage}</p> : null}
      <div className="form-grid">
        <label className="field field--full">
          <span>Title</span>
          <input onChange={(event) => updateField('title', event.target.value)} required value={values.title} />
        </label>
        <label className="field field--full">
          <span>Description</span>
          <textarea onChange={(event) => updateField('description', event.target.value)} rows={3} value={values.description} />
        </label>
        <label className="field">
          <span>Status</span>
          <select onChange={(event) => updateField('status', event.target.value as FormValues['status'])} value={values.status}>
            {taskStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Priority</span>
          <select onChange={(event) => updateField('priority', event.target.value as FormValues['priority'])} value={values.priority}>
            {taskPriorities.map((priority) => (
              <option key={priority} value={priority}>
                {priority}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Due date</span>
          <input onChange={(event) => updateField('due_at', event.target.value)} type="datetime-local" value={values.due_at} />
        </label>
        {!hideApplicationField ? (
          <label className="field">
            <span>Application ID</span>
            <input onChange={(event) => updateField('application_id', event.target.value)} placeholder="Optional application UUID" value={values.application_id} />
          </label>
        ) : null}
      </div>
      <button className="button" disabled={isSubmitting} type="submit">
        {isSubmitting ? 'Saving...' : submitLabel}
      </button>
    </form>
  );
}
