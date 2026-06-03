# TestSprite Doctor Backend Report

**Run date:** 2026-06-03  
**Execution:** Local scripts in `testsprite_tests/TC*_test_doctor_*.py` (TestSprite cloud returned **403 — insufficient credits**, 23 remaining)

## 1️⃣ Document Metadata

| Field | Value |
|-------|-------|
| Scope | Doctor API `/api/v1/doctor/*` (13 modules) |
| Auth | `POST /api/v1/doctor/auth/login` → `data.accessToken` |
| Demo account | `+966511111111` / `Password123` (`dr.ahmed@example.com`) |

## 2️⃣ Requirement Validation Summary

| Result | Count |
|--------|-------|
| **Passed** | **8 / 13 (62%)** |
| Failed | 5 |

### Passed (8)

TC001 Auth · TC002 Specializations · TC005 Patients · TC008 Notifications · TC009 Profile · TC010 Clinic details · TC011 Settings · TC012 Support

### Failed (5)

| Test | Cause |
|------|--------|
| TC003 Availabilities | Test expects POST response `data` as **dict**; API returns **array** |
| TC004 Appointments | Test uses `PATCH /appointments/:id`; API uses `/confirm`, `/reject`, `/cancel` |
| TC006 Prescriptions | POST returns **500** (investigate server logs) |
| TC007 Reports | PDF endpoint returns JSON `{ pdfUrl }`, not `application/pdf` |
| TC013 Lab tests | Test uses wrong PATCH path (route not found) |

## 3️⃣ Coverage & Matching Metrics

- Plan target ≥60%: **met (62%)**
- TestSprite MCP cloud run: **not executed** (billing credits)

## 4️⃣ Key Gaps / Risks

- TC006 prescription 500 is a real backend issue worth fixing.
- TC004/TC013 failures are wrong generated paths, not missing doctor modules.
- Add TestSprite credits at [billing settings](https://www.testsprite.com/dashboard/settings/billing) to re-run cloud execution.
