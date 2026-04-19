import { DashboardPageHeader } from '@/components/ui/dashboard-page-header';

export default function NewApplicationPage() {
  return (
    <section className="page-stack">
      <DashboardPageHeader
        title="New application"
        description="This route is reserved for the future create-application form flow."
      />
      <div className="card empty-state">
        <p>No form is implemented yet. This page marks the future entry point for adding a new opportunity.</p>
      </div>
    </section>
  );
}
