# Doctor App — Help & Support API

Base URL: `{API_HOST}/api/v1/doctor/support`

Authentication: Bearer JWT on all endpoints.

## Support information

### `GET /info`

Same response shape as the patient app. See [PATIENT_APP_SUPPORT.md](./PATIENT_APP_SUPPORT.md#support-information).

## Support tickets

### `GET /tickets`

Lists tickets created by the authenticated doctor (`creatorRole: DOCTOR`).

Query parameters and list item shape match the patient app.

Legacy alias: `GET /cases`.

### `POST /tickets`

Create a ticket (`multipart/form-data`). Same fields as patient create.

### `GET /tickets/:id`

Detail with conversation thread. Only tickets owned by the doctor are accessible.

### `POST /tickets/:id/messages`

Reply on an open ticket (`message` + optional `files`).

## Notifications

Doctors receive `SUPPORT` notifications when:

- Admin replies to their ticket
- Ticket status is updated

## Mobile integration checklist

1. Mirror patient support module under `doctor/support` paths.
2. Reuse the same UI components; only base path differs.
3. Register module in app navigation as "Help & Support".

Swagger: `/api-docs/doctor/modules/support.json`
