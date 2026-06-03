import requests

BASE_URL = "http://localhost:4000"
LOGIN_ENDPOINT = "/api/v1/patient/auth/login"
SUPPORT_INFO_ENDPOINT = "/api/v1/patient/support/info"
SUPPORT_TICKETS_ENDPOINT = "/api/v1/patient/support/tickets"
TIMEOUT = 30

def test_patient_support_api():
    login_url = BASE_URL + LOGIN_ENDPOINT
    support_info_url = BASE_URL + SUPPORT_INFO_ENDPOINT
    support_tickets_url = BASE_URL + SUPPORT_TICKETS_ENDPOINT

    credentials = {
        "phoneNumber": "+966522222222",
        "password": "Password123"
    }

    # Login to get accessToken
    try:
        login_resp = requests.post(login_url, json=credentials, timeout=TIMEOUT)
        login_resp.raise_for_status()
    except requests.RequestException as e:
        assert False, f"Login request failed: {e}"

    login_data = login_resp.json()
    assert "data" in login_data, "Login response missing 'data'"
    assert "accessToken" in login_data["data"], "Login response missing accessToken"
    access_token = login_data["data"]["accessToken"]
    assert isinstance(access_token, str) and access_token, "accessToken is not valid"

    headers = {
        "Authorization": f"Bearer {access_token}"
    }

    # Test GET /api/v1/patient/support/info
    try:
        info_resp = requests.get(support_info_url, headers=headers, timeout=TIMEOUT)
        info_resp.raise_for_status()
    except requests.RequestException as e:
        assert False, f"GET support info request failed: {e}"

    info_data = info_resp.json()
    assert info_resp.status_code == 200, f"Expected status 200 for support info, got {info_resp.status_code}"
    assert isinstance(info_data, dict), "Support info response is not a JSON object"
    # Optionally check keys like 'contact' or 'phone', but no schema details given

    # Test GET /api/v1/patient/support/tickets
    try:
        tickets_resp = requests.get(support_tickets_url, headers=headers, timeout=TIMEOUT)
        tickets_resp.raise_for_status()
    except requests.RequestException as e:
        assert False, f"GET support tickets request failed: {e}"

    tickets_data = tickets_resp.json()
    assert tickets_resp.status_code == 200, f"Expected status 200 for support tickets, got {tickets_resp.status_code}"
    assert isinstance(tickets_data, (list, dict)), "Support tickets response is not a list or object"

test_patient_support_api()