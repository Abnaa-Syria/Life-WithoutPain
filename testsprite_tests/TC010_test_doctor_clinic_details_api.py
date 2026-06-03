import requests

BASE_URL = "http://localhost:4000"
LOGIN_URL = f"{BASE_URL}/api/v1/doctor/auth/login"
ME_URL = f"{BASE_URL}/api/v1/doctor/auth/me"
CLINIC_DETAILS_URL = f"{BASE_URL}/api/v1/doctor/clinic-details"
TIMEOUT = 30

def test_doctor_clinic_details_api():
    # Login to get access token
    login_payload = {
        "mobileNumber": "+966511111111",
        "password": "Password123"
    }
    try:
        login_resp = requests.post(LOGIN_URL, json=login_payload, timeout=TIMEOUT)
        login_resp.raise_for_status()
    except Exception as e:
        assert False, f"Login request failed: {e}"

    login_data = login_resp.json()
    access_token = login_data.get("data", {}).get("accessToken")
    assert access_token, "Access token not found in login response"

    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }

    # Get doctor profile to verify authenticated and get profile info (optional)
    try:
        me_resp = requests.get(ME_URL, headers=headers, timeout=TIMEOUT)
        me_resp.raise_for_status()
    except Exception as e:
        assert False, f"GET /me request failed: {e}"

    me_data = me_resp.json()
    profile_id = me_data.get("data", {}).get("profileId")
    assert profile_id, "profileId not found in /me response"

    # GET current clinic details
    try:
        get_resp = requests.get(CLINIC_DETAILS_URL, headers=headers, timeout=TIMEOUT)
        get_resp.raise_for_status()
    except Exception as e:
        assert False, f"GET /clinic-details request failed: {e}"

    get_data = get_resp.json()
    assert "data" in get_data, "No data field in GET /clinic-details response"

    # Prepare patch payload with some updated clinic details
    # Use existing data as base and modify a field or add sample fields if none present
    clinic_details = get_data.get("data", {})
    patch_payload = {}

    # Common fields to try updating, adapt based on returned data structure
    # Without schema details for clinic-details, use example keys if exist, else dummy
    if clinic_details:
        # Example: update phone or address if existing
        if "phone" in clinic_details:
            patch_payload["phone"] = clinic_details["phone"]
        else:
            patch_payload["phone"] = "+966500000000"

        if "address" in clinic_details:
            patch_payload["address"] = clinic_details["address"]
        else:
            patch_payload["address"] = "Updated Clinic Address"
    else:
        patch_payload = {
            "phone": "+966500000000",
            "address": "Updated Clinic Address"
        }

    try:
        patch_resp = requests.patch(CLINIC_DETAILS_URL, json=patch_payload, headers=headers, timeout=TIMEOUT)
        patch_resp.raise_for_status()
    except Exception as e:
        assert False, f"PATCH /clinic-details request failed: {e}"

    patch_data = patch_resp.json()
    assert "data" in patch_data, "No data field in PATCH /clinic-details response"

    # Confirm changes were saved by GET again
    try:
        confirm_resp = requests.get(CLINIC_DETAILS_URL, headers=headers, timeout=TIMEOUT)
        confirm_resp.raise_for_status()
    except Exception as e:
        assert False, f"GET /clinic-details request (confirm) failed: {e}"

    confirm_data = confirm_resp.json()
    assert "data" in confirm_data, "No data field in confirm GET /clinic-details response"

    # Validate patched fields are reflected in the confirm GET response
    for key, value in patch_payload.items():
        assert confirm_data["data"].get(key) == value, f"Field {key} was not updated correctly"

test_doctor_clinic_details_api()