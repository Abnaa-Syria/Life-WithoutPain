import requests

BASE_URL = "http://localhost:4000"
LOGIN_URL = f"{BASE_URL}/api/v1/patient/auth/login"
DIRECTORIES_URL = f"{BASE_URL}/api/v1/patient/directories"
PHONE_NUMBER = "+966522222222"
PASSWORD = "Password123"
TIMEOUT = 30

def test_patient_directories_api():
    # Step 1: Login to obtain accessToken
    login_payload = {
        "phoneNumber": PHONE_NUMBER,
        "password": PASSWORD
    }
    try:
        login_response = requests.post(LOGIN_URL, json=login_payload, timeout=TIMEOUT)
        assert login_response.status_code == 200, f"Login failed: {login_response.status_code} {login_response.text}"
        login_data = login_response.json()
        access_token = login_data.get("data", {}).get("accessToken")
        assert access_token, "accessToken not found in login response"
    except requests.RequestException as e:
        assert False, f"Exception during login request: {e}"

    # Step 2: Call GET /api/v1/patient/directories with Authorization header
    headers = {
        "Authorization": f"Bearer {access_token}"
    }
    try:
        directories_response = requests.get(DIRECTORIES_URL, headers=headers, timeout=TIMEOUT)
        assert directories_response.status_code == 200, f"GET /directories failed: {directories_response.status_code} {directories_response.text}"
        directories_data = directories_response.json()
        # Assert directories_data is a dict and contains keys expected for directories
        assert isinstance(directories_data, dict), "Response is not a JSON object"
        # Additional optional asserts depending on expected directory structure:
        # For example, check that 'data' key exists and is a list or dict
        assert "data" in directories_data, "'data' key not in response"
    except requests.RequestException as e:
        assert False, f"Exception during directories request: {e}"

test_patient_directories_api()