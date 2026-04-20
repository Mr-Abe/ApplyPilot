'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { ApplicationForm } from '@/components/applications/application-form';
import { createApplication, type ApplicationMutationPayload } from '@/lib/applications';

export function ApplicationCreatePage() {
  const router = useRouter();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  async function handleCreate(payload: ApplicationMutationPayload) {
    const created = await createApplication(payload);
    setSuccessMessage('Application created successfully. Redirecting to details...');
    router.replace(`/app/applications/${created.id}`);
    router.refresh();
  }

  return (
    <section className="page-stack">
      {successMessage ? <p className="auth-message auth-message--success">{successMessage}</p> : null}
      <div className="card form-card">
        <ApplicationForm onSubmit={handleCreate} submitLabel="Create application" />
      </div>
    </section>
  );
}
