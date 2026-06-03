import requests

BASE_URL = "http://localhost:4000"
LOGIN_URL = f"{BASE_URL}/api/v1/doctor/auth/login"
AUTH_ME_URL = f"{BASE_URL}/api/v1/doctor/auth/me"
SPECIALIZATIONS_URL = f"{BASE_URL}/api/v1/doctor/specializations"
SUB_SPECIALIZATIONS_URL = f"{BASE_URL}/api/v1/doctor/sub-specializations"
LOGOUT_URL = f"{BASE_URL}/api/v1/doctor/auth/logout"

MOBILE_NUMBER = "+966511111111"
PASSWORD = "Password123"
TIMEOUT = 30

def test_doctor_specializations_api():
    try:
        # Login to get access token
        login_resp = requests.post(
            LOGIN_URL,
            json={"mobileNumber": MOBILE_NUMBER, "password": PASSWORD},
            timeout=TIMEOUT
        )
        assert login_resp.status_code == 200, f"Login failed with status {login_resp.status_code}"
        login_data = login_resp.json()
        access_token = login_data.get("data", {}).get("accessToken")
        assert access_token, "accessToken not found in login response"

        headers = {"Authorization": f"Bearer {access_token}"}

        # Verify access token via /auth/me to get profileId
        me_resp = requests.get(AUTH_ME_URL, headers=headers, timeout=TIMEOUT)
        assert me_resp.status_code == 200, f"/auth/me failed with status {me_resp.status_code}"
        me_data = me_resp.json()
        profile_id = me_data.get("data", {}).get("profileId")
        assert profile_id, "profileId not found in /auth/me response"

        # Test GET /doctor/specializations (public, but test with auth)
        spec_resp = requests.get(SPECIALIZATIONS_URL, headers=headers, timeout=TIMEOUT)
        assert spec_resp.status_code == 200, f"/doctor/specializations failed with status {spec_resp.status_code}"
        spec_json = spec_resp.json()
        assert "data" in spec_json, "/doctor/specializations response missing data"
        assert isinstance(spec_json["data"], list), "/doctor/specializations data is not a list"

        # Test GET /doctor/sub-specializations (public, but test with auth)
        sub_spec_resp = requests.get(SUB_SPECIALIZATIONS_URL, headers=headers, timeout=TIMEOUT)
        assert sub_spec_resp.status_code == 200, f"/doctor/sub-specializations failed with status {sub_spec_resp.status_code}"
        sub_spec_json = sub_spec_resp.json()
        assert "data" in sub_spec_json, "/doctor/sub-specializations response missing data"
        assert isinstance(sub_spec_json["data"], list), "/doctor/sub-specializations data is not a list"

    finally:
        # Logout to end session
        # If access_token missing, skip logout
        if 'access_token' in locals() and access_token:
            try:
                logout_resp = requests.post(LOGOUT_URL, headers={"Authorization": f"Bearer {access_token}"}, timeout=TIMEOUT)
                assert logout_resp.status_code == 200, f"Logout failed with status {logout_resp.status_code}"
            except Exception:
                pass

test_doctor_specializations_api()