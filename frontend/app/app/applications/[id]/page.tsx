import { ApplicationDetailPage } from '@/components/applications/application-detail-page';
import { DashboardPageHeader } from '@/components/ui/dashboard-page-header';

interface ApplicationPageProps {
  params: {
    id: string;
  };
}

export default function ApplicationPage({ params }: ApplicationPageProps) {
  return (
    <section className="page-stack">
      <DashboardPageHeader
        title="Application details"
        description="Use this workspace to manage the opportunity, next action, contacts, follow-up tasks, and notes in one place."
      />
      <ApplicationDetailPage applicationId={params.id} />
    </section>
  );
}
