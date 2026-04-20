# Setup

## Current State

This repository is partially initialized.

At this stage, it contains:

- a runnable frontend scaffold in `frontend/`
- a runnable backend scaffold in `backend/`
- an initial PostgreSQL schema and migration setup
- Supabase Auth wiring for frontend login and protected app routes
- MVP applications, contacts, follow-up tasks, and application notes across the stack
- planning documents

## Frontend Setup

The frontend has a real `Next.js` + `TypeScript` scaffold with `Supabase Auth`.

### Prerequisites

- `Node.js` 18+
- `npm`
- a `Supabase` project with email/password auth enabled

### Environment Variables

Copy `frontend/.env.example` to `frontend/.env.local` and set:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_API_BASE_URL` such as `http://localhost:8000`

### Run The Frontend

1. Change into `frontend/`.
2. Install dependencies with `npm install`.
3. Copy `.env.example` to `.env.local`.
4. Start the app with `npm run dev`.
5. Open `http://localhost:3000`.

### Frontend Notes

- `/login` and `/signup` use Supabase email/password auth.
- `/app/*` routes are protected by middleware that checks the current Supabase session.
- `/app/applications` now supports list, create, view, edit, and archive flows.
- `/app/contacts` now supports list, create, edit, and delete flows.
- `/app/tasks` now supports list, create, edit, complete, and delete flows.
- Application detail pages can now link contacts, add follow-up tasks, and manage notes from one workspace.

### Frontend Tooling

- `npm run lint`
- `npm run format`
- `npm run format:check`

## Backend Setup

The backend has a real `FastAPI` scaffold with `SQLAlchemy`, `Alembic`, Supabase bearer-token verification, and applications CRUD.

### Prerequisites

- `Python` 3.11+
- `pip`
- a local or remote `PostgreSQL` database
- the same `Supabase` project used by the frontend

### Environment Variables

Copy `backend/.env.example` to `backend/.env` and set at least:

- `APPLYPILOT_DATABASE_URL`
- `APPLYPILOT_DATABASE_ECHO` if you want SQL logging locally
- `APPLYPILOT_SUPABASE_URL`
- `APPLYPILOT_SUPABASE_JWT_SECRET`

### Run The Backend

1. Change into `backend/`.
2. Create and activate a virtual environment.
3. Install dependencies with `pip install -e '.[dev]'`.
4. Copy `.env.example` to `.env`.
5. Run database migrations with `alembic upgrade head`.
6. Start the API with `uvicorn app.main:app --reload`.
7. Open `http://localhost:8000/api/v1/health`.
8. Use `http://localhost:8000/api/v1/auth/me` with a Supabase bearer token to verify auth.

### Migration Commands

- Apply all migrations: `alembic upgrade head`
- Roll back one migration: `alembic downgrade -1`
- Generate a new migration later: `alembic revision -m "describe change"`

### Backend Notes

- Environment variables are read with the `APPLYPILOT_` prefix.
- The applications, contacts, and tasks APIs auto-create a `profile` row for an authenticated user if one does not exist yet.
- Applications, contacts, and tasks are profile-scoped for ownership enforcement.
- Run `alembic upgrade head` after pulling the latest changes so the contacts and tasks migration is applied locally.

## Recommended Next Setup Work

1. Connect the dashboard home view to real summary data.
2. Add lightweight dashboards for overdue follow-ups and pipeline counts.
3. Expand reporting and settings where the live backend now supports richer workflows.
