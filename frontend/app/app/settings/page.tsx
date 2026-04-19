import { DashboardPageHeader } from '@/components/ui/dashboard-page-header';

export default function SettingsPage() {
  return (
    <section className="page-stack">
      <DashboardPageHeader
        title="Settings"
        description="This area is reserved for account preferences and future profile-level configuration."
      />
      <div className="card empty-state">
        <p>No settings forms are present yet. Authentication and profile preferences will be added later.</p>
      </div>
    </section>
  );
}
