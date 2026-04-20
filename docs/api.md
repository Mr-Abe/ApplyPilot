# API

## Status

The backend now includes live health, auth identity, and MVP applications endpoints.

## Implemented Endpoints

- `GET /api/v1/health`
- `GET /api/v1/auth/me`
- `GET /api/v1/applications`
- `POST /api/v1/applications`
- `GET /api/v1/applications/{id}`
- `PATCH /api/v1/applications/{id}`
- `DELETE /api/v1/applications/{id}`

## Applications Query Support

`GET /api/v1/applications` supports:

- `status` for filtering by application status
- `search` for company name or job title matching
- `sort_by` with `date_applied` or `next_action_due_at`
- `sort_order` with `asc` or `desc`
- `archive_state` with `active`, `archived`, or `all`

## Core MVP Resources

The initial schema is prepared for:

- `profiles`
- `applications`
- `contacts`
- `application_contacts`
- `tasks`
- `notes`

## Applications Ownership

- Applications are scoped to the authenticated user's `profile`.
- The backend resolves the current user from the Supabase bearer token.
- A `profile` row is created automatically the first time an authenticated user uses application APIs.
- All application reads and writes are filtered by the current profile for ownership enforcement.

## Planned API Direction

These routes remain next in line, but are not implemented yet.

- `GET /contacts`
- `POST /contacts`
- `GET /tasks`
- `POST /tasks`
- `GET /notes`

## Notes

- Final route names may change during implementation.
- Authorization beyond single-user ownership is not implemented.
- Validation schemas and response contracts are still intentionally small and MVP-focused.
