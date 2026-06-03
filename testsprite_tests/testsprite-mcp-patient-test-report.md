# TestSprite Patient Backend Report

**Run date:** 2026-06-03  
**Execution:** Local scripts in `testsprite_tests/TC*_test_patient_*.py` (TestSprite cloud returned **403 — insufficient credits**, 23 remaining)

## 1️⃣ Document Metadata

| Field | Value |
|-------|-------|
| Scope | Patient API `/api/v1/patient/*` (25 modules) |
| Auth | `POST /api/v1/patient/auth/login` → `data.accessToken` |
| Demo account | `+966522222222` / `Password123` |

## 2️⃣ Requirement Validation Summary

| Result | Count |
|--------|-------|
| **Passed** | **19 / 25 (76%)** |
| Failed | 6 |

### Passed (19)

TC001 Auth · TC002 Profile · TC003 Medical catalog · TC005 Timeline · TC006 Family members · TC008 Insurance requests · TC009 Files · TC011 Bookings · TC013 Doctors search · TC014 Specializations · TC015 Sub-specializations · TC016 Services · TC017 Directories · TC018 Records · TC021 Payments · TC022 Support · TC023 Settings · TC024 Notifications · TC025 Lab tests

### Failed (6)

| Test | Cause |
|------|--------|
| TC004 Medical profile | PUT returns **500** |
| TC007 Insurances | PUT response missing `policyNumber` field |
| TC010 Appointments | Test cancels already-**CANCELLED** appointment |
| TC012 Home services | Test body missing required `visitAddress` / `preferredDate` / `paymentMode` |
| TC019 Conversations | Test POST omits `doctorId` |
| TC020 Call sessions | Test finds no CONFIRMED remote appointment |

## 3️⃣ Coverage & Matching Metrics

- Plan target ≥70%: **met (76%)**
- TestSprite MCP cloud run: **not executed** (billing credits)

## 4️⃣ Key Gaps / Risks

- Medical profile PUT 500 needs backend investigation.
- Four failures are generated-test payload/route assumptions, not missing patient routes.
