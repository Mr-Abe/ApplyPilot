import { Suspense } from 'react';

import { LoginForm } from '@/components/auth/login-form';
import { PageIntro } from '@/components/ui/page-intro';

export default function LoginPage() {
  return (
    <div className="container auth-page">
      <section className="card auth-card">
        <PageIntro
          eyebrow="Supabase Auth"
          title="Log in to ApplyPilot"
          description="Use your Supabase email and password credentials to access the protected job-search dashboard."
        />
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </section>
    </div>
  );
}
