import requests

BASE_URL = "http://localhost:4000"
LOGIN_URL = f"{BASE_URL}/api/v1/auth/login"
PATIENTS_URL = f"{BASE_URL}/api/v1/admin/patients"
TIMEOUT = 30

def test_patient_management_api():
    # Step 1: Login once to get access token and refresh token
    login_payload = {
        "identifier": "admin@hayabilaalam.com",
        "password": "Password123"
    }
    try:
        login_resp = requests.post(LOGIN_URL, json=login_payload, timeout=TIMEOUT)
        login_resp.raise_for_status()
    except requests.RequestException as e:
        assert False, f"Login request failed: {e}"
    resp_json = login_resp.json()
    assert resp_json.get("success") is True, "Login was not successful"
    data = resp_json.get("data")
    assert data and "accessToken" in data and "refreshToken" in data, "Login response missing tokens"
    access_token = data["accessToken"]
    refresh_token = data["refreshToken"]

    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }

    # Step 2: List patients (GET)
    try:
        list_resp = requests.get(PATIENTS_URL, headers=headers, timeout=TIMEOUT)
        list_resp.raise_for_status()
    except requests.RequestException as e:
        assert False, f"Listing patients failed: {e}"
    patients_data = list_resp.json()
    assert isinstance(patients_data, dict), "Patients list response is not a dictionary"
    # Assuming patients list might be under key 'data' or directly in response, check common pattern:
    assert "data" in patients_data, "Patients list response missing 'data' key"
    patients_list = patients_data["data"]
    assert isinstance(patients_list, list), "Patients data is not a list"

    # Step 3: Create a new patient to ensure we have one to update and delete
    # Patient creation schema unknown from PRD - assuming minimal valid fields
    # But since patient creation endpoint is not provided in PRD/testplan, we will try to create by posting to patients if accepted
    # Because only GET, PUT, DELETE are described for patients, no POST endpoint listed.
    # So create patient is unknown - therefore pick an existing patient or create a dummy patient by other means.
    # Since resource ID is needed and not provided, we'll try to get one from list or fail if none available.

    if not patients_list:
        assert False, "No existing patients found to update/delete"

    patient = patients_list[0]
    patient_id = patient.get("id") or patient.get("_id")
    assert patient_id, "Patient identifier missing in list"

    # Step 4: Update patient information via PUT /api/v1/admin/patients/:id
    # Assume patient has fields like name, email, phone - minimal update to email or phone.
    updated_info = {}
    # Pick fields that are string and toggle or append something to test update.
    # We don't know exact patient schema, so try phone or firstName/lastName fallback
    if "phone" in patient and isinstance(patient["phone"], str):
        updated_info["phone"] = patient["phone"][:-1] + ("0" if patient["phone"][-1] != "0" else "1")
    elif "firstName" in patient and isinstance(patient["firstName"], str):
        updated_info["firstName"] = patient["firstName"] + "Test"
    else:
        # fallback add a new field "notes" if API accepts
        updated_info["notes"] = "Updated by test_patient_management_api"

    update_url = f"{PATIENTS_URL}/{patient_id}"
    try:
        update_resp = requests.put(update_url, headers=headers, json=updated_info, timeout=TIMEOUT)
        update_resp.raise_for_status()
    except requests.RequestException as e:
        assert False, f"Patient update failed: {e}"
    update_json = update_resp.json()
    assert update_json.get("success") is True, "Patient update response unsuccessful"
    updated_patient = update_json.get("data")
    assert updated_patient, "Updated patient data missing in response"

    # Verify update reflects change roughly by checking changed fields presence (best effort)
    for key, val in updated_info.items():
        # Some APIs may not return updated fields directly but we'll try
        if key in updated_patient:
            assert updated_patient[key] == val, f"Patient field '{key}' not updated correctly"

    # Step 5: Delete patient via DELETE /api/v1/admin/patients/:id
    try:
        delete_resp = requests.delete(update_url, headers=headers, timeout=TIMEOUT)
    except requests.RequestException as e:
        assert False, f"Patient delete request failed: {e}"
    # Some APIs return 204 No Content or 200 with JSON body
    assert delete_resp.status_code in (200, 204), f"Unexpected delete status code: {delete_resp.status_code}"
    if delete_resp.status_code == 200:
        try:
            delete_json = delete_resp.json()
            assert delete_json.get("success") is True, "Patient delete response unsuccessful"
        except Exception:
            # If no JSON, pass
            pass

    # Step 6: Verify patient is deleted by checking patient no longer listed
    try:
        list_after_delete_resp = requests.get(PATIENTS_URL, headers=headers, timeout=TIMEOUT)
        list_after_delete_resp.raise_for_status()
    except requests.RequestException as e:
        assert False, f"Listing patients after deletion failed: {e}"
    patients_after_delete = list_after_delete_resp.json().get("data", [])
    # Patient id should not be present any more
    ids_after_delete = [p.get("id") or p.get("_id") for p in patients_after_delete]
    assert patient_id not in ids_after_delete, "Deleted patient still present in patient list"

test_patient_management_api()