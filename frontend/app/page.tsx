import Link from 'next/link';
import { PageIntro } from '@/components/ui/page-intro';

const highlights = [
  {
    title: 'Application tracking',
    description: 'Keep every role, status, and next step in one focused dashboard.',
  },
  {
    title: 'Contact history',
    description: 'Track recruiters, hiring managers, and networking conversations by opportunity.',
  },
  {
    title: 'Follow-up discipline',
    description: 'Stay on top of reminders and momentum without relying on scattered notes.',
  },
];

export default function HomePage() {
  return (
    <div className="container landing-page">
      <section className="hero card">
        <PageIntro
          eyebrow="MVP frontend scaffold"
          title="A clean job-search CRM foundation for ApplyPilot"
          description="This frontend establishes the initial Next.js App Router structure, shared layouts, and placeholder product routes for the SaaS dashboard experience."
        />
        <div className="hero__actions">
          <Link className="button" href="/signup">
            Create account
          </Link>
          <Link className="button button--secondary" href="/app">
            Preview app shell
          </Link>
        </div>
      </section>

      <section className="feature-grid" aria-label="Core MVP areas">
        {highlights.map((item) => (
          <article className="card" key={item.title}>
            <h2>{item.title}</h2>
            <p>{item.description}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
