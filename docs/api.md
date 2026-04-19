# API

## Status

The backend scaffold is initialized with one live endpoint and an initial database-backed MVP resource plan.

## Implemented Endpoint

- `GET /api/v1/health`

## Core MVP Resources

The initial schema is prepared for:

- `profiles`
- `applications`
- `contacts`
- `application_contacts`
- `tasks`
- `notes`

## Planned API Direction

These are still placeholders, not implemented routes.

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

## Ownership Model

- Application data belongs to a `profile`.
- A `profile` is expected to map to a `Supabase Auth` user.
- Protected route behavior is not implemented yet, but the schema is prepared for profile-scoped data access.

## Notes

- Final route names may change during implementation.
- Authentication and authorization rules are still to be defined.
- Validation schemas and response contracts are not finalized.
