import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = {
  title: 'ApplyPilot',
  description: 'A personal job-search CRM for active job seekers.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <div className="site-shell">
          <header className="site-header">
            <div className="container site-header__inner">
              <Link className="brand" href="/">
                ApplyPilot
              </Link>
              <nav className="site-nav" aria-label="Primary">
                <Link href="/login">Login</Link>
                <Link href="/signup">Sign up</Link>
                <Link className="button button--small" href="/app">
                  Open app
                </Link>
              </nav>
            </div>
          </header>
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}
