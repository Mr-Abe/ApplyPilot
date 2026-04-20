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
        description="Review the application record, update key details, and archive the role when it is no longer active."
      />
      <ApplicationDetailPage applicationId={params.id} />
    </section>
  );
}
