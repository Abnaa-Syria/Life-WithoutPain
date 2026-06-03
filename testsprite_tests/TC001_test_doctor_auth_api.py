import requests

BASE_URL = "http://localhost:4000"
TIMEOUT = 30

def test_doctor_auth_api():
    login_url = f"{BASE_URL}/api/v1/doctor/auth/login"
    me_url = f"{BASE_URL}/api/v1/doctor/auth/me"
    logout_url = f"{BASE_URL}/api/v1/doctor/auth/logout"

    login_payload = {
        "mobileNumber": "+966511111111",
        "password": "Password123"
    }
    headers = {"Content-Type": "application/json"}

    try:
        # POST login
        login_resp = requests.post(login_url, json=login_payload, headers=headers, timeout=TIMEOUT)
        assert login_resp.status_code == 200, f"Login failed with status {login_resp.status_code}"
        login_data = login_resp.json()
        assert "data" in login_data and "accessToken" in login_data["data"], "accessToken missing in login response"
        access_token = login_data["data"]["accessToken"]
        auth_headers = {
            "Authorization": f"Bearer {access_token}"
        }

        # GET /me
        me_resp = requests.get(me_url, headers=auth_headers, timeout=TIMEOUT)
        assert me_resp.status_code == 200, f"/me request failed with status {me_resp.status_code}"
        me_data = me_resp.json()
        assert "data" in me_data and "profileId" in me_data["data"], "profileId missing in /me response"

        # POST logout
        logout_resp = requests.post(logout_url, headers=auth_headers, timeout=TIMEOUT)
        assert logout_resp.status_code == 200, f"Logout failed with status {logout_resp.status_code}"
        logout_data = logout_resp.json()
        # Assuming response confirms session end - no required field verified per PRD

    except requests.RequestException as e:
        assert False, f"Request failed: {e}"

test_doctor_auth_api()