import requests

BASE_URL = "http://localhost:4000"
TIMEOUT = 30

def test_patient_auth_api():
    login_url = f"{BASE_URL}/api/v1/patient/auth/login"
    me_url = f"{BASE_URL}/api/v1/patient/auth/me"
    refresh_token_url = f"{BASE_URL}/api/v1/patient/auth/refresh-token"
    logout_url = f"{BASE_URL}/api/v1/patient/auth/logout"

    login_payload = {
        "phoneNumber": "+966522222222",
        "password": "Password123"
    }
    try:
        # POST /api/v1/patient/auth/login
        login_resp = requests.post(login_url, json=login_payload, timeout=TIMEOUT)
        assert login_resp.status_code == 200, f"Login failed with status: {login_resp.status_code}"
        login_data = login_resp.json().get("data")
        assert login_data and "accessToken" in login_data and "refreshToken" in login_data, "Missing tokens in login response"
        access_token = login_data["accessToken"]
        refresh_token = login_data["refreshToken"]

        headers = {"Authorization": f"Bearer {access_token}"}

        # GET /api/v1/patient/auth/me
        me_resp = requests.get(me_url, headers=headers, timeout=TIMEOUT)
        assert me_resp.status_code == 200, f"Get me failed with status: {me_resp.status_code}"
        me_data = me_resp.json().get("data")
        assert me_data is not None, "Missing user profile data in /me response"

        # POST /api/v1/patient/auth/refresh-token
        refresh_payload = {"refreshToken": refresh_token}
        refresh_resp = requests.post(refresh_token_url, json=refresh_payload, timeout=TIMEOUT)
        assert refresh_resp.status_code == 200, f"Refresh token failed with status: {refresh_resp.status_code}"
        refresh_data = refresh_resp.json().get("data")
        assert refresh_data and "accessToken" in refresh_data and "refreshToken" in refresh_data, "Missing new tokens in refresh-token response"

        # POST /api/v1/patient/auth/logout
        logout_resp = requests.post(logout_url, headers=headers, timeout=TIMEOUT)
        assert logout_resp.status_code == 200, f"Logout failed with status: {logout_resp.status_code}"
        logout_data = logout_resp.json()
        # Optionally check logout confirmation message
        assert logout_data is not None, "Missing logout response body"

    except requests.RequestException as e:
        assert False, f"Request failed: {e}"

test_patient_auth_api()