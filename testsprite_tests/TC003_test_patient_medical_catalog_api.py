import requests

BASE_URL = "http://localhost:4000"
LOGIN_ENDPOINT = "/api/v1/patient/auth/login"
CHRONIC_DISEASES_ENDPOINT = "/api/v1/patient/medical-catalog/chronic-diseases"
MEDICATIONS_ENDPOINT = "/api/v1/patient/medical-catalog/medications"

PHONE_NUMBER = "+966522222222"
PASSWORD = "Password123"
TIMEOUT = 30


def test_patient_medical_catalog_api():
    # Step 1: Login to get accessToken
    login_url = BASE_URL + LOGIN_ENDPOINT
    login_payload = {"phoneNumber": PHONE_NUMBER, "password": PASSWORD}
    try:
        login_response = requests.post(login_url, json=login_payload, timeout=TIMEOUT)
        assert login_response.status_code == 200, f"Login failed: {login_response.text}"
        login_data = login_response.json().get("data", {})
        access_token = login_data.get("accessToken")
        assert access_token and isinstance(access_token, str), "accessToken missing in login response"
    except (requests.RequestException, AssertionError) as e:
        raise AssertionError(f"Login request error or assertion failed: {e}")

    headers = {"Authorization": f"Bearer {access_token}"}

    # Step 2: GET /medical-catalog/chronic-diseases
    chronic_url = BASE_URL + CHRONIC_DISEASES_ENDPOINT
    try:
        chronic_response = requests.get(chronic_url, headers=headers, timeout=TIMEOUT)
        assert chronic_response.status_code == 200, f"Failed to get chronic diseases: {chronic_response.text}"
        chronic_data = chronic_response.json()
        assert "data" in chronic_data, "Response missing 'data' field for chronic diseases"
        assert isinstance(chronic_data["data"], list), "Chronic diseases data is not a list"
    except (requests.RequestException, AssertionError) as e:
        raise AssertionError(f"Chronic diseases request error or assertion failed: {e}")

    # Step 3: GET /medical-catalog/medications
    medications_url = BASE_URL + MEDICATIONS_ENDPOINT
    try:
        medications_response = requests.get(medications_url, headers=headers, timeout=TIMEOUT)
        assert medications_response.status_code == 200, f"Failed to get medications: {medications_response.text}"
        medications_data = medications_response.json()
        assert "data" in medications_data, "Response missing 'data' field for medications"
        assert isinstance(medications_data["data"], list), "Medications data is not a list"
    except (requests.RequestException, AssertionError) as e:
        raise AssertionError(f"Medications request error or assertion failed: {e}")


test_patient_medical_catalog_api()