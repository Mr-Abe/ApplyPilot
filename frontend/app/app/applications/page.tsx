import Link from 'next/link';
import { DashboardPageHeader } from '@/components/ui/dashboard-page-header';

export default function ApplicationsPage() {
  return (
    <section className="page-stack">
      <DashboardPageHeader
        title="Applications"
        description="Manage tracked opportunities, statuses, and next steps from one place."
        action={{ label: 'New application', href: '/app/applications/new' }}
      />
      <div className="card empty-state">
        <p>This placeholder page will list tracked applications once data fetching is implemented.</p>
        <Link href="/app/applications/new">Go to the new application page</Link>
      </div>
    </section>
  );
}
