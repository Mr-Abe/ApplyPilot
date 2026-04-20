# Architecture

## Goal

Keep the first version of ApplyPilot small, easy to reason about, and easy to deploy.

## Proposed Repository Layout

```text
ApplyPilot/
├── backend/
│   ├── alembic/
│   ├── app/
│   │   ├── api/
│   │   ├── core/
│   │   ├── db/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/
│   │   └── main.py
│   ├── tests/
│   ├── .env.example
│   ├── alembic.ini
│   ├── pyproject.toml
│   └── README.md
├── docs/
│   ├── api.md
│   ├── architecture.md
│   ├── product.md
│   └── setup.md
├── frontend/
│   ├── app/
│   ├── components/
│   ├── lib/
│   ├── middleware.ts
│   └── public/
├── .gitignore
├── CHANGELOG.md
├── README.md
└── ROADMAP.md
```

## System Boundaries

- `frontend/`: user interface built with `Next.js` and `TypeScript`
- `backend/`: API layer built with `FastAPI`
- `PostgreSQL`: primary application database
- `Supabase Auth`: authentication provider

## Backend Layers

- `api/`: request routing, versioned endpoints, and request dependencies
- `core/`: settings, security helpers, and shared error handling
- `db/`: SQLAlchemy base definitions, database connectivity, and session usage
- `models/`: SQLAlchemy ORM models for the MVP schema
- `schemas/`: request and response schemas
- `services/`: business logic layer
- `alembic/`: database migration history

## Auth Flow

1. The frontend uses `Supabase Auth` for email/password sign-up and sign-in.
2. Frontend middleware protects `/app/*` routes by checking the current Supabase session.
3. Authenticated frontend requests send the Supabase access token as a bearer token to the backend.
4. The backend verifies the token, resolves the current user, and can map that user to a local `profile`.

## Applications Flow

1. An authenticated user opens `/app/applications`.
2. The frontend calls `GET /api/v1/applications` with the Supabase bearer token.
3. The backend resolves the current profile and enforces ownership through `profile_id`.
4. The applications service applies filtering, search, sorting, and CRUD operations against PostgreSQL.

## MVP Core Schema

- `profiles`: local profile record mapped to a `Supabase Auth` user
- `applications`: tracked opportunities and current job-search status
- `contacts`: recruiters, hiring managers, referrals, and networking contacts
- `application_contacts`: many-to-many links between applications and contacts
- `tasks`: follow-ups and reminders optionally tied to an application or contact
- `notes`: freeform notes optionally tied to an application or contact

## Core Relationships

- One `profile` owns many `applications`, `contacts`, `tasks`, and `notes`
- One `profile` owns many `application_contacts` links
- `applications` and `contacts` connect through `application_contacts`
- `tasks` can belong to an `application`, a `contact`, or stand alone under a `profile`
- `notes` can belong to an `application`, a `contact`, or stand alone under a `profile`

## Current Backend Scope

The backend scaffold currently includes:

- app entrypoint and versioned routing
- a health endpoint at `GET /api/v1/health`
- an auth identity endpoint at `GET /api/v1/auth/me`
- environment-based settings
- starter error handling
- SQLAlchemy models for the MVP core schema
- Alembic migration setup for the current schema
- Supabase bearer-token verification and a current-user dependency pattern
- applications CRUD with profile-scoped ownership enforcement

## Intentional Omissions

The scaffold does not yet include:

- contacts, tasks, and notes CRUD APIs
- richer domain services beyond the current applications feature
- seed data
- deployment configuration
- CI workflows
