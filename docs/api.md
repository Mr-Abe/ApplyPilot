# API

## Status

The backend scaffold includes a live health endpoint, a live auth identity endpoint, and an initial database-backed MVP resource plan.

## Implemented Endpoints

- `GET /api/v1/health`
- `GET /api/v1/auth/me`

## Core MVP Resources

The initial schema is prepared for:

- `profiles`
- `applications`
- `contacts`
- `application_contacts`
- `tasks`
- `notes`

## Planned API Direction

These routes remain placeholders, not implemented CRUD endpoints.

- `GET /applications`
- `POST /applications`
- `GET /applications/{id}`
- `PATCH /applications/{id}`
- `DELETE /applications/{id}`
- `GET /contacts`
- `POST /contacts`
- `GET /tasks`
- `POST /tasks`
- `GET /notes`

## Authentication

- Frontend authentication uses `Supabase Auth` email/password flows.
- The backend expects a Supabase access token in the `Authorization: Bearer <token>` header.
- `GET /api/v1/auth/me` verifies the bearer token and returns the current authenticated user identity.

## Ownership Model

- Application data belongs to a `profile`.
- A `profile` is expected to map to a `Supabase Auth` user.
- Backend ownership enforcement should build on the current user dependency and the profile/user relationship.

## Notes

- Final route names may change during implementation.
- Authorization beyond single-user ownership is not implemented.
- Validation schemas and response contracts are not finalized.
