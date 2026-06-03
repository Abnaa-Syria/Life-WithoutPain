import requests

BASE_URL = "http://localhost:4000"
LOGIN_ENDPOINT = "/api/v1/auth/login"
LOGOUT_ENDPOINT = "/api/v1/auth/logout"
DASHBOARD_ENDPOINT = "/api/v1/dashboard"

ADMIN_IDENTIFIER = "admin@hayabilaalam.com"
ADMIN_PASSWORD = "Password123"
TIMEOUT = 30


def test_logout_api():
    # Step 1: Login once to obtain accessToken and refreshToken
    login_payload = {"identifier": ADMIN_IDENTIFIER, "password": ADMIN_PASSWORD}

    try:
        login_response = requests.post(
            BASE_URL + LOGIN_ENDPOINT,
            json=login_payload,
            timeout=TIMEOUT
        )
        login_response.raise_for_status()
    except requests.RequestException as e:
        assert False, f"Login request failed: {e}"

    login_data = login_response.json()
    assert login_data.get("success") is True, "Login was not successful"
    assert "data" in login_data and "accessToken" in login_data["data"] and "refreshToken" in login_data["data"], \
        "Login response missing tokens"
    access_token = login_data["data"]["accessToken"]
    refresh_token = login_data["data"]["refreshToken"]

    # Step 2: Verify the access token works by getting dashboard data
    headers = {"Authorization": f"Bearer {access_token}"}
    try:
        dashboard_response = requests.get(
            BASE_URL + DASHBOARD_ENDPOINT,
            headers=headers,
            timeout=TIMEOUT
        )
        dashboard_response.raise_for_status()
    except requests.RequestException as e:
        assert False, f"Dashboard request failed with valid token: {e}"

    # Step 3: Logout using the refreshToken
    logout_payload = {"refreshToken": refresh_token}
    try:
        logout_response = requests.post(
            BASE_URL + LOGOUT_ENDPOINT,
            json=logout_payload,
            headers=headers,
            timeout=TIMEOUT
        )
        logout_response.raise_for_status()
    except requests.RequestException as e:
        assert False, f"Logout request failed: {e}"

    logout_data = logout_response.json()
    # Expect success field to be True and message confirming logout (message checked loosely)
    assert logout_data.get("success") is True, "Logout did not return success"

    # Step 4: After logout, the access token should be invalid (dashboard call should fail)
    try:
        post_logout_dashboard_response = requests.get(
            BASE_URL + DASHBOARD_ENDPOINT,
            headers=headers,
            timeout=TIMEOUT
        )
        # We expect a 401 Unauthorized or equivalent error here
        assert post_logout_dashboard_response.status_code == 401, (
            f"Expected 401 Unauthorized after logout but got {post_logout_dashboard_response.status_code}"
        )
    except requests.RequestException as e:
        # If request failed due to unauthorized, it's acceptable
        if hasattr(e.response, "status_code"):
            assert e.response.status_code == 401, f"Unexpected error after logout: {e}"
        else:
            # Network or other errors should fail the test
            assert False, f"Unexpected exception after logout: {e}"


test_logout_api()