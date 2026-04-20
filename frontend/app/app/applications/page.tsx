import { ApplicationsListPage } from '@/components/applications/applications-list-page';
import { DashboardPageHeader } from '@/components/ui/dashboard-page-header';

export default function ApplicationsPage() {
  return (
    <section className="page-stack">
      <DashboardPageHeader
        title="Applications"
        description="Track job applications, filter by status, search by company or title, and keep next actions in one place."
        action={{ label: 'New application', href: '/app/applications/new' }}
      />
      <ApplicationsListPage />
    </section>
  );
}
