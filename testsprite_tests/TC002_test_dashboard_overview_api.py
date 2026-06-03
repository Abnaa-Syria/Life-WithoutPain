import requests

BASE_URL = "http://localhost:4000"
LOGIN_ENDPOINT = "/api/v1/auth/login"
DASHBOARD_ENDPOINT = "/api/v1/dashboard"
LOGOUT_ENDPOINT = "/api/v1/auth/logout"
TIMEOUT = 30


def test_dashboard_overview_api():
    login_payload = {
        "identifier": "admin@hayabilaalam.com",
        "password": "Password123"
    }
    access_token = None
    refresh_token = None

    # Login once and reuse token
    try:
        login_resp = requests.post(
            BASE_URL + LOGIN_ENDPOINT,
            json=login_payload,
            timeout=TIMEOUT
        )
        assert login_resp.status_code == 200, f"Login failed with status {login_resp.status_code}"
        login_data = login_resp.json()
        assert login_data.get("success") is True, "Login response success flag is not True"
        data = login_data.get("data")
        assert data and "accessToken" in data and "refreshToken" in data, "Login response missing tokens"
        access_token = data["accessToken"]
        refresh_token = data["refreshToken"]

        headers = {
            "Authorization": f"Bearer {access_token}"
        }

        # Call dashboard endpoint
        dashboard_resp = requests.get(
            BASE_URL + DASHBOARD_ENDPOINT,
            headers=headers,
            timeout=TIMEOUT
        )

        assert dashboard_resp.status_code == 200, f"Dashboard GET failed with status {dashboard_resp.status_code}"

        dashboard_json = dashboard_resp.json()
        # Validate response shape and keys presence (KPIs, charts, widgets data)
        assert isinstance(dashboard_json, dict), "Dashboard response is not a JSON object"

        # Check success flag in dashboard response if present
        if "success" in dashboard_json:
            assert dashboard_json["success"] is True, "Dashboard response success flag is not True"

        expected_keys = ["kpis", "charts", "roleWidgets"]

        for key in expected_keys:
            assert key in dashboard_json, f"Dashboard response missing expected key: {key}"
            assert dashboard_json[key] is not None, f"Dashboard key '{key}' is None"
            if isinstance(dashboard_json[key], (list, dict)):
                assert len(dashboard_json[key]) > 0, f"Dashboard key '{key}' is empty"

    finally:
        # Logout if refresh_token exists
        if refresh_token:
            logout_payload = {"refreshToken": refresh_token}
            try:
                logout_resp = requests.post(
                    BASE_URL + LOGOUT_ENDPOINT,
                    json=logout_payload,
                    timeout=TIMEOUT
                )
                assert logout_resp.status_code in [200, 204], f"Logout failed with status {logout_resp.status_code}"
            except Exception:
                pass


test_dashboard_overview_api()
