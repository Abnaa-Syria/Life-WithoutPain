# Notifications

In-app notifications are stored in `notifications` and delivered in real time via Socket.IO (`notification:new` on room `notifications:user:{userId}`).

## Admin dashboard UX split

| Surface | API | Content |
|---------|-----|---------|
| **Bell dropdown (topbar)** | `GET /api/v1/notifications` | Personal inbox: all types the signed-in staff user may see (permission-filtered) |
| **Sidebar Notifications page** | `GET /api/v1/admin/notifications/manual` | **Custom admin sends only** (`source = ADMIN_MANUAL`), with target audience metadata |

Manual send: `POST /api/v1/admin/notifications/send` (uses `NotificationService` + socket). Resend: `POST /api/v1/admin/notifications/manual/:id/resend`. User search: `GET /api/v1/admin/notifications/users/search?q=`.

Automated rows (`source = SYSTEM_EVENT`) are never listed on the manual page; they appear only in each user's inbox.

## Notification sources

| `source` | Created by | Fields |
|----------|------------|--------|
| `SYSTEM_EVENT` | Domain event listeners (default) | — |
| `ADMIN_MANUAL` | Super admin send UI | `targetAudience`, `createdByAdminId`, optional `batchId` |

## Types and staff visibility

Staff users (admin dashboard) only **see** notification types they have permission for. End users (patients, doctors) see all notifications addressed to them.

| Type | Permission required (staff inbox) | Typical recipients |
|------|-----------------------------------|--------------------|
| `USER` | `users.list` | Staff when any user registers or is created by admin |
| `APPOINTMENT` | `appointments.list` | Staff, doctor, patient on create / status change |
| `INSURANCE` | `insurance.cases.list` | Patient + staff on create/update |
| `SUPPORT` | `support.tickets.list` | Staff on new ticket / user reply; creator on staff reply / status |
| `PAYMENT` | `payments.list` | Patient + staff on paid/failed webhook |
| `VERIFICATION` | `doctors.list` | Staff on new doctor signup; doctor on approve/reject |
| `LAB_RESULT` | `medical-master.list` | Patient + staff when result uploaded |
| `PRESCRIPTION` | `prescriptions.admin.list` | Patient + staff on issue |
| `REPORT` | `reports.admin.list` | Patient + staff on create |
| `REVIEW` | `reviews.moderate` | Staff on new review |
| `CHAT` | `dashboard.view` | Other party in appointment conversation |
| `SYSTEM` | `dashboard.view` | Manual admin broadcasts |

## Events

| Event | Producer | Listener |
|-------|----------|----------|
| `user.registered` | `auth.service` (patient/doctor), `POST /admin/users` | `user.listener.js` |
| `verification.doctor_submitted` | `auth.service` (doctor register) | `verification.listener.js` |
| `verification.doctor_approved` / `rejected` | `doctor.admin.controller` | `verification.listener.js` |
| `appointment.created` | `appointment.service` | `notification.listener.js` |
| `appointment.status_changed` | `appointment.service` `updateStatus` | `notification.listener.js` (CONFIRMED uses dedicated copy) |
| `insurance.case_created` / `case_updated` | insurance orchestrator / service | `insurance.listener.js` |
| `support.ticket.created` | `supportTicket.service` | `support.listener.js` |
| `support.user.replied` | `supportTicket.service` (non-staff message) | `support.listener.js` |
| `support.message.received` | staff reply | `support.listener.js` |
| `payment.completed` / `failed` | `payment.service` webhook | `payment.listener.js` |
| `chat.message_sent` | `conversation.service` | `notification.listener.js` |
| `lab_result.created` | `labTest.service` `uploadResult` | `notification.listener.js` |
| `prescription.created` | `prescription.service` | `notification.listener.js` |
| `report.created` | `report.service` | `notification.listener.js` |
| `review.created` | `review.service` | `notification.listener.js` |

**Admin appointment actions** must use `PATCH /api/v1/admin/appointments/:id/status` (delegates to `AppointmentService.updateStatus`) so events fire. Direct Prisma updates bypass notifications.

### Coverage gaps (optional future work)

| Domain | Status |
|--------|--------|
| Home service requests | No notification event yet |
| Push (FCM/APNs) | Not implemented |

## API

- Staff inbox: `GET /api/v1/notifications` (permission-filtered types)
- Admin manual campaigns: `/api/v1/admin/notifications/manual`, `/send`, `/manual/:id/resend`
- Patient app: `GET /api/v1/patient/notifications` (all types for user)
- Doctor app: `GET /api/v1/doctor/notifications` (all types for user)

## Related code

- `backend/src/shared/notifications/NotificationService.js` — persist + socket emit
- `backend/src/modules/notifications/notifications.admin.service.js` — manual send/resend
- `backend/src/shared/notifications/notificationPermissions.js` — type ↔ permission map
- `backend/src/shared/notifications/notificationRecipients.js` — resolve staff user IDs by permission
