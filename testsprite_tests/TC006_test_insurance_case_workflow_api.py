import requests

BASE_URL = "http://localhost:4000"
LOGIN_URL = f"{BASE_URL}/api/v1/auth/login"
INSURANCE_CASES_URL = f"{BASE_URL}/api/v1/admin/insurance-cases"

LOGIN_PAYLOAD = {
    "identifier": "admin@hayabilaalam.com",
    "password": "Password123"
}

TIMEOUT = 30


def test_insurance_case_workflow_api():
    # Authenticate once and reuse token
    login_resp = requests.post(LOGIN_URL, json=LOGIN_PAYLOAD, timeout=TIMEOUT)
    assert login_resp.status_code == 200, f"Login failed: {login_resp.text}"
    login_data = login_resp.json()
    assert login_data.get("success") is True
    access_token = login_data.get("data", {}).get("accessToken")
    refresh_token = login_data.get("data", {}).get("refreshToken")
    assert access_token, "No access token received"
    headers = {"Authorization": f"Bearer {access_token}"}

    # Step 1: List insurance cases (GET)
    list_resp = requests.get(INSURANCE_CASES_URL, headers=headers, timeout=TIMEOUT)
    assert list_resp.status_code == 200, f"Failed to list insurance cases: {list_resp.text}"
    list_data = list_resp.json()
    assert isinstance(list_data, dict)
    assert list_data.get("success") is True
    cases = list_data.get("data")
    assert isinstance(cases, list), "Insurance cases data should be a list"

    if not cases:
        # No existing cases to approve/reject on
        return

    # Use first case for the rest of actions
    case = cases[0]
    case_id = case.get("id") or case.get("_id")
    assert case_id, "Insurance case does not have an id"

    # Step 2: Approve insurance case (PATCH to /:id/approve)
    approve_url = f"{INSURANCE_CASES_URL}/{case_id}/approve"
    approve_resp = requests.patch(approve_url, headers=headers, timeout=TIMEOUT)
    assert approve_resp.status_code == 200, f"Failed to approve insurance case: {approve_resp.text}"
    approve_data = approve_resp.json()
    assert approve_data.get("success") is True
    # Check if case status exists and is a string (not enforcing exact values)
    updated_case = approve_data.get("data")
    if updated_case:
        status = updated_case.get("status")
        assert status is not None and isinstance(status, str), "Case status field missing or invalid after approval"

    # Step 3: Reject insurance case (PATCH to /:id/reject)
    reject_url = f"{INSURANCE_CASES_URL}/{case_id}/reject"
    reject_resp = requests.patch(reject_url, headers=headers, timeout=TIMEOUT)
    assert reject_resp.status_code == 200, f"Failed to reject insurance case: {reject_resp.text}"
    reject_data = reject_resp.json()
    assert reject_data.get("success") is True
    updated_case = reject_data.get("data")
    if updated_case:
        status = updated_case.get("status")
        assert status is not None and isinstance(status, str), "Case status field missing or invalid after rejection"

    # Logout to clean session
    logout_url = f"{BASE_URL}/api/v1/auth/logout"
    logout_payload = {"refreshToken": refresh_token}
    logout_resp = requests.post(logout_url, json=logout_payload, headers=headers, timeout=TIMEOUT)
    assert logout_resp.status_code == 200, f"Logout failed: {logout_resp.text}"
    logout_data = logout_resp.json()
    assert logout_data.get("success") is True


test_insurance_case_workflow_api()
