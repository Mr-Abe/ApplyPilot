import { PageIntro } from '@/components/ui/page-intro';

export default function LoginPage() {
  return (
    <div className="container auth-page">
      <section className="card auth-card">
        <PageIntro
          eyebrow="Authentication placeholder"
          title="Log in to ApplyPilot"
          description="This route is ready for the future Supabase Auth login flow. No real authentication is implemented yet."
        />
      </section>
    </div>
  );
}
