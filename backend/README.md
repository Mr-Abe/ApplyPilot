# Backend

This directory contains the initial `FastAPI` backend scaffold for ApplyPilot.

## Included

- `FastAPI` app entrypoint
- versioned API routing under `/api/v1`
- health endpoint
- authenticated identity endpoint at `GET /api/v1/auth/me`
- environment-based settings via `pydantic-settings`
- `SQLAlchemy` models for the MVP core schema
- `Alembic` migrations for PostgreSQL
- starter error handling pattern
- database session helpers for future `PostgreSQL` integration
- Supabase bearer-token verification and current-user dependency helpers
- basic backend test scaffold

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

## Environment Variables

- `APPLYPILOT_DATABASE_URL`: PostgreSQL connection string used by the app and Alembic
- `APPLYPILOT_DATABASE_ECHO`: optional SQL logging toggle for local development
- `APPLYPILOT_SUPABASE_URL`: Supabase project URL used to validate token issuer
- `APPLYPILOT_SUPABASE_JWT_SECRET`: Supabase JWT secret used to verify bearer tokens

## Local Migration Commands

- Apply all migrations: `alembic upgrade head`
- Roll back one migration: `alembic downgrade -1`

## Notes

- Authentication currently supports email/password sessions from `Supabase Auth`.
- The backend verifies Supabase access tokens and exposes a current-user dependency for future ownership enforcement.
- Database models and migrations are limited to the MVP core schema.
