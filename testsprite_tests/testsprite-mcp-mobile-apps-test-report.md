# TestSprite Mobile Apps (Patient + Doctor) Summary

## 1️⃣ Document Metadata

| App | Pass rate | Target | Status |
|-----|-----------|--------|--------|
| Patient | **18/25 (72%)** | ≥70% | Met |
| Doctor | **5/13 (38%)** | ≥60% | Not met (test harness + contract drift) |

Date: 2026-06-03

Shared credentials: `Password123` — Patient `+966522222222`, Doctor `+966511111111`.

Auth: both apps return **`data.accessToken`** (admin-aligned).

## 2️⃣ Requirement Validation Summary

See detailed reports:

- [Patient report](./testsprite-mcp-patient-test-report.md)
- [Doctor report](./testsprite-mcp-doctor-test-report.md)

## 3️⃣ Coverage & Matching Metrics

Backend work completed per revised plan:

- Mobile auth standardized on `accessToken`
- Idempotent mobile demo seed (`Mobile demo appointment`)
- Doctor: reports GET, notifications `listForDoctor`, patient detail mapper, appointment status sort
- Patient: family payload builder, profile/settings/conversation/file/call-session fixes
- MySQL migration fix for `notification_source` (removed invalid `CREATE TYPE`)

## 4️⃣ Key Gaps / Risks

- Doctor pass rate limited by TestSprite using wrong routes (appointment PATCH, lab-test PATCH) and PDF content-type expectations.
- Patient medical-profile PUT 500 needs follow-up.
- Optional doctor re-run recommended after latest service-layer alias fixes.
