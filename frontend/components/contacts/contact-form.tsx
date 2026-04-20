'use client';

import { useMemo, useState } from 'react';

import type { ContactMutationPayload, ContactRecord } from '@/lib/contacts';

interface ContactFormProps {
  initialValues?: Partial<ContactRecord>;
  onSubmit: (payload: ContactMutationPayload) => Promise<void>;
  submitLabel: string;
}

interface FormValues {
  company_name: string;
  full_name: string;
  title: string;
  email: string;
  linkedin_url: string;
  phone: string;
  notes: string;
}

function buildInitialValues(initialValues?: Partial<ContactRecord>): FormValues {
  return {
    company_name: initialValues?.company_name ?? '',
    full_name: initialValues?.full_name ?? '',
    title: initialValues?.title ?? '',
    email: initialValues?.email ?? '',
    linkedin_url: initialValues?.linkedin_url ?? '',
    phone: initialValues?.phone ?? '',
    notes: initialValues?.notes ?? '',
  };
}

function normalizeOptional(value: string): string | null {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

export function ContactForm({ initialValues, onSubmit, submitLabel }: ContactFormProps) {
  const initialState = useMemo(() => buildInitialValues(initialValues), [initialValues]);
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
        company_name: normalizeOptional(values.company_name),
        full_name: values.full_name.trim(),
        title: normalizeOptional(values.title),
        email: normalizeOptional(values.email),
        linkedin_url: normalizeOptional(values.linkedin_url),
        phone: normalizeOptional(values.phone),
        notes: normalizeOptional(values.notes),
      });

      if (!initialValues?.id) {
        setValues(buildInitialValues());
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to save the contact.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="form-stack" onSubmit={handleSubmit}>
      {errorMessage ? <p className="auth-message auth-message--error">{errorMessage}</p> : null}
      <div className="form-grid">
        <label className="field">
          <span>Full name</span>
          <input onChange={(event) => updateField('full_name', event.target.value)} required value={values.full_name} />
        </label>
        <label className="field">
          <span>Company</span>
          <input onChange={(event) => updateField('company_name', event.target.value)} value={values.company_name} />
        </label>
        <label className="field">
          <span>Title</span>
          <input onChange={(event) => updateField('title', event.target.value)} value={values.title} />
        </label>
        <label className="field">
          <span>Email</span>
          <input onChange={(event) => updateField('email', event.target.value)} type="email" value={values.email} />
        </label>
        <label className="field">
          <span>LinkedIn URL</span>
          <input onChange={(event) => updateField('linkedin_url', event.target.value)} placeholder="https://linkedin.com/in/..." value={values.linkedin_url} />
        </label>
        <label className="field">
          <span>Phone</span>
          <input onChange={(event) => updateField('phone', event.target.value)} value={values.phone} />
        </label>
        <label className="field field--full">
          <span>Notes</span>
          <textarea onChange={(event) => updateField('notes', event.target.value)} rows={4} value={values.notes} />
        </label>
      </div>
      <button className="button" disabled={isSubmitting} type="submit">
        {isSubmitting ? 'Saving...' : submitLabel}
      </button>
    </form>
  );
}
