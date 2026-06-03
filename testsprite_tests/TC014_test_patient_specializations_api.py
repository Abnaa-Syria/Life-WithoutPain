import requests

BASE_URL = "http://localhost:4000"
LOGIN_URL = f"{BASE_URL}/api/v1/patient/auth/login"
SPECIALIZATIONS_URL = f"{BASE_URL}/api/v1/patient/specializations"

PHONE_NUMBER = "+966522222222"
PASSWORD = "Password123"
REQUEST_TIMEOUT = 30


def test_patient_specializations_api():
    # Login to get accessToken
    login_payload = {
        "phoneNumber": PHONE_NUMBER,
        "password": PASSWORD
    }
    login_response = requests.post(LOGIN_URL, json=login_payload, timeout=REQUEST_TIMEOUT)
    assert login_response.status_code == 200, f"Login failed: {login_response.text}"
    login_data = login_response.json()
    access_token = login_data.get("data", {}).get("accessToken")
    assert access_token, "accessToken not found in login response"

    headers = {
        "Authorization": f"Bearer {access_token}"
    }

    # GET /api/v1/patient/specializations
    resp_specializations = requests.get(SPECIALIZATIONS_URL, headers=headers, timeout=REQUEST_TIMEOUT)
    assert resp_specializations.status_code == 200, f"GET specializations failed: {resp_specializations.text}"
    specializations_data = resp_specializations.json()
    assert isinstance(specializations_data, dict) or isinstance(specializations_data, list), "Invalid specializations response format"

    # Extract list of specializations from response
    # The response format is not explicitly stated, assume standard REST list format with data list or list directly
    specializations_list = []
    if isinstance(specializations_data, dict):
        # Common REST: data key or directly list?
        if "data" in specializations_data and isinstance(specializations_data["data"], list):
            specializations_list = specializations_data["data"]
        else:
            # fallback: try root keys or assume dict is single specialization? We need list for test.
            # If empty or no data, specializations_list empty
            # Force empty list if no recognizable list found
            specializations_list = []
    elif isinstance(specializations_data, list):
        specializations_list = specializations_data

    # If no specializations found, we can't proceed with :id tests meaningfully
    if not specializations_list:
        raise AssertionError("No specializations returned from GET /specializations to test /:id endpoints")

    # Select first specialization ID for testing
    first_specialization = specializations_list[0]
    # Find id key in specialization dict
    specialization_id = None
    if isinstance(first_specialization, dict):
        for key in ("id", "_id", "specializationId"):
            if key in first_specialization:
                specialization_id = first_specialization[key]
                break
    if not specialization_id:
        raise AssertionError("Specialization ID not found in specialization item")

    # GET /api/v1/patient/specializations/:id
    spec_detail_url = f"{SPECIALIZATIONS_URL}/{specialization_id}"
    resp_spec_detail = requests.get(spec_detail_url, headers=headers, timeout=REQUEST_TIMEOUT)
    assert resp_spec_detail.status_code == 200, f"GET specialization detail failed: {resp_spec_detail.text}"
    spec_detail_data = resp_spec_detail.json()
    assert isinstance(spec_detail_data, dict), "Invalid specialization detail response format"

    # Validate that returned specialization detail contains the expected id
    detail_id = None
    if "data" in spec_detail_data and isinstance(spec_detail_data["data"], dict):
        detail_id = spec_detail_data["data"].get("id") or spec_detail_data["data"].get("_id") or spec_detail_data["data"].get("specializationId")
    else:
        detail_id = spec_detail_data.get("id") or spec_detail_data.get("_id") or spec_detail_data.get("specializationId")
    assert detail_id == specialization_id, "Specialization detail ID mismatch"

    # GET /api/v1/patient/specializations/:id/doctors
    spec_doctors_url = f"{spec_detail_url}/doctors"
    resp_spec_doctors = requests.get(spec_doctors_url, headers=headers, timeout=REQUEST_TIMEOUT)
    assert resp_spec_doctors.status_code == 200, f"GET specialization doctors failed: {resp_spec_doctors.text}"
    spec_doctors_data = resp_spec_doctors.json()
    assert isinstance(spec_doctors_data, dict) or isinstance(spec_doctors_data, list), "Invalid specialization doctors response format"


test_patient_specializations_api()