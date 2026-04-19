# ApplyPilot

ApplyPilot is a personal job-search CRM for active job seekers to track applications, contacts, interview stages, and follow-ups.

## Status

This repository is in early foundation stage.

- Product scope is defined at an MVP level only.
- The frontend has been scaffolded with `Next.js`, `TypeScript`, the App Router, and `Supabase Auth`.
- The backend has been scaffolded with `FastAPI`, `SQLAlchemy`, `Alembic`, and Supabase bearer-token verification.
- The initial PostgreSQL schema and migration are in place.
- CRUD business logic is not implemented yet.

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

1. Create or sync `profiles` records for authenticated users.
2. Add CRUD APIs for applications, contacts, tasks, and notes.
3. Enforce ownership using the authenticated user → profile relationship.
4. Connect dashboard views to real backend data.
