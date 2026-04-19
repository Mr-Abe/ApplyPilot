# Backend

This directory contains the initial `FastAPI` backend scaffold for ApplyPilot.

## Included

- `FastAPI` app entrypoint
- versioned API routing under `/api/v1`
- health endpoint
- environment-based settings via `pydantic-settings`
- `SQLAlchemy` models for the MVP core schema
- `Alembic` migrations for PostgreSQL
- starter error handling pattern
- database session helpers for future `PostgreSQL` integration
- request dependency helpers for future `Supabase`-authenticated routes
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
3. Install dependencies with `pip install -e .[dev]`.
4. Copy `.env.example` to `.env` and adjust values as needed.
5. Run migrations with `alembic upgrade head`.
6. Run the API with `uvicorn app.main:app --reload`.

## Initial Endpoint

- `GET /api/v1/health`

## Environment Variables

- `APPLYPILOT_DATABASE_URL`: PostgreSQL connection string used by the app and Alembic
- `APPLYPILOT_DATABASE_ECHO`: optional SQL logging toggle for local development
- `APPLYPILOT_SUPABASE_URL`: reserved for future auth integration
- `APPLYPILOT_SUPABASE_JWT_SECRET`: reserved for future auth integration

## Local Migration Commands

- Apply all migrations: `alembic upgrade head`
- Roll back one migration: `alembic downgrade -1`

## Notes

- Authentication is not implemented yet.
- Database models and migrations are limited to the MVP core schema.
- The backend is structured so `Supabase Auth` validation and `PostgreSQL` integration can expand without reshaping the app.
