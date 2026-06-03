# Mobile Apps Test Summary (2026-06-03)

| App | Result | Target | Status |
|-----|--------|--------|--------|
| Patient (25) | **19/25 (76%)** | ≥70% | Met |
| Doctor (13) | **8/13 (62%)** | ≥60% | Met |

## Execution note

**TestSprite cloud** (`generateCodeAndExecute`) failed with:

```text
403 — You don't have enough credits (23 remaining)
```

Tests were run **locally** against `http://localhost:4000` using the generated `testsprite_tests/TC*.py` scripts.

## Reports

- [Patient detail](./testsprite-mcp-patient-test-report.md)
- [Doctor detail](./testsprite-mcp-doctor-test-report.md)

## Next step for cloud re-run

Top up credits on TestSprite, then run patient plan then doctor plan with `testsprite_patient_backend_test_plan.json` / `testsprite_doctor_backend_test_plan.json` copied to `testsprite_backend_test_plan.json`.
