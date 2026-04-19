import { AuthSessionPanel } from '@/components/auth/auth-session-panel';
import { DashboardPageHeader } from '@/components/ui/dashboard-page-header';

export default function AppHomePage() {
  return (
    <section className="page-stack">
      <DashboardPageHeader
        title="Dashboard"
        description="This protected area now expects a Supabase-authenticated session and is ready for real application data wiring."
      />
      <AuthSessionPanel />
      <div className="card empty-state">
        <p>Next up is connecting applications, contacts, notes, and tasks to real backend CRUD endpoints.</p>
      </div>
    </section>
  );
}
