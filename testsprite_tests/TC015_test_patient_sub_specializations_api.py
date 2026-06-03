import requests

BASE_URL = "http://localhost:4000"
LOGIN_ENDPOINT = "/api/v1/patient/auth/login"
SUB_SPECIALIZATIONS_ENDPOINT = "/api/v1/patient/sub-specializations"
PHONE_NUMBER = "+966522222222"
PASSWORD = "Password123"
TIMEOUT = 30

def test_patient_sub_specializations_api():
    session = requests.Session()
    try:
        # Login to obtain accessToken
        login_resp = session.post(
            BASE_URL + LOGIN_ENDPOINT,
            json={"phoneNumber": PHONE_NUMBER, "password": PASSWORD},
            timeout=TIMEOUT
        )
        assert login_resp.status_code == 200, f"Login failed: {login_resp.status_code} {login_resp.text}"
        login_data = login_resp.json()
        access_token = login_data.get("data", {}).get("accessToken")
        assert access_token, "accessToken not found in login response"

        headers = {"Authorization": f"Bearer {access_token}"}

        # Call GET /api/v1/patient/sub-specializations
        sub_spec_resp = session.get(
            BASE_URL + SUB_SPECIALIZATIONS_ENDPOINT,
            headers=headers,
            timeout=TIMEOUT
        )
        assert sub_spec_resp.status_code == 200, f"Failed to get sub-specializations: {sub_spec_resp.status_code} {sub_spec_resp.text}"

        sub_spec_data = sub_spec_resp.json()
        assert isinstance(sub_spec_data, dict), "Response is not a JSON object"
        assert "data" in sub_spec_data, "Response JSON missing 'data' key"
        assert isinstance(sub_spec_data["data"], list), "'data' should be a list"

    finally:
        session.close()

test_patient_sub_specializations_api()