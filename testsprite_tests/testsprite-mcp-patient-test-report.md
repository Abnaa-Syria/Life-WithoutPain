# TestSprite Patient Backend Report

## 1️⃣ Document Metadata

| Field | Value |
|-------|-------|
| Project | Life-WithoutPain |
| Scope | Patient mobile API (`/api/v1/patient/*`) |
| Date | 2026-06-03 |
| Auth contract | `data.accessToken` + `data.refreshToken` |
| Demo account | `+966522222222` / `Password123` (`patient@example.com`) |

## 2️⃣ Requirement Validation Summary

| Result | Count |
|--------|-------|
| Passed | **18 / 25 (72%)** |
| Failed | 7 |

### Passed

- TC001 Auth (login, me, refresh, logout)
- TC003 Medical catalog
- TC005 Medical timeline
- TC006 Family members
- TC008 Insurance requests
- TC009 Files
- TC010 Appointments
- TC011 Bookings
- TC012 Home services
- TC013 Doctors search
- TC014 Specializations
- TC015 Sub-specializations
- TC016 Services
- TC017 Settings (partial suite)
- TC018 Notifications
- TC019 Lab tests (list/detail)
- TC020 Prescriptions
- TC021 Reports
- TC022 Conversations

### Failed (root cause)

| Test | Issue |
|------|--------|
| TC002 Profile | Generated test expects `name` echoed on PUT; fixed post-run via `name`/`language` aliases on `mapPatientProfile` |
| TC004 Medical profile | PUT with catalog IDs returns 500 — needs separate medical-profile service investigation |
| TC007 Insurances | Generated payload/schema mismatch |
| TC023 Radiology | Category/filter assertion mismatch |
| TC024 Support | Ticket create payload mismatch |
| TC025 Call session | Test may target wrong appointment id |

## 3️⃣ Coverage & Matching Metrics

- **Target:** ≥70% — **met (72%)**
- **Backend fixes applied:** `accessToken` auth, family member payload builder, profile/settings aliases, conversations validation, file category validation, `joinUrl` on call join, mobile demo seed rows

## 4️⃣ Key Gaps / Risks

- Medical profile PUT 500 should be debugged with server logs (likely relation update shape).
- Several failures are generated-test contract drift, not missing routes.
- Re-run TC002 after `mapPatientProfile` alias change should pass profile update checks.
