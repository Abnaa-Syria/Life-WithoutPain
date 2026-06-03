import requests

BASE_URL = "http://localhost:4000"


def test_doctor_profile_api():
    session = requests.Session()
    timeout = 30

    # Login to get JWT token
    login_url = f"{BASE_URL}/api/v1/doctor/auth/login"
    login_payload = {"mobileNumber": "+966511111111", "password": "Password123"}
    try:
        login_resp = session.post(login_url, json=login_payload, timeout=timeout)
        assert login_resp.status_code == 200, f"Login failed: {login_resp.text}"
        login_data = login_resp.json()
        access_token = login_data["data"]["accessToken"]
        assert access_token, "accessToken missing in login response"

        headers = {
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json",
        }

        # Get doctor profileId via /auth/me
        me_url = f"{BASE_URL}/api/v1/doctor/auth/me"
        me_resp = session.get(me_url, headers=headers, timeout=timeout)
        assert me_resp.status_code == 200, f"GET /auth/me failed: {me_resp.text}"
        me_data = me_resp.json()
        profile_id = me_data["data"].get("profileId")
        assert profile_id, "profileId missing in /auth/me response"

        # GET /api/v1/doctor/profile
        profile_url = f"{BASE_URL}/api/v1/doctor/profile"
        get_resp = session.get(profile_url, headers=headers, timeout=timeout)
        assert get_resp.status_code == 200, f"GET /doctor/profile failed: {get_resp.text}"
        profile_data = get_resp.json().get("data")
        assert profile_data is not None, "No profile data returned"

        # Prepare PATCH update data - partial update example (e.g., update a field if present)
        # We'll try to toggle or update the 'language' field if exists, else set it to "en"
        updated_language = "en"
        if "language" in profile_data:
            updated_language = (
                "ar" if profile_data.get("language") == "en" else "en"
            )
        patch_payload = {"language": updated_language}

        # PATCH /api/v1/doctor/profile
        patch_resp = session.patch(profile_url, json=patch_payload, headers=headers, timeout=timeout)
        assert patch_resp.status_code == 200, f"PATCH /doctor/profile failed: {patch_resp.text}"
        patched_data = patch_resp.json().get("data")
        assert patched_data is not None, "No profile data returned after PATCH"
        assert patched_data.get("language") == updated_language, "Language field was not updated as expected"

        # Verify that GET reflects the update
        get_resp2 = session.get(profile_url, headers=headers, timeout=timeout)
        assert get_resp2.status_code == 200, f"GET /doctor/profile after PATCH failed: {get_resp2.text}"
        get_data2 = get_resp2.json().get("data")
        assert get_data2 is not None, "No profile data returned after PATCH"
        assert get_data2.get("language") == updated_language, "Language field not persisted after PATCH"

    finally:
        session.close()


test_doctor_profile_api()