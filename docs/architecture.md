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
- `db/`: SQLAlchemy base definitions, database connectivity, and future session usage
- `models/`: SQLAlchemy ORM models for the MVP schema
- `schemas/`: request and response schemas
- `services/`: business logic layer
- `alembic/`: database migration history

## High-Level Flow

1. User signs in through `Supabase Auth`.
2. Frontend calls versioned backend API routes.
3. Backend validates request context and processes application logic.
4. Backend reads and writes application data in `PostgreSQL`.

## MVP Core Schema

- `profiles`: application-owned profile record mapped to a `Supabase Auth` user
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
- environment-based settings
- starter error handling
- SQLAlchemy models for the MVP core schema
- Alembic migration setup with an initial schema migration

## Intentional Omissions

The scaffold does not yet include:

- auth verification implementation
- database CRUD services or repositories
- seed data
- deployment configuration
- CI workflows
