import requests

BASE_URL = "http://localhost:4000"
LOGIN_ENDPOINT = "/api/v1/patient/auth/login"
PROFILE_ENDPOINT = "/api/v1/patient/profile"
PHONE_NUMBER = "+966522222222"
PASSWORD = "Password123"
TIMEOUT = 30

def get_access_token():
    url = f"{BASE_URL}{LOGIN_ENDPOINT}"
    payload = {
        "phoneNumber": PHONE_NUMBER,
        "password": PASSWORD
    }
    try:
        response = requests.post(url, json=payload, timeout=TIMEOUT)
        response.raise_for_status()
        data = response.json()
        access_token = data.get("data", {}).get("accessToken")
        assert access_token is not None, "accessToken not found in login response"
        return access_token
    except requests.RequestException as e:
        raise AssertionError(f"Login request failed: {e}")
    except AssertionError as e:
        raise AssertionError(str(e))

def test_patient_profile_api():
    access_token = get_access_token()
    headers = {"Authorization": f"Bearer {access_token}"}

    # 1. GET /api/v1/patient/profile
    url_get = f"{BASE_URL}{PROFILE_ENDPOINT}"
    try:
        response_get = requests.get(url_get, headers=headers, timeout=TIMEOUT)
        assert response_get.status_code == 200, f"GET profile status code expected 200, got {response_get.status_code}"
        profile_data = response_get.json().get("data", {})
        assert isinstance(profile_data, dict), "Profile GET response is not a JSON object"
    except requests.RequestException as e:
        raise AssertionError(f"GET profile request failed: {e}")

    # Save original profile data to restore later
    original_profile = profile_data.copy()

    # Prepare updated data for PUT and PATCH; update name and language as example
    updated_data = {}
    if "name" in original_profile:
        updated_data["name"] = original_profile["name"] + " Test"
    else:
        updated_data["name"] = "Test Name"
    if "language" in original_profile:
        updated_data["language"] = "en" if original_profile["language"] != "en" else "ar"
    else:
        updated_data["language"] = "en"

    # 2. PUT /api/v1/patient/profile to update profile
    try:
        url_put = f"{BASE_URL}{PROFILE_ENDPOINT}"
        response_put = requests.put(url_put, headers=headers, json=updated_data, timeout=TIMEOUT)
        assert response_put.status_code == 200, f"PUT profile status code expected 200, got {response_put.status_code}"
        updated_profile = response_put.json().get("data", {})
        for key in updated_data:
            assert updated_profile.get(key) == updated_data[key], f"PUT profile update failed for field {key}"
    except requests.RequestException as e:
        raise AssertionError(f"PUT profile request failed: {e}")

    # 3. GET again to verify update
    try:
        response_get2 = requests.get(url_get, headers=headers, timeout=TIMEOUT)
        assert response_get2.status_code == 200, f"Second GET profile status code expected 200, got {response_get2.status_code}"
        profile_data2 = response_get2.json().get("data", {})
        for key in updated_data:
            assert profile_data2.get(key) == updated_data[key], f"GET profile after PUT does not reflect update on field {key}"
    except requests.RequestException as e:
        raise AssertionError(f"Second GET profile request failed: {e}")

    # 4. PATCH /api/v1/patient/profile partial update - toggle language back
    patch_data = {}
    patch_data["language"] = original_profile.get("language", "ar")

    try:
        url_patch = f"{BASE_URL}{PROFILE_ENDPOINT}"
        response_patch = requests.patch(url_patch, headers=headers, json=patch_data, timeout=TIMEOUT)
        assert response_patch.status_code == 200, f"PATCH profile status code expected 200, got {response_patch.status_code}"
        patched_profile = response_patch.json().get("data", {})
        assert patched_profile.get("language") == patch_data["language"], "PATCH profile did not update language correctly"
    except requests.RequestException as e:
        raise AssertionError(f"PATCH profile request failed: {e}")

    # 5. GET again to verify PATCH
    try:
        response_get3 = requests.get(url_get, headers=headers, timeout=TIMEOUT)
        assert response_get3.status_code == 200, f"Third GET profile status code expected 200, got {response_get3.status_code}"
        profile_data3 = response_get3.json().get("data", {})
        assert profile_data3.get("language") == patch_data["language"], "GET profile after PATCH does not reflect language update"
    except requests.RequestException as e:
        raise AssertionError(f"Third GET profile request failed: {e}")

    # Cleanup: revert profile back to original to avoid side effects
    try:
        response_cleanup = requests.put(url_put, headers=headers, json=original_profile, timeout=TIMEOUT)
        assert response_cleanup.status_code == 200, "Cleanup PUT request failed to restore original profile"
    except requests.RequestException as e:
        # Log failure to cleanup but don't fail the test here
        print(f"Cleanup PUT request failed: {e}")

test_patient_profile_api()
