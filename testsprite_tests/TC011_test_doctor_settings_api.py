import requests

BASE_URL = "http://localhost:4000"
LOGIN_URL = f"{BASE_URL}/api/v1/doctor/auth/login"
ME_URL = f"{BASE_URL}/api/v1/doctor/auth/me"
SETTINGS_URL = f"{BASE_URL}/api/v1/doctor/settings"
TIMEOUT = 30


def test_doctor_settings_api():
    # Step 1: Login to get accessToken
    login_payload = {
        "mobileNumber": "+966511111111",
        "password": "Password123"
    }
    login_resp = requests.post(LOGIN_URL, json=login_payload, timeout=TIMEOUT)
    assert login_resp.status_code == 200, f"Login failed: {login_resp.text}"
    login_data = login_resp.json()
    assert "data" in login_data and "accessToken" in login_data["data"], "accessToken missing in login response"
    access_token = login_data["data"]["accessToken"]
    headers = {"Authorization": f"Bearer {access_token}"}

    # Step 2: GET /api/v1/doctor/auth/me to get profileId
    me_resp = requests.get(ME_URL, headers=headers, timeout=TIMEOUT)
    assert me_resp.status_code == 200, f"GET /me failed: {me_resp.text}"
    me_data = me_resp.json()
    assert "data" in me_data and "profileId" in me_data["data"], "profileId missing in /me response"

    # Step 3: GET /api/v1/doctor/settings
    get_settings_resp = requests.get(SETTINGS_URL, headers=headers, timeout=TIMEOUT)
    assert get_settings_resp.status_code == 200, f"GET /settings failed: {get_settings_resp.text}"
    settings_data = get_settings_resp.json()
    assert "data" in settings_data, "No data field in GET settings response"
    current_settings = settings_data["data"]
    assert isinstance(current_settings, dict), "Settings data should be a dictionary"

    # Step 4: Prepare a patch payload to update settings (toggle or update a setting field)
    # Since no schema is provided, try to update a plausible field or else do noop
    patch_payload = current_settings.copy()
    # Example: toggle a boolean setting if exists, else add a dummy key
    # Try "notificationsEnabled" field common in settings, else just add test
    if "notificationsEnabled" in patch_payload and isinstance(patch_payload["notificationsEnabled"], bool):
        patch_payload["notificationsEnabled"] = not patch_payload["notificationsEnabled"]
    else:
        # Add or update a dummy field for test purpose
        patch_payload["testField"] = "testValue"

    # Step 5: PATCH /api/v1/doctor/settings with updated data
    patch_resp = requests.patch(SETTINGS_URL, json=patch_payload, headers=headers, timeout=TIMEOUT)
    assert patch_resp.status_code == 200, f"PATCH /settings failed: {patch_resp.text}"
    patched_data = patch_resp.json()
    assert "data" in patched_data, "No data field in PATCH settings response"

    # Step 6: GET again to confirm patch applied
    get_settings_after_patch_resp = requests.get(SETTINGS_URL, headers=headers, timeout=TIMEOUT)
    assert get_settings_after_patch_resp.status_code == 200, f"GET /settings after patch failed: {get_settings_after_patch_resp.text}"
    settings_after_patch = get_settings_after_patch_resp.json()
    assert "data" in settings_after_patch, "No data field in GET settings after patch"
    updated_settings = settings_after_patch["data"]

    # Validate the patch update reflected in the settings
    if "notificationsEnabled" in current_settings and isinstance(current_settings["notificationsEnabled"], bool):
        assert updated_settings.get("notificationsEnabled") == (not current_settings["notificationsEnabled"]), "notificationsEnabled not updated correctly"
    else:
        assert updated_settings.get("testField") == "testValue", "testField not updated correctly"


test_doctor_settings_api()