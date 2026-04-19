import { DashboardPageHeader } from '@/components/ui/dashboard-page-header';

export default function TasksPage() {
  return (
    <section className="page-stack">
      <DashboardPageHeader
        title="Tasks"
        description="Use this area for follow-ups, reminders, and other action items tied to the job search."
      />
      <div className="card empty-state">
        <p>Task management and reminder logic have not been implemented yet.</p>
      </div>
    </section>
  );
}
