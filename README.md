# ApplyPilot

ApplyPilot is a personal job-search CRM for active job seekers to track applications, contacts, interview stages, and follow-ups.

## Status

This repository is in early foundation stage.

- Product scope is defined at an MVP level only.
- The frontend has been scaffolded with `Next.js`, `TypeScript`, the App Router, `Supabase Auth`, and MVP applications UI.
- The backend has been scaffolded with `FastAPI`, `SQLAlchemy`, `Alembic`, Supabase bearer-token verification, and applications CRUD.
- The initial PostgreSQL schema and migrations are in place.
- Contacts, tasks, and notes CRUD are not implemented yet.

## Planned Stack

- Frontend: `Next.js` + `TypeScript`
- Backend: `FastAPI` + `Python`
- Database: `PostgreSQL`
- Auth: `Supabase Auth`
- Hosting: `Vercel` + `Render` + `Supabase`
- CI/CD: `GitHub Actions`

## Repository Structure

```text
ApplyPilot/
├── backend/
├── docs/
├── frontend/
├── .gitignore
├── CHANGELOG.md
├── README.md
└── ROADMAP.md
```

See `docs/architecture.md` for the proposed layout and boundaries.

## Documentation

- Product: `docs/product.md`
- Architecture: `docs/architecture.md`
- API planning: `docs/api.md`
- Setup notes: `docs/setup.md`
- Delivery plan: `ROADMAP.md`
- Frontend notes: `frontend/README.md`
- Backend notes: `backend/README.md`

## MVP Boundaries

The current MVP explicitly excludes:

- AI features
- Gmail integration
- calendar integration
- browser extension
- payments
- mobile app
- team accounts
- scraping

## Next Steps

1. Build contacts CRUD and connect contact records to applications.
2. Build tasks and notes CRUD using the same ownership pattern.
3. Add dashboard summaries and counts powered by live application data.
4. Connect application details to contacts, tasks, and notes as those features land.
