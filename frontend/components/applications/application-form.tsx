'use client';

import { useEffect, useMemo, useState } from 'react';

import {
  applicationStatuses,
  type ApplicationMutationPayload,
  type ApplicationRecord,
  toDateInputValue,
  toDateTimeInputValue,
  toIsoDateTime,
} from '@/lib/applications';

interface ApplicationFormProps {
  initialValues?: Partial<ApplicationRecord>;
  onSubmit: (payload: ApplicationMutationPayload) => Promise<void>;
  submitLabel: string;
}

interface FormValues {
  company_name: string;
  job_title: string;
  location: string;
  work_type: string;
  source: string;
  posting_url: string;
  salary_min: string;
  salary_max: string;
  resume_version: string;
  cover_letter_version: string;
  date_found: string;
  date_applied: string;
  status: (typeof applicationStatuses)[number];
  next_action: string;
  next_action_due_at: string;
  notes_summary: string;
}

function buildInitialValues(values?: Partial<ApplicationRecord>): FormValues {
  return {
    company_name: values?.company_name ?? '',
    job_title: values?.job_title ?? '',
    location: values?.location ?? '',
    work_type: values?.work_type ?? '',
    source: values?.source ?? '',
    posting_url: values?.posting_url ?? '',
    salary_min: values?.salary_min?.toString() ?? '',
    salary_max: values?.salary_max?.toString() ?? '',
    resume_version: values?.resume_version ?? '',
    cover_letter_version: values?.cover_letter_version ?? '',
    date_found: toDateInputValue(values?.date_found ?? null),
    date_applied: toDateInputValue(values?.date_applied ?? null),
    status: values?.status ?? 'wishlist',
    next_action: values?.next_action ?? '',
    next_action_due_at: toDateTimeInputValue(values?.next_action_due_at ?? null),
    notes_summary: values?.notes_summary ?? '',
  };
}

export function ApplicationForm({ initialValues, onSubmit, submitLabel }: ApplicationFormProps) {
  const [values, setValues] = useState<FormValues>(() => buildInitialValues(initialValues));
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setValues(buildInitialValues(initialValues));
    setFormError(null);
  }, [initialValues]);

  const canSubmit = useMemo(() => {
    return values.company_name.trim() !== '' && values.job_title.trim() !== '' && !isSubmitting;
  }, [isSubmitting, values.company_name, values.job_title]);

  function updateField<K extends keyof FormValues>(field: K, value: FormValues[K]) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  function toPayload(): ApplicationMutationPayload {
    return {
      company_name: values.company_name.trim(),
      job_title: values.job_title.trim(),
      location: values.location.trim() || null,
      work_type: values.work_type.trim() || null,
      source: values.source.trim() || null,
      posting_url: values.posting_url.trim() || null,
      salary_min: values.salary_min ? Number(values.salary_min) : null,
      salary_max: values.salary_max ? Number(values.salary_max) : null,
      resume_version: values.resume_version.trim() || null,
      cover_letter_version: values.cover_letter_version.trim() || null,
      date_found: values.date_found || null,
      date_applied: values.date_applied || null,
      status: values.status,
      next_action: values.next_action.trim() || null,
      next_action_due_at: toIsoDateTime(values.next_action_due_at),
      notes_summary: values.notes_summary.trim() || null,
    };
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    setIsSubmitting(true);

    try {
      await onSubmit(toPayload());
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Unable to save the application.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="application-form-stack">
      {formError ? <p className="auth-message auth-message--error">{formError}</p> : null}
      <form className="application-form" onSubmit={handleSubmit}>
        <div className="form-grid form-grid--two">
          <label className="field">
            <span>Company name</span>
            <input onChange={(event) => updateField('company_name', event.target.value)} required value={values.company_name} />
          </label>
          <label className="field">
            <span>Job title</span>
            <input onChange={(event) => updateField('job_title', event.target.value)} required value={values.job_title} />
          </label>
          <label className="field">
            <span>Location</span>
            <input onChange={(event) => updateField('location', event.target.value)} value={values.location} />
          </label>
          <label className="field">
            <span>Work type</span>
            <input onChange={(event) => updateField('work_type', event.target.value)} placeholder="Remote, hybrid, onsite" value={values.work_type} />
          </label>
          <label className="field">
            <span>Source</span>
            <input onChange={(event) => updateField('source', event.target.value)} value={values.source} />
          </label>
          <label className="field">
            <span>Posting URL</span>
            <input onChange={(event) => updateField('posting_url', event.target.value)} type="url" value={values.posting_url} />
          </label>
          <label className="field">
            <span>Salary min</span>
            <input min="0" onChange={(event) => updateField('salary_min', event.target.value)} type="number" value={values.salary_min} />
          </label>
          <label className="field">
            <span>Salary max</span>
            <input min="0" onChange={(event) => updateField('salary_max', event.target.value)} type="number" value={values.salary_max} />
          </label>
          <label className="field">
            <span>Resume version</span>
            <input onChange={(event) => updateField('resume_version', event.target.value)} value={values.resume_version} />
          </label>
          <label className="field">
            <span>Cover letter version</span>
            <input onChange={(event) => updateField('cover_letter_version', event.target.value)} value={values.cover_letter_version} />
          </label>
          <label className="field">
            <span>Date found</span>
            <input onChange={(event) => updateField('date_found', event.target.value)} type="date" value={values.date_found} />
          </label>
          <label className="field">
            <span>Date applied</span>
            <input onChange={(event) => updateField('date_applied', event.target.value)} type="date" value={values.date_applied} />
          </label>
          <label className="field">
            <span>Status</span>
            <select onChange={(event) => updateField('status', event.target.value as FormValues['status'])} value={values.status}>
              {applicationStatuses.map((status) => (
                <option key={status} value={status}>
                  {status.replaceAll('_', ' ')}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Next action</span>
            <input onChange={(event) => updateField('next_action', event.target.value)} value={values.next_action} />
          </label>
          <label className="field field--full">
            <span>Next action due at</span>
            <input onChange={(event) => updateField('next_action_due_at', event.target.value)} type="datetime-local" value={values.next_action_due_at} />
          </label>
          <label className="field field--full">
            <span>Notes summary</span>
            <textarea onChange={(event) => updateField('notes_summary', event.target.value)} rows={5} value={values.notes_summary} />
          </label>
        </div>
        <button className="button" disabled={!canSubmit} type="submit">
          {isSubmitting ? 'Saving...' : submitLabel}
        </button>
      </form>
    </div>
  );
}
