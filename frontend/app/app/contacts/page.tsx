import { ContactsPageContent } from '@/components/contacts/contacts-page';
import { DashboardPageHeader } from '@/components/ui/dashboard-page-header';

export default function ContactsPage() {
  return (
    <section className="page-stack">
      <DashboardPageHeader
        title="Contacts"
        description="Track recruiters, hiring managers, referrals, and other job-search contacts in one place."
      />
      <ContactsPageContent />
    </section>
  );
}
