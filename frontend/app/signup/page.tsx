import { PageIntro } from '@/components/ui/page-intro';

export default function SignupPage() {
  return (
    <div className="container auth-page">
      <section className="card auth-card">
        <PageIntro
          eyebrow="Authentication placeholder"
          title="Create your ApplyPilot account"
          description="This route is reserved for future signup and onboarding flows once authentication is wired up."
        />
      </section>
    </div>
  );
}
