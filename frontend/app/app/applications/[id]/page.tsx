import { DashboardPageHeader } from '@/components/ui/dashboard-page-header';

interface ApplicationDetailPageProps {
  params: {
    id: string;
  };
}

export default function ApplicationDetailPage({ params }: ApplicationDetailPageProps) {
  return (
    <section className="page-stack">
      <DashboardPageHeader
        title={`Application ${params.id}`}
        description="This detail route is ready for a future application overview with notes, contacts, and interview history."
      />
      <div className="card empty-state">
        <p>No application detail data is connected yet. The dynamic route is in place for future implementation.</p>
      </div>
    </section>
  );
}
