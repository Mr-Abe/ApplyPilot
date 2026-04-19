# AGENTS.md

## Project identity
ApplyPilot is a portfolio-quality SaaS MVP for job seekers to track applications, contacts, interview stages, notes, and follow-up tasks.

## Product goal
Build a real, launchable web app that is:
- useful for real users
- cleanly architected
- deployable on free-tier infrastructure
- strong enough to showcase on GitHub and in interviews

## Core user
Active job seekers managing multiple opportunities, especially:
- career switchers
- new grads
- mid-career professionals running a structured search

## MVP scope
The MVP includes:
- authentication
- application CRUD
- contact CRUD
- follow-up task tracking
- notes
- application detail view
- dashboard summary
- filtering, search, and sorting

## Non-goals for MVP
Do not add these unless explicitly requested:
- AI writing or generation features
- Gmail integration
- calendar integration
- browser extension
- scraping
- payments
- team accounts
- mobile app
- resume builder
- job board aggregation
- advanced analytics beyond simple dashboard summaries

## Default stack
Unless there is a strong reason otherwise, use:
- Frontend: Next.js + TypeScript
- Backend: FastAPI + Python
- Database: PostgreSQL
- Auth: Supabase Auth
- Hosting target: Vercel + Render + Supabase
- CI/CD: GitHub Actions

## Architecture rules
- Prefer a separate frontend and backend for stronger portfolio signal
- Keep the system simple and monolithic
- No microservices
- No message broker
- No background jobs unless explicitly needed
- No file storage unless truly necessary
- Prefer boring, readable architecture over novelty

## Repo structure expectations
The repo should generally contain:
- `frontend/`
- `backend/`
- `docs/`
- `README.md`
- `ROADMAP.md`
- `CHANGELOG.md`

Keep docs aligned with implementation reality. Do not leave misleading placeholders.

## Working style
- Work in small, reviewable increments
- Prefer vertical slices over broad unfinished scaffolding
- Before large changes, explain what is being changed and why
- After changes, summarize what was done and what remains
- Make the smallest change that meaningfully moves the product forward
- When ambiguous, choose the simpler MVP-safe path and state the choice briefly

## Code quality expectations
- Use strict TypeScript on the frontend
- Keep files and functions small
- Prefer clarity over cleverness
- Add minimal, useful comments only where needed
- Validate backend inputs
- Handle loading, empty, and error states
- Use environment variables for config
- Never hardcode secrets
- Avoid unnecessary dependencies
- Avoid premature abstractions
- Keep naming consistent across frontend, backend, docs, and schema

## Frontend guidance
- Use Next.js App Router
- Keep UI simple, clean, and professional
- Organize by feature where reasonable
- Use forms and tables/lists that are easy to understand
- Do not overbuild the design system early
- Focus on usability and scanability over visual flourish

## Backend guidance
- Use FastAPI with clear separation of:
  - API routes
  - schemas
  - models
  - services
  - config
  - database utilities
- Version APIs under `/api/v1`
- Enforce user ownership on all data access
- Keep business logic out of route handlers where practical
- Prefer predictable REST patterns

## Database guidance
The MVP schema should stay close to:
- profiles
- applications
- contacts
- application_contacts
- tasks
- notes

Application status values:
- wishlist
- applying
- applied
- screening
- interview
- final_round
- offer
- rejected
- withdrawn

Do not add speculative future tables unless explicitly justified.

## Migration rules
- Use Alembic for database migrations
- Every schema change must have a migration
- Migrations must be reversible when practical
- After creating or updating migrations, verify:
  - `alembic upgrade head`
  - `alembic downgrade base`
  - `alembic upgrade head`
- Confirm expected tables and relationships exist
- Keep migrations readable and focused

## Testing expectations
Add practical tests for critical paths.
Prioritize:
- backend unit/integration tests for core business flows
- frontend tests for important forms and state behavior
- migration sanity checks when schema changes

Critical paths:
- auth-protected access
- create/update/archive application
- create/complete task
- create/link contact
- notes creation
- dashboard summary behavior

Do not chase coverage for its own sake. Prefer small, durable tests.

## Documentation rules
Update docs when relevant behavior changes.

Keep these current:
- `README.md`
- `ROADMAP.md`
- `CHANGELOG.md`
- `docs/architecture.md`
- `docs/setup.md`
- `docs/api.md`

Documentation should be:
- accurate
- concise
- implementation-aligned
- portfolio-ready

## Git and change management
- Make cohesive changes
- Prefer small commits
- Use clear conventional-style commit messages when possible, e.g.:
  - `chore: scaffold backend app`
  - `feat: add applications create and list endpoints`
  - `test: add task service tests`
  - `docs: update setup and migration instructions`

## Decision framework
When making tradeoffs, optimize in this order:
1. MVP usefulness
2. correctness
3. clarity
4. launchability
5. employer signal
6. convenience

## Stop conditions
Pause and summarize before proceeding if:
- a requested change pushes beyond MVP
- a major architectural decision is required
- credentials or secrets are needed
- migrations or tests fail unexpectedly
- a dependency introduces significant complexity

## Success standard
ApplyPilot should end up as:
- a coherent SaaS MVP
- cleanly documented
- testable
- deployable
- believable as a real solo-engineer product
- strong portfolio material for employers