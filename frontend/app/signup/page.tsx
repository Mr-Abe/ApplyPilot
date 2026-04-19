import { SignupForm } from '@/components/auth/signup-form';
import { PageIntro } from '@/components/ui/page-intro';

export default function SignupPage() {
  return (
    <div className="container auth-page">
      <section className="card auth-card">
        <PageIntro
          eyebrow="Supabase Auth"
          title="Create your ApplyPilot account"
          description="Sign up with email and password to start tracking applications, contacts, and follow-up tasks."
        />
        <SignupForm />
      </section>
    </div>
  );
}
