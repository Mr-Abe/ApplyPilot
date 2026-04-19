# Setup

## Current State

This repository is partially initialized.

At this stage, it contains:

- a runnable frontend scaffold in `frontend/`
- a runnable backend scaffold in `backend/`
- an initial PostgreSQL schema and migration setup
- planning documents

## Frontend Setup

The frontend has a real `Next.js` + `TypeScript` scaffold.

### Prerequisites

- `Node.js` 18+
- `npm`

### Run The Frontend

1. Change into `frontend/`.
2. Install dependencies with `npm install`.
3. Start the app with `npm run dev`.
4. Open `http://localhost:3000`.

### Frontend Tooling

- `npm run lint`
- `npm run format`
- `npm run format:check`

## Backend Setup

The backend has a real `FastAPI` scaffold with `SQLAlchemy` and `Alembic`.

### Prerequisites

- `Python` 3.11+
- `pip`
- a local or remote `PostgreSQL` database

### Environment Variables

Copy `backend/.env.example` to `backend/.env` and set at least:

- `APPLYPILOT_DATABASE_URL`
- `APPLYPILOT_DATABASE_ECHO` if you want SQL logging locally
- `APPLYPILOT_SUPABASE_URL` for future auth work
- `APPLYPILOT_SUPABASE_JWT_SECRET` for future auth work

### Run The Backend

1. Change into `backend/`.
2. Create and activate a virtual environment.
3. Install dependencies with `pip install -e .[dev]`.
4. Copy `.env.example` to `.env`.
5. Run database migrations with `alembic upgrade head`.
6. Start the API with `uvicorn app.main:app --reload`.
7. Open `http://localhost:8000/api/v1/health`.

### Migration Commands

- Apply all migrations: `alembic upgrade head`
- Roll back one migration: `alembic downgrade -1`
- Generate a new migration later: `alembic revision -m "describe change"`

### Backend Notes

- Environment variables are read with the `APPLYPILOT_` prefix.
- The initial schema covers profiles, applications, contacts, tasks, notes, and the application/contact join table.
- `Supabase Auth` request validation is not implemented yet.

## Recommended Next Setup Work

1. Implement CRUD endpoints for applications, contacts, tasks, and notes.
2. Add Supabase token validation for protected API routes.
3. Connect frontend routes to real backend endpoints.
