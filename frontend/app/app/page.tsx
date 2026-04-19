import { DashboardPageHeader } from '@/components/ui/dashboard-page-header';

export default function AppHomePage() {
  return (
    <section className="page-stack">
      <DashboardPageHeader
        title="Dashboard"
        description="This is the authenticated app shell landing page. It will become the main overview once data and auth are connected."
      />
      <div className="card empty-state">
        <p>Start here to review applications, tasks, and follow-ups across the job search workflow.</p>
      </div>
    </section>
  );
}
