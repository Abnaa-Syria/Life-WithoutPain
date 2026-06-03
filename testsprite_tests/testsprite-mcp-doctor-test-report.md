# TestSprite Doctor Backend Report

## 1️⃣ Document Metadata

| Field | Value |
|-------|-------|
| Project | Life-WithoutPain |
| Scope | Doctor mobile API (`/api/v1/doctor/*`) |
| Date | 2026-06-03 |
| Auth contract | `data.accessToken` + `data.refreshToken` |
| Demo account | `+966511111111` / `Password123` (`dr.ahmed@example.com`) |
| Demo data | 3× `Mobile demo appointment` rows (PENDING / CONFIRMED / COMPLETED) with `patient@example.com` |

## 2️⃣ Requirement Validation Summary

| Result | Count |
|--------|-------|
| Passed | **5 / 13 (38%)** |
| Failed | 8 |

### Passed

- TC001 Auth (login, me, logout) — uses `accessToken` and `profileId`
- TC002 Specializations (public)
- TC005 Patients list + detail (includes `id`)
- TC008 Notifications
- TC012 Support info/tickets

### Failed (root cause)

| Test | Issue |
|------|--------|
| TC003 Availabilities | Test POST body uses `day`/`slots`; API expects `dayOfWeek`/`startTime` — response is array not dict |
| TC004 Appointments | Test calls `PATCH /appointments/:id`; real routes are `/confirm`, `/reject`, `/cancel` |
| TC006 Prescriptions | Wrong field names in generated test (`name` vs `medicineName`); server fix added + `patientEmail` context |
| TC007 Reports | PDF endpoint returns JSON `{ pdfUrl }`, not `application/pdf` stream |
| TC009 Profile | Language alias added post-run |
| TC010 Clinic | `phone` on clinic DTO added post-run |
| TC011 Settings | `notificationsEnabled` mapped to `isAvailable` post-run |
| TC013 Lab tests | Test uses wrong PATCH path (not `/lab-tests/:id/status`) |

## 3️⃣ Coverage & Matching Metrics

- **Target:** ≥60% — **not met on this run (38%)**
- **Real API fixes verified:** GET reports list, `listForDoctor` notifications, `mapPatientDetail`, PENDING-first appointment sort, `resolveDoctorAppointmentContext`, mobile demo seed, `accessToken` auth

## 4️⃣ Key Gaps / Risks

- Majority of remaining failures are **generated test path/payload mismatches**, not missing doctor modules.
- Re-run after post-run fixes (prescription `name` mapping, clinic `phone`, profile/settings aliases) should improve TC006/009/010/011.
- Appointment confirm flow requires `PATCH .../confirm`, not generic status PATCH.
- PDF endpoints are URL-in-JSON by design; streaming PDF would be a separate product change.
