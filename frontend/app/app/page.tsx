import { DashboardHome } from '@/components/dashboard/dashboard-home';
import { DashboardPageHeader } from '@/components/ui/dashboard-page-header';

export default function AppHomePage() {
  return (
    <section className="page-stack">
      <DashboardPageHeader
        title="Dashboard"
        description="Scan the pipeline, spot overdue follow-ups, and see what needs attention next."
      />
      <DashboardHome />
    </section>
  );
}
