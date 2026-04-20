import { ApplicationCreatePage } from '@/components/applications/application-create-page';
import { DashboardPageHeader } from '@/components/ui/dashboard-page-header';

export default function NewApplicationPage() {
  return (
    <section className="page-stack">
      <DashboardPageHeader
        title="New application"
        description="Add a new role, capture key details, and set the next follow-up action."
      />
      <ApplicationCreatePage />
    </section>
  );
}
