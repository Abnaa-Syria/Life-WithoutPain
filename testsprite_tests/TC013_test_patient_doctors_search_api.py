import requests

BASE_URL = "http://localhost:4000"
LOGIN_ENDPOINT = "/api/v1/patient/auth/login"
DOCTORS_SEARCH_ENDPOINT = "/api/v1/patient/doctors/search"
DOCTOR_DETAIL_ENDPOINT = "/api/v1/patient/doctors/{id}"
DOCTOR_AVAILABILITY_ENDPOINT = "/api/v1/patient/doctors/{id}/availability"

PHONE_NUMBER = "+966522222222"
PASSWORD = "Password123"

def test_patient_doctors_search_api():
    session = requests.Session()
    timeout = 30
    access_token = None

    # Step 1: Login to get access token
    login_url = BASE_URL + LOGIN_ENDPOINT
    login_payload = {
        "phoneNumber": PHONE_NUMBER,
        "password": PASSWORD
    }
    try:
        login_resp = session.post(login_url, json=login_payload, timeout=timeout)
        assert login_resp.status_code == 200, f"Login failed with status {login_resp.status_code}"
        login_data = login_resp.json()
        assert "data" in login_data and "accessToken" in login_data["data"], "Login response missing accessToken"
        access_token = login_data["data"]["accessToken"]
    except requests.RequestException as e:
        assert False, f"Login request failed: {e}"

    headers = {
        "Authorization": f"Bearer {access_token}"
    }

    # Step 2: GET /api/v1/patient/doctors/search - search doctors (no filters)
    try:
        search_url = BASE_URL + DOCTORS_SEARCH_ENDPOINT
        search_resp = session.get(search_url, headers=headers, timeout=timeout)
        assert search_resp.status_code == 200, f"Doctors search failed with status {search_resp.status_code}"
        search_data = search_resp.json()
        assert "data" in search_data, "Doctors search response missing data"
        doctors_list = search_data["data"]
        assert isinstance(doctors_list, list), "Doctors search data is not a list"
        if not doctors_list:
            # No doctors found, end test here
            return
    except requests.RequestException as e:
        assert False, f"Doctors search request failed: {e}"

    # Pick the first doctor's id for further tests
    doctor_id = doctors_list[0].get("id")
    assert doctor_id, "Doctor id missing in search results"

    # Step 3: GET /api/v1/patient/doctors/:id - get doctor details
    try:
        detail_url = BASE_URL + DOCTOR_DETAIL_ENDPOINT.format(id=doctor_id)
        detail_resp = session.get(detail_url, headers=headers, timeout=timeout)
        # According to PRD: can be 200 or 404/403 if not bookable or not found
        # We assert 200 here since we used a valid id from search
        assert detail_resp.status_code == 200, f"Doctor detail failed with status {detail_resp.status_code}"
        detail_data = detail_resp.json()
        assert "data" in detail_data, "Doctor detail response missing data"
        doctor_detail = detail_data["data"]
        assert doctor_detail.get("id") == doctor_id, "Doctor detail id mismatch"
    except requests.RequestException as e:
        assert False, f"Doctor detail request failed: {e}"

    # Step 4: GET /api/v1/patient/doctors/:id/availability - get doctor availability
    try:
        availability_url = BASE_URL + DOCTOR_AVAILABILITY_ENDPOINT.format(id=doctor_id)
        availability_resp = session.get(availability_url, headers=headers, timeout=timeout)
        # Expect 200 with available slots per PRD
        assert availability_resp.status_code == 200, f"Doctor availability failed with status {availability_resp.status_code}"
        availability_data = availability_resp.json()
        assert "data" in availability_data, "Doctor availability response missing data"
        available_slots = availability_data["data"]
        # Adjust assertion: expect data to be dict (likely containing slots list inside)
        assert isinstance(available_slots, dict), "Doctor availability data is not a dict"
    except requests.RequestException as e:
        assert False, f"Doctor availability request failed: {e}"


test_patient_doctors_search_api()
