# Patient App — Help & Support API

Base URL: `{API_HOST}/api/v1/patient/support`

Authentication: Bearer JWT (`Authorization: Bearer {accessToken}`) on all endpoints below.

## Support information

### `GET /info`

Returns contact details managed from the admin dashboard.

**Query:** `lang` — `ar` (default) or `en`

**Response `data`:**

```json
{
  "supportPhones": ["+966500000000"],
  "supportEmail": "support@hayabilaalam.com",
  "whatsappNumber": "+966500000000",
  "whatsappLink": "https://wa.me/966500000000",
  "socialLinks": { "facebook": "...", "instagram": "..." },
  "workingHours": { "ar": "...", "en": "..." },
  "description": "Localized support message"
}
```

Public alternative (no auth): `GET /api/v1/support/info?lang=ar`

## Support tickets

### `GET /tickets`

List the authenticated patient's tickets.

| Query | Description |
|-------|-------------|
| `status` | `OPEN`, `IN_PROGRESS`, `RESOLVED`, `CLOSED` |
| `page`, `limit` | Pagination |

**List item fields:** `id`, `category`, `subject`, `status`, `priority`, `unreadCount`, `lastMessagePreview`, `createdAt`, `lastActivityAt`

Legacy alias: `GET /cases` (same handler).

### `POST /tickets`

Create a ticket (`multipart/form-data`).

| Field | Required | Notes |
|-------|----------|-------|
| `subject` | yes | max 500 chars |
| `description` | yes | initial message body |
| `category` | yes | `TECHNICAL`, `APPOINTMENT`, `PAYMENT`, `INSURANCE`, `ACCOUNT`, `OTHER` |
| `priority` | no | `LOW`, `MEDIUM`, `HIGH`, `URGENT` |
| `files` | no | up to 5 attachments |

### `GET /tickets/:id`

Ticket detail including `messages[]` and ticket-level `attachments[]`. Marks admin messages as read for the patient.

### `POST /tickets/:id/messages`

Reply on a ticket (`multipart/form-data`).

| Field | Required |
|-------|----------|
| `message` | yes |
| `files` | no |

## Notifications

Push/in-app notifications (`type: SUPPORT`) are created when:

- Support staff replies to your ticket
- Ticket status changes

## Mobile integration checklist

1. Add `supportApi.getInfo()`, `listTickets()`, `createTicket()`, `getTicket()`, `sendMessage()`.
2. Show unread badge from `unreadCount` on list items.
3. Use `whatsappLink` for quick contact from the info screen.
4. Poll or refresh ticket detail after sending a message.

Swagger: `/api-docs/patient/modules/support.json`
