import requests

BASE_URL = "http://localhost:4000"
LOGIN_ENDPOINT = "/api/v1/doctor/auth/login"
ME_ENDPOINT = "/api/v1/doctor/auth/me"
PATIENTS_ENDPOINT = "/api/v1/doctor/patients"

LOGIN_PAYLOAD = {"mobileNumber": "+966511111111", "password": "Password123"}
TIMEOUT = 30


def test_doctor_patients_api():
    try:
        # Login to get access token
        login_resp = requests.post(
            BASE_URL + LOGIN_ENDPOINT,
            json=LOGIN_PAYLOAD,
            timeout=TIMEOUT,
        )
        assert login_resp.status_code == 200, f"Login failed: {login_resp.text}"
        login_data = login_resp.json()
        access_token = login_data.get("data", {}).get("accessToken")
        assert access_token, "accessToken not found in login response"

        headers = {"Authorization": f"Bearer {access_token}"}

        # Get profile to obtain profileId (verify token and get doctor info)
        me_resp = requests.get(BASE_URL + ME_ENDPOINT, headers=headers, timeout=TIMEOUT)
        assert me_resp.status_code == 200, f"GET /me failed: {me_resp.text}"
        me_data = me_resp.json()
        profile_id = me_data.get("data", {}).get("profileId")
        assert profile_id, "profileId not found in /me response"

        # GET /api/v1/doctor/patients - list patients related to the doctor
        patients_resp = requests.get(BASE_URL + PATIENTS_ENDPOINT, headers=headers, timeout=TIMEOUT)
        assert patients_resp.status_code == 200, f"GET /patients failed: {patients_resp.text}"
        patients_data = patients_resp.json()
        patients_list = patients_data.get("data")
        assert isinstance(patients_list, list), "Expected list in patients data"

        if patients_list:
            # Take first patient id for GET /api/v1/doctor/patients/:id
            patient_id = patients_list[0].get("id") or patients_list[0].get("_id")
            assert patient_id, "Patient ID missing in patients list item"

            patient_detail_resp = requests.get(
                f"{BASE_URL}{PATIENTS_ENDPOINT}/{patient_id}", headers=headers, timeout=TIMEOUT
            )
            assert patient_detail_resp.status_code == 200, f"GET /patients/:id failed: {patient_detail_resp.text}"
            patient_detail_data = patient_detail_resp.json()
            patient_detail = patient_detail_data.get("data")
            assert patient_detail, "No data found in patient detail response"
            assert patient_detail.get("id") == patient_id or patient_detail.get("_id") == patient_id, "Patient ID mismatch"
        else:
            # No patients found, the test passes as list retrieval successful with empty list
            pass

    except requests.RequestException as e:
        assert False, f"RequestException: {str(e)}"


test_doctor_patients_api()