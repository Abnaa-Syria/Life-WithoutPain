import requests

BASE_URL = "http://localhost:4000"
LOGIN_URL = f"{BASE_URL}/api/v1/doctor/auth/login"
ME_URL = f"{BASE_URL}/api/v1/doctor/auth/me"
AVAILABILITIES_URL = f"{BASE_URL}/api/v1/doctor/availabilities"
LOGOUT_URL = f"{BASE_URL}/api/v1/doctor/auth/logout"
TIMEOUT = 30

def test_doctor_availabilities_api():
    session = requests.Session()
    try:
        # Login
        login_payload = {"mobileNumber": "+966511111111", "password": "Password123"}
        login_resp = session.post(LOGIN_URL, json=login_payload, timeout=TIMEOUT)
        assert login_resp.status_code == 200, f"Login failed: {login_resp.text}"
        login_data = login_resp.json()
        access_token = login_data.get("data", {}).get("accessToken")
        assert access_token, "No accessToken in login response"

        headers = {"Authorization": f"Bearer {access_token}"}

        # Get profileId from /me
        me_resp = session.get(ME_URL, headers=headers, timeout=TIMEOUT)
        assert me_resp.status_code == 200, f"/me failed: {me_resp.text}"
        me_data = me_resp.json()
        profile_id = me_data.get("data", {}).get("profileId")
        assert profile_id, "No profileId in /me response"

        # 1) Test GET /api/v1/doctor/availabilities
        get_resp = session.get(AVAILABILITIES_URL, headers=headers, timeout=TIMEOUT)
        assert get_resp.status_code == 200, f"GET availabilities failed: {get_resp.text}"
        get_data = get_resp.json()
        assert isinstance(get_data, dict), "GET availabilities response is not a dict"
        # Optional: Check expected fields in response, e.g. data list
        assert "data" in get_data, "GET availabilities response missing data field"

        # 2) Test POST /api/v1/doctor/availabilities
        # Prepare a typical availability payload (example)
        # Since no schema details provided, a minimal plausible payload:
        post_payload = {
            "day": "Monday",
            "slots": [
                {"start": "09:00", "end": "12:00"},
                {"start": "14:00", "end": "17:00"}
            ]
        }
        post_resp = session.post(AVAILABILITIES_URL, headers=headers, json=post_payload, timeout=TIMEOUT)
        assert post_resp.status_code in (200, 201), f"POST availabilities failed: {post_resp.text}"
        post_data = post_resp.json()
        assert "data" in post_data, "POST availabilities response missing data field"
        created_availability = post_data["data"]
        assert isinstance(created_availability, dict), "Created availability should be a dict"

        # Optionally verify returned fields in created availability
        assert "day" in created_availability and created_availability["day"] == post_payload["day"]
        assert "slots" in created_availability and created_availability["slots"] == post_payload["slots"]

    finally:
        # Logout
        try:
            logout_resp = session.post(LOGOUT_URL, headers={"Authorization": f"Bearer {access_token}"}, timeout=TIMEOUT)
            assert logout_resp.status_code == 200, f"Logout failed: {logout_resp.text}"
        except Exception:
            pass

test_doctor_availabilities_api()