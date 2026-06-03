import requests

BASE_URL = "http://localhost:4000"
LOGIN_URL = f"{BASE_URL}/api/v1/patient/auth/login"
INSURANCE_REQUESTS_URL = f"{BASE_URL}/api/v1/patient/insurance-requests"
TIMEOUT = 30

def test_patient_insurance_requests_api():
    # Login to get accessToken
    login_payload = {
        "phoneNumber": "+966522222222",
        "password": "Password123"
    }
    try:
        login_resp = requests.post(LOGIN_URL, json=login_payload, timeout=TIMEOUT)
        assert login_resp.status_code == 200, f"Login failed with status {login_resp.status_code}"
        login_data = login_resp.json()
        access_token = login_data.get("data", {}).get("accessToken")
        assert access_token, "Access token not found in login response"
    except Exception as e:
        assert False, f"Login request failed: {e}"

    headers = {
        "Authorization": f"Bearer {access_token}"
    }

    # GET list of insurance requests
    try:
        list_resp = requests.get(INSURANCE_REQUESTS_URL, headers=headers, timeout=TIMEOUT)
        assert list_resp.status_code == 200, f"GET insurance requests list failed with status {list_resp.status_code}"
        list_data = list_resp.json()
        assert "data" in list_data, "Response missing 'data' key for insurance requests list"
        insurance_requests = list_data["data"]
        assert isinstance(insurance_requests, list), "'data' should be a list"
    except Exception as e:
        assert False, f"GET insurance requests list failed: {e}"

    # If no insurance requests exist, no further GET by id test can be done
    if not insurance_requests:
        return

    # Pick one insurance request ID to fetch details
    request_id = insurance_requests[0].get("id")
    assert request_id, "Insurance request missing 'id'"

    # GET insurance request details by ID
    try:
        detail_url = f"{INSURANCE_REQUESTS_URL}/{request_id}"
        detail_resp = requests.get(detail_url, headers=headers, timeout=TIMEOUT)
        assert detail_resp.status_code == 200, f"GET insurance request detail failed with status {detail_resp.status_code}"
        detail_data = detail_resp.json()
        assert "data" in detail_data, "Response missing 'data' key for insurance request detail"
        assert detail_data["data"].get("id") == request_id, "Returned insurance request ID does not match requested ID"
    except Exception as e:
        assert False, f"GET insurance request detail failed: {e}"

test_patient_insurance_requests_api()