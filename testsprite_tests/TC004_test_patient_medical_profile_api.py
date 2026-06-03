import requests

BASE_URL = "http://localhost:4000"
LOGIN_URL = f"{BASE_URL}/api/v1/patient/auth/login"
MEDICAL_PROFILE_URL = f"{BASE_URL}/api/v1/patient/medical-profile"
MEDICAL_ATTACHMENTS_URL = f"{MEDICAL_PROFILE_URL}/attachments"
MEDICAL_CATALOG_CHRONIC_DISEASES = f"{BASE_URL}/api/v1/patient/medical-catalog/chronic-diseases"
MEDICAL_CATALOG_MEDICATIONS = f"{BASE_URL}/api/v1/patient/medical-catalog/medications"

PHONE_NUMBER = "+966522222222"
PASSWORD = "Password123"
TIMEOUT = 30


def test_patient_medical_profile_api():
    # Login to get accessToken
    login_payload = {
        "phoneNumber": PHONE_NUMBER,
        "password": PASSWORD
    }
    try:
        login_resp = requests.post(LOGIN_URL, json=login_payload, timeout=TIMEOUT)
        assert login_resp.status_code == 200, f"Login failed with status {login_resp.status_code}"
        login_data = login_resp.json()
        access_token = login_data["data"]["accessToken"]
    except Exception as e:
        assert False, f"Login request failed: {str(e)}"

    headers = {
        "Authorization": f"Bearer {access_token}"
    }

    # Get current medical profile
    try:
        get_profile_resp = requests.get(MEDICAL_PROFILE_URL, headers=headers, timeout=TIMEOUT)
        assert get_profile_resp.status_code == 200, f"GET medical profile failed with status {get_profile_resp.status_code}"
        profile_data = get_profile_resp.json()
        # Validate keys exist in profile data
        assert "data" in profile_data, "No data in medical profile response"
    except Exception as e:
        assert False, f"GET medical profile request failed: {str(e)}"

    # Get chronic diseases catalog and medications catalog to get valid IDs for update
    try:
        chronic_resp = requests.get(MEDICAL_CATALOG_CHRONIC_DISEASES, headers=headers, timeout=TIMEOUT)
        assert chronic_resp.status_code == 200, f"GET chronic diseases catalog failed with status {chronic_resp.status_code}"
        chronic_data = chronic_resp.json()
        chronic_ids = []
        if "data" in chronic_data and isinstance(chronic_data["data"], list):
            chronic_ids = [item.get("id") for item in chronic_data["data"] if "id" in item]
    except Exception as e:
        assert False, f"GET chronic diseases catalog failed: {str(e)}"

    try:
        medication_resp = requests.get(MEDICAL_CATALOG_MEDICATIONS, headers=headers, timeout=TIMEOUT)
        assert medication_resp.status_code == 200, f"GET medications catalog failed with status {medication_resp.status_code}"
        medication_data = medication_resp.json()
        medication_ids = []
        if "data" in medication_data and isinstance(medication_data["data"], list):
            medication_ids = [item.get("id") for item in medication_data["data"] if "id" in item]
    except Exception as e:
        assert False, f"GET medications catalog failed: {str(e)}"

    # Prepare update payload with some chronicDiseaseIds and medicationIds, limit to max 3 each
    update_payload = {}
    if chronic_ids or medication_ids:
        update_payload["chronicDiseaseIds"] = chronic_ids[:3] if chronic_ids else []
        update_payload["medicationIds"] = medication_ids[:3] if medication_ids else []

    # Update medical profile with PUT only if there's something to update
    if update_payload:
        try:
            put_resp = requests.put(MEDICAL_PROFILE_URL, headers={**headers, "Content-Type": "application/json"}, json=update_payload, timeout=TIMEOUT)
            assert put_resp.status_code == 200, f"PUT medical profile failed with status {put_resp.status_code}"
            put_data = put_resp.json()
            assert "data" in put_data, "No data in PUT medical profile response"
            # Check that updated chronicDiseaseIds and medicationIds match those sent
            updated = put_data["data"]
            if "chronicDiseaseIds" in updated:
                assert set(updated["chronicDiseaseIds"]) == set(update_payload["chronicDiseaseIds"]), "ChronicDiseaseIds mismatch after update"
            if "medicationIds" in updated:
                assert set(updated["medicationIds"]) == set(update_payload["medicationIds"]), "MedicationIds mismatch after update"
        except Exception as e:
            assert False, f"PUT medical profile request failed: {str(e)}"

    # Upload a test attachment file (small dummy content)
    try:
        file_content = b"test medical attachment content"
        files = {
            "file": ("test_attachment.txt", file_content, "text/plain")
        }
        post_attach_resp = requests.post(MEDICAL_ATTACHMENTS_URL, headers=headers, files=files, timeout=TIMEOUT)
        assert post_attach_resp.status_code == 201, f"POST attachment failed with status {post_attach_resp.status_code}"
        attach_data = post_attach_resp.json()
        assert "data" in attach_data and "id" in attach_data["data"], "No id in attachment creation response"
        attachment_id = attach_data["data"]["id"]
    except Exception as e:
        assert False, f"POST medical profile attachment failed: {str(e)}"

    # Get attachments list and verify uploaded attachment appears
    try:
        get_attachments_resp = requests.get(MEDICAL_ATTACHMENTS_URL, headers=headers, timeout=TIMEOUT)
        assert get_attachments_resp.status_code == 200, f"GET attachments failed with status {get_attachments_resp.status_code}"
        attachments_list = get_attachments_resp.json()
        assert "data" in attachments_list and isinstance(attachments_list["data"], list), "No data list in attachments response"
        assert any(a.get("id") == attachment_id for a in attachments_list["data"]), "Uploaded attachment not found in list"
    except Exception as e:
        assert False, f"GET medical profile attachments failed: {str(e)}"

    # Cleanup: delete the uploaded attachment if API supports it (not specified in PRD, so skip)

test_patient_medical_profile_api()
