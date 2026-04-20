import { TasksPageContent } from '@/components/tasks/tasks-page';
import { DashboardPageHeader } from '@/components/ui/dashboard-page-header';

export default function TasksPage() {
  return (
    <section className="page-stack">
      <DashboardPageHeader
        title="Tasks"
        description="Manage follow-ups, due dates, and completion status for next actions across your search."
      />
      <TasksPageContent />
    </section>
  );
}
