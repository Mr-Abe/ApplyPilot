# Backend

This directory contains the initial `FastAPI` backend scaffold for ApplyPilot.

## Included

- `FastAPI` app entrypoint
- versioned API routing under `/api/v1`
- health endpoint
- authenticated identity endpoint at `GET /api/v1/auth/me`
- dashboard summary endpoints under `/api/v1/dashboard/*`
- applications CRUD endpoints under `/api/v1/applications`
- contacts CRUD endpoints under `/api/v1/contacts`
- task CRUD endpoints under `/api/v1/tasks`
- application-to-contact link endpoints under `/api/v1/applications/{id}/contacts/{contact_id}`
- application note CRUD endpoints under `/api/v1/applications/{id}/notes`
- environment-based settings via `pydantic-settings`
- `SQLAlchemy` models for the MVP core schema
- `Alembic` migrations for PostgreSQL
- starter error handling pattern
- database session helpers for future `PostgreSQL` integration
- Supabase bearer-token verification and current-user dependency helpers
- profile auto-creation for authenticated resource access
- backend test coverage for health, auth, and critical application, contact, and task flows

## Structure

```text
backend/
├── alembic/
├── app/
│   ├── api/
│   ├── core/
│   ├── db/
│   ├── models/
│   ├── schemas/
│   ├── services/
│   └── main.py
├── tests/
├── .env.example
├── alembic.ini
├── pyproject.toml
└── README.md
```

## Local Setup

1. Change into `backend/`.
2. Create a virtual environment.
3. Install dependencies with `pip install -e '.[dev]'`.
4. Copy `.env.example` to `.env` and adjust values as needed.
5. Run migrations with `alembic upgrade head`.
6. Run the API with `uvicorn app.main:app --reload`.

## Implemented Endpoints

- `GET /api/v1/health`
- `GET /api/v1/auth/me`
- `GET /api/v1/dashboard/summary`
- `GET /api/v1/dashboard/status-breakdown`
- `GET /api/v1/dashboard/tasks/overdue`
- `GET /api/v1/dashboard/tasks/upcoming`
- `GET /api/v1/applications`
- `POST /api/v1/applications`
- `GET /api/v1/applications/{id}`
- `PATCH /api/v1/applications/{id}`
- `DELETE /api/v1/applications/{id}`
- `POST /api/v1/applications/{id}/contacts/{contact_id}`
- `DELETE /api/v1/applications/{id}/contacts/{contact_id}`
- `GET /api/v1/applications/{id}/notes`
- `POST /api/v1/applications/{id}/notes`
- `PATCH /api/v1/applications/{id}/notes/{note_id}`
- `DELETE /api/v1/applications/{id}/notes/{note_id}`
- `GET /api/v1/contacts`
- `POST /api/v1/contacts`
- `GET /api/v1/contacts/{id}`
- `PATCH /api/v1/contacts/{id}`
- `DELETE /api/v1/contacts/{id}`
- `GET /api/v1/tasks`
- `POST /api/v1/tasks`
- `GET /api/v1/tasks/{id}`
- `PATCH /api/v1/tasks/{id}`
- `DELETE /api/v1/tasks/{id}`

## Environment Variables

- `APPLYPILOT_DATABASE_URL`: PostgreSQL connection string used by the app and Alembic
- `APPLYPILOT_DATABASE_ECHO`: optional SQL logging toggle for local development
- `APPLYPILOT_SUPABASE_URL`: Supabase project URL used to validate token issuer
- `APPLYPILOT_SUPABASE_JWT_SECRET`: Supabase JWT secret used to verify bearer tokens

## Local Migration Commands

- Apply all migrations: `alembic upgrade head`
- Roll back one migration: `alembic downgrade -1`

## Quality

- Run backend tests: `pytest`
- Run repo-level checks from the root: `make quality`

## Notes

- Authentication currently supports email/password sessions from `Supabase Auth`.
- The backend verifies Supabase access tokens and exposes a current-user dependency for ownership enforcement.
- The first authenticated applications, contacts, tasks, or notes request auto-creates a local `profile` if one does not already exist.
- Applications support filtering, search, sorting, update, archive, and deletion.
- Contacts support CRUD plus linking and unlinking from owned applications.
- Tasks support CRUD, completion, due-date filtering, and profile-scoped application linking.
- Notes support application-scoped CRUD with simple typed notes for general, interview, call, and follow-up context.
- Dashboard endpoints provide a lightweight pipeline overview without introducing reporting dependencies.
