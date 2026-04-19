'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { appNavigation } from '@/lib/navigation';

export function AppShell({ children }: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();

  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <div className="app-sidebar__brand">
          <p className="app-sidebar__eyebrow">ApplyPilot</p>
          <h1>Job Search CRM</h1>
          <p className="app-sidebar__copy">Authenticated dashboard area for applications, contacts, and follow-ups.</p>
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
          <p>Protected app area placeholder. Add route guards here when `Supabase Auth` is connected.</p>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
}
