# API

## Status

The backend now includes live health, auth identity, applications, contacts, application-contact linking, follow-up tasks, application notes, and dashboard summary endpoints.

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

## Dashboard Support

Dashboard endpoints support:

- summary counts for active applications and open/overdue/upcoming tasks
- status breakdown for active application pipeline stages
- overdue task list for immediate follow-up work
- upcoming task list for near-term planning

## Applications Query Support

`GET /api/v1/applications` supports:

- `status` for filtering by application status
- `search` for company name or job title matching
- `sort_by` with `date_applied` or `next_action_due_at`
- `sort_order` with `asc` or `desc`
- `archive_state` with `active`, `archived`, or `all`

## Contacts Query Support

`GET /api/v1/contacts` supports:

- `application_id` to return only contacts linked to a specific owned application

## Tasks Query Support

`GET /api/v1/tasks` supports:

- `application_id` to return only tasks linked to a specific owned application
- `status` with `open` or `completed`
- `timing` with `all`, `overdue`, or `upcoming`

## Notes Support

Application notes support:

- `note_type` with `general`, `interview`, `call`, or `followup`
- create, edit, list, and delete flows scoped to one owned application

## Core MVP Resources

The initial schema is prepared for:

- `profiles`
- `applications`
- `contacts`
- `application_contacts`
- `tasks`
- `notes`

## Ownership Model

- Applications, contacts, tasks, notes, and application-contact links are scoped to the authenticated user's `profile`.
- The backend resolves the current user from the Supabase bearer token.
- A `profile` row is created automatically the first time an authenticated user uses these APIs.
- Task `application_id` references and contact links are validated against the current profile.

## Planned API Direction

The next implementation pass should prioritize:

- profile bootstrap improvements beyond the current lazy auto-create flow
- optional contact-linked notes if they become necessary beyond the current application workspace

## Notes

- Authorization beyond single-user ownership is not implemented.
- Validation schemas and response contracts are still intentionally small and MVP-focused.
