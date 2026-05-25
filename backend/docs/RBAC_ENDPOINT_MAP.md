# RBAC Endpoint Permission Map

Canonical permission keys live in `backend/src/shared/permissions/catalog.js`.

## Admin monolith (`/api/v1/admin`)

| Method | Path | Permission |
|--------|------|------------|
| GET | /users | users.list |
| GET | /users/:id | users.read |
| POST | /users | users.create |
| PUT | /users/:id | users.update |
| DELETE | /users/:id | users.delete |
| GET | /patients | patients.list |
| GET | /patients/:id | patients.read |
| PUT | /patients/:id/medical-profile | patients.update |
| GET/POST/DELETE | /patients/:id/medical-profile/attachments* | patients.read / patients.update |
| PUT | /patients/:id | patients.update |
| DELETE | /patients/:id | patients.delete |
| GET | /patients/:id/insurances | patients.insurance.read |
| PATCH | /patients/:id/insurances/:insuranceId/verify | patients.insurance.verify |
| GET/POST/PUT/DELETE | /services* | services.list/read/create/update/delete |
| GET/POST/PUT/DELETE | /insurance-providers* | insurance.providers.manage |
| GET/PUT/DELETE | /appointments* | appointments.list/read/update/delete |
| GET/PUT/DELETE | /insurance-cases* | insurance.cases.list/read/update/delete |
| PATCH | /insurance-cases/:id/approve, /reject, /request-info, /approval | insurance.cases.decide |
| PATCH | /insurance-cases/:id/escalate | insurance.cases.update |
| GET/PATCH/DELETE | /support-cases* | support.cases.list/read/manage |
| GET/PUT/DELETE | /lab-tests* | lab-tests.list/read/update/delete |
| GET/PUT/DELETE | /payments* | payments.list/read/update/delete |
| GET/PUT/DELETE | /claims* | claims.list/manage |
| GET/POST/PUT/DELETE | /claims/batches* | claims.list/manage |
| GET/POST/PUT/DELETE | /reconciliations* | reconciliations.manage |
| GET/POST/PUT/DELETE | /doctor-payouts* | payouts.manage |
| GET/PUT/DELETE | /reports* | reports.admin.* |
| GET/PUT/DELETE | /prescriptions* | prescriptions.admin.* |
| GET/POST/PUT/DELETE | /notifications* | notifications.admin.* |
| GET/PUT/DELETE | /reviews* | reviews.moderate |
| GET/POST/PUT/DELETE | /settings* | settings.manage |
| GET | /audit-logs* | audit.view |
| GET/POST/PUT/DELETE | /chronic-diseases, /allergies, /medications, /medical-tests | medical-master.* |

## Admin sub-routers

| Prefix | Permission examples |
|--------|---------------------|
| /admin/doctors | doctors.list, doctors.read, doctors.verify, doctors.update, doctors.delete |
| /admin/support | support.tickets.*, support.tickets.info |
| /admin/specialities | specialities.* |
| /admin/rbac | roles.manage |
| /dashboard | dashboard.view |

## Mobile / app routes (unchanged — enum roles)

Patient, doctor, and patient-auth routes continue to use `authorize(PATIENT|DOCTOR)` only.

| GET | /patient/insurance-requests, /patient/insurance-requests/:id | PATIENT (own cases) |
