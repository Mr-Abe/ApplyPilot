import { DashboardPageHeader } from '@/components/ui/dashboard-page-header';

export default function ContactsPage() {
  return (
    <section className="page-stack">
      <DashboardPageHeader
        title="Contacts"
        description="This page will track recruiters, hiring managers, referrals, and networking contacts."
      />
      <div className="card empty-state">
        <p>No contact management UI exists yet. This scaffold keeps the information architecture ready.</p>
      </div>
    </section>
  );
}
