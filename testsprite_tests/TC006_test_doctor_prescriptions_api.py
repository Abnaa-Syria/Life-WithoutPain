import requests

BASE_URL = "http://localhost:4000"
LOGIN_URL = f"{BASE_URL}/api/v1/doctor/auth/login"
ME_URL = f"{BASE_URL}/api/v1/doctor/auth/me"
PRESCRIPTIONS_URL = f"{BASE_URL}/api/v1/doctor/prescriptions"
TIMEOUT = 30


def test_doctor_prescriptions_api():
    # Login to get access token
    login_payload = {"mobileNumber": "+966511111111", "password": "Password123"}
    try:
        login_resp = requests.post(LOGIN_URL, json=login_payload, timeout=TIMEOUT)
        login_resp.raise_for_status()
    except requests.RequestException as e:
        assert False, f"Login request failed: {e}"
    login_data = login_resp.json()
    access_token = login_data.get("data", {}).get("accessToken")
    assert access_token, "Access token not found in login response"

    headers = {"Authorization": f"Bearer {access_token}"}

    # Get profile info to verify authentication and possibly for context if needed
    try:
        me_resp = requests.get(ME_URL, headers=headers, timeout=TIMEOUT)
        me_resp.raise_for_status()
    except requests.RequestException as e:
        assert False, f"Failed to get doctor profile (me): {e}"
    me_data = me_resp.json()
    profile_id = me_data.get("data", {}).get("profileId")
    assert profile_id, "profileId not found in /me response"

    # Prepare prescription creation payload:
    # Since PRD does not provide the exact schema for POST doctor prescriptions,
    # Use a basic example with typical fields that might be required.
    # Usually, prescriptions may require patientId, medications, instructions, etc.
    # Since instructions mention to use Mobile demo appointments between dr.ahmed and patient@example.com,
    # But no patientId or appointmentId is in the input.
    # We will create a minimal plausible payload and rely on API validation.

    # For safety, we first try to get a list of patients or appointments if needed…
    # But not requested here, so minimal required data for prescription.

    # Since no prescription schema was detailed, assume keys: patientEmail, medications, notes
    # We'll try to create a prescription with dummy data

    prescription_payload = {
        "patientEmail": "patient@example.com",
        "medications": [
            {
                "name": "Amoxicillin",
                "dosage": "500mg",
                "frequency": "3 times a day",
                "duration": "7 days"
            }
        ],
        "notes": "Take after meals"
    }

    prescription_id = None
    try:
        # Create prescription
        post_resp = requests.post(PRESCRIPTIONS_URL, json=prescription_payload, headers=headers, timeout=TIMEOUT)
        post_resp.raise_for_status()
        post_data = post_resp.json()
        # Assuming returned data has id field for prescription
        prescription_id = post_data.get("data", {}).get("id")
        assert prescription_id, "Prescription ID not returned after creation"

        # Get the created prescription by ID
        get_url = f"{PRESCRIPTIONS_URL}/{prescription_id}"
        get_resp = requests.get(get_url, headers=headers, timeout=TIMEOUT)
        get_resp.raise_for_status()
        get_data = get_resp.json()
        assert get_data.get("data", {}).get("id") == prescription_id, "Fetched prescription ID mismatch"
        # Optionally verify some fields
        medications = get_data.get("data", {}).get("medications")
        assert medications, "Medications missing in fetched prescription"
        assert medications[0].get("name") == "Amoxicillin", "Medication name mismatch"

        # Get the PDF of the prescription
        pdf_url = f"{get_url}/pdf"
        pdf_resp = requests.get(pdf_url, headers=headers, timeout=TIMEOUT)
        pdf_resp.raise_for_status()
        # Check content type for PDF
        content_type = pdf_resp.headers.get("Content-Type", "")
        assert content_type in ("application/pdf", "application/octet-stream"), f"Unexpected content type for PDF: {content_type}"
        assert pdf_resp.content, "Empty PDF content returned"

    finally:
        # Cleanup: delete prescription if created
        if prescription_id:
            try:
                del_resp = requests.delete(f"{PRESCRIPTIONS_URL}/{prescription_id}", headers=headers, timeout=TIMEOUT)
                # Some APIs respond 200 or 204 for delete, no content required
                assert del_resp.status_code in (200, 204), "Failed to delete prescription in cleanup"
            except requests.RequestException:
                pass


test_doctor_prescriptions_api()