'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { LogoutButton } from '@/components/auth/logout-button';
import { useAuth } from '@/components/providers/auth-provider';
import { appNavigation } from '@/lib/navigation';

export function AppShell({ children }: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();
  const { isLoading, user } = useAuth();

  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <div className="app-sidebar__brand">
          <p className="app-sidebar__eyebrow">ApplyPilot</p>
          <h1>Job Search CRM</h1>
          <p className="app-sidebar__copy">Authenticated dashboard area for applications, contacts, and follow-ups.</p>
        </div>
        <div className="app-sidebar__session card">
          <p className="app-sidebar__session-label">Signed in as</p>
          <p className="app-sidebar__session-email">{isLoading ? 'Loading session...' : user?.email || 'Authenticated user'}</p>
          <LogoutButton />
        </div>
        <nav aria-label="App navigation" className="app-sidebar__nav">
          {appNavigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link className={isActive ? 'is-active' : undefined} key={item.href} href={item.href}>
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <div className="app-content">
        <div className="app-banner card">
          <p>Protected app area. Middleware redirects unauthenticated users to `/login`, and backend requests can verify the bearer token.</p>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
}
