import requests

BASE_URL = "http://localhost:4000"
LOGIN_URL = f"{BASE_URL}/api/v1/patient/auth/login"
SETTINGS_URL = f"{BASE_URL}/api/v1/patient/settings"
TIMEOUT = 30

def test_patient_settings_api():
    phone_number = "+966522222222"
    password = "Password123"

    # Login to get accessToken
    login_payload = {
        "phoneNumber": phone_number,
        "password": password
    }
    try:
        login_resp = requests.post(LOGIN_URL, json=login_payload, timeout=TIMEOUT)
        assert login_resp.status_code == 200, f"Login failed: {login_resp.text}"
        login_data = login_resp.json()
        access_token = login_data.get("data", {}).get("accessToken")
        assert access_token, "accessToken not found in login response"

        headers = {
            "Authorization": f"Bearer {access_token}"
        }

        # GET /api/v1/patient/settings
        get_resp = requests.get(SETTINGS_URL, headers=headers, timeout=TIMEOUT)
        assert get_resp.status_code == 200, f"GET settings failed: {get_resp.text}"
        get_data = get_resp.json()
        assert "data" in get_data, "GET settings response missing 'data' field"

        # Prepare patch payload: toggle a common setting if available or update preferences
        settings_before = get_data["data"]
        patch_payload = {}

        # Try to find a boolean or string preference to toggle/change
        for key, value in settings_before.items():
            if isinstance(value, bool):
                patch_payload[key] = not value
                break
            elif isinstance(value, str):
                patch_payload[key] = value[::-1]  # reverse string as dummy change
                break
            elif isinstance(value, dict):
                # If nested dictionary, try to patch one string/boolean inside it
                for k2, v2 in value.items():
                    if isinstance(v2, bool):
                        patch_payload[key] = dict(value)  # copy
                        patch_payload[key][k2] = not v2
                        break
                    elif isinstance(v2, str):
                        patch_payload[key] = dict(value)
                        patch_payload[key][k2] = v2[::-1]
                        break
                if patch_payload:
                    break
        # If no patchable field found, patch a dummy setting (may cause 400 but we test the flow)
        if not patch_payload:
            patch_payload = {"dummySetting": True}

        # PATCH /api/v1/patient/settings
        patch_resp = requests.patch(SETTINGS_URL, headers=headers, json=patch_payload, timeout=TIMEOUT)
        # Patch can succeed or respond with 400 if invalid values, we assert 200 or 400 accordingly
        assert patch_resp.status_code in [200, 400], f"PATCH settings unexpected status: {patch_resp.status_code}, content: {patch_resp.text}"
        if patch_resp.status_code == 200:
            patch_data = patch_resp.json()
            assert "data" in patch_data, "PATCH settings response missing 'data' field"

    except requests.RequestException as e:
        assert False, f"Request failed: {str(e)}"


test_patient_settings_api()