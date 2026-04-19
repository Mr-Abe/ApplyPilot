# Setup

## Current State

This repository is partially initialized.

At this stage, it contains:

- a runnable frontend scaffold in `frontend/`
- a runnable backend scaffold in `backend/`
- an initial PostgreSQL schema and migration setup
- Supabase Auth wiring for frontend login and protected app routes
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
- The dashboard includes a simple authenticated backend request to `/api/v1/auth/me`.

### Frontend Tooling

- `npm run lint`
- `npm run format`
- `npm run format:check`

## Backend Setup

The backend has a real `FastAPI` scaffold with `SQLAlchemy`, `Alembic`, and Supabase bearer-token verification.

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
8. Use `http://localhost:8000/api/v1/auth/me` with a Supabase bearer token to verify the auth path.

### Migration Commands

- Apply all migrations: `alembic upgrade head`
- Roll back one migration: `alembic downgrade -1`
- Generate a new migration later: `alembic revision -m "describe change"`

### Backend Notes

- Environment variables are read with the `APPLYPILOT_` prefix.
- The initial schema covers profiles, applications, contacts, tasks, notes, and the application/contact join table.
- The backend auth dependency verifies the incoming Supabase bearer token and exposes a current-user pattern for future ownership enforcement.

## Recommended Next Setup Work

1. Implement CRUD endpoints for applications, contacts, tasks, and notes.
2. Create or sync a `profiles` row when a user first enters the app.
3. Enforce profile ownership inside application, contact, task, and note APIs.
