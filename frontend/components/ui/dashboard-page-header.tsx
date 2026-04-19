import Link from 'next/link';

interface DashboardPageHeaderProps {
  title: string;
  description: string;
  action?: {
    label: string;
    href: string;
  };
}

export function DashboardPageHeader({ title, description, action }: DashboardPageHeaderProps) {
  return (
    <header className="dashboard-page-header">
      <div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {action ? (
        <Link className="button button--small" href={action.href}>
          {action.label}
        </Link>
      ) : null}
    </header>
  );
}
