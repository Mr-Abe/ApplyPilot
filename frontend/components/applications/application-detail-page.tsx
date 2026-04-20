'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { ApplicationContactsPanel } from '@/components/applications/application-contacts-panel';
import { ApplicationForm } from '@/components/applications/application-form';
import { ApplicationTasksPanel } from '@/components/applications/application-tasks-panel';
import {
  archiveApplication,
  formatCurrencyRange,
  formatDateLabel,
  formatDateTimeLabel,
  getApplication,
  updateApplication,
  type ApplicationMutationPayload,
  type ApplicationRecord,
} from '@/lib/applications';

interface ApplicationDetailPageProps {
  applicationId: string;
}

export function ApplicationDetailPage({ applicationId }: ApplicationDetailPageProps) {
  const router = useRouter();
  const [application, setApplication] = useState<ApplicationRecord | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    async function load() {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const result = await getApplication(applicationId);
        if (!isCancelled) {
          setApplication(result);
        }
      } catch (error) {
        if (!isCancelled) {
          setErrorMessage(error instanceof Error ? error.message : 'Unable to load the application.');
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    void load();

    return () => {
      isCancelled = true;
    };
  }, [applicationId]);

  async function handleUpdate(payload: ApplicationMutationPayload) {
    const updated = await updateApplication(applicationId, payload);
    setApplication(updated);
    setSuccessMessage('Application updated successfully.');
    setErrorMessage(null);
    setIsEditing(false);
  }

  async function handleArchive() {
    setIsArchiving(true);
    setErrorMessage(null);

    try {
      await archiveApplication(applicationId);
      router.push('/app/applications');
      router.refresh();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to archive the application.');
      setIsArchiving(false);
    }
  }

  if (isLoading) {
    return <div className="card empty-state"><p>Loading application details...</p></div>;
  }

  if (errorMessage && !application) {
    return <div className="card empty-state"><p className="auth-message auth-message--error">{errorMessage}</p></div>;
  }

  if (!application) {
    return <div className="card empty-state"><p>Application not found.</p></div>;
  }

  return (
    <section className="page-stack">
      {successMessage ? <p className="auth-message auth-message--success">{successMessage}</p> : null}
      {errorMessage ? <p className="auth-message auth-message--error">{errorMessage}</p> : null}

      <div className="card detail-card">
        <div className="detail-card__header">
          <div>
            <p className="eyebrow">Application detail</p>
            <h2>{application.company_name}</h2>
            <p>{application.job_title}</p>
          </div>
          <div className="detail-card__actions">
            <button className="button button--secondary button--small" onClick={() => setIsEditing((current) => !current)} type="button">
              {isEditing ? 'Cancel edit' : 'Edit application'}
            </button>
            {!application.archived ? (
              <button className="button button--small" disabled={isArchiving} onClick={handleArchive} type="button">
                {isArchiving ? 'Archiving...' : 'Archive'}
              </button>
            ) : null}
          </div>
        </div>
        <div className="detail-grid">
          <p><strong>Status:</strong> {application.status.replaceAll('_', ' ')}</p>
          <p><strong>Applied:</strong> {formatDateLabel(application.date_applied)}</p>
          <p><strong>Found:</strong> {formatDateLabel(application.date_found)}</p>
          <p><strong>Next action due:</strong> {formatDateTimeLabel(application.next_action_due_at)}</p>
          <p><strong>Location:</strong> {application.location || '—'}</p>
          <p><strong>Work type:</strong> {application.work_type || '—'}</p>
          <p><strong>Source:</strong> {application.source || '—'}</p>
          <p><strong>Compensation:</strong> {formatCurrencyRange(application.salary_min, application.salary_max)}</p>
          <p><strong>Resume:</strong> {application.resume_version || '—'}</p>
          <p><strong>Cover letter:</strong> {application.cover_letter_version || '—'}</p>
          <p><strong>Next action:</strong> {application.next_action || '—'}</p>
          <p><strong>Archived:</strong> {application.archived ? 'Yes' : 'No'}</p>
          <p className="detail-grid__full"><strong>Posting URL:</strong> {application.posting_url ? <Link href={application.posting_url}>Open posting</Link> : '—'}</p>
          <p className="detail-grid__full"><strong>Notes summary:</strong> {application.notes_summary || '—'}</p>
        </div>
      </div>

      {isEditing ? (
        <div className="card form-card">
          <ApplicationForm initialValues={application} onSubmit={handleUpdate} submitLabel="Save changes" />
        </div>
      ) : null}

      <ApplicationContactsPanel applicationId={applicationId} />
      <ApplicationTasksPanel applicationId={applicationId} />
    </section>
  );
}
