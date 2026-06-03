import requests

BASE_URL = "http://localhost:4000"
LOGIN_URL = f"{BASE_URL}/api/v1/patient/auth/login"
LAB_TESTS_URL = f"{BASE_URL}/api/v1/patient/lab-tests"
TIMEOUT = 30

def test_patient_lab_tests_api():
    # Step 1: Login to get accessToken
    login_payload = {
        "phoneNumber": "+966522222222",
        "password": "Password123"
    }
    try:
        login_resp = requests.post(LOGIN_URL, json=login_payload, timeout=TIMEOUT)
        assert login_resp.status_code == 200, f"Login failed with status code {login_resp.status_code}"
        login_data = login_resp.json()
        assert "data" in login_data and "accessToken" in login_data["data"], "accessToken missing in login response"
        access_token = login_data["data"]["accessToken"]
    except requests.RequestException as e:
        raise AssertionError(f"Login request failed: {e}")

    headers = {
        "Authorization": f"Bearer {access_token}"
    }

    # Step 2: GET /api/v1/patient/lab-tests
    try:
        lab_tests_resp = requests.get(LAB_TESTS_URL, headers=headers, timeout=TIMEOUT)
        assert lab_tests_resp.status_code == 200, f"Failed to GET lab tests list with status code {lab_tests_resp.status_code}"
        lab_tests_data = lab_tests_resp.json()
        assert "data" in lab_tests_data, "No data field in lab tests list response"
        lab_tests_list = lab_tests_data["data"]
        assert isinstance(lab_tests_list, list), "Lab tests list is not a list"
        if not lab_tests_list:
            print("No lab tests available to test further endpoints.")
            return
    except requests.RequestException as e:
        raise AssertionError(f"GET lab-tests request failed: {e}")

    # Use first lab test id for further API calls
    lab_test_id = lab_tests_list[0].get("id")
    assert lab_test_id, "Lab test id not found in lab tests list"

    # Step 3: GET /api/v1/patient/lab-tests/:id
    try:
        lab_test_detail_resp = requests.get(f"{LAB_TESTS_URL}/{lab_test_id}", headers=headers, timeout=TIMEOUT)
        assert lab_test_detail_resp.status_code == 200, f"Failed to GET lab test detail with status code {lab_test_detail_resp.status_code}"
        lab_test_detail_data = lab_test_detail_resp.json()
        assert "data" in lab_test_detail_data, "No data field in lab test detail response"
        assert lab_test_detail_data["data"].get("id") == lab_test_id, "Lab test id in detail does not match requested id"
    except requests.RequestException as e:
        raise AssertionError(f"GET lab-tests/:id request failed: {e}")

    # Step 4: GET /api/v1/patient/lab-tests/:id/results
    try:
        lab_test_results_resp = requests.get(f"{LAB_TESTS_URL}/{lab_test_id}/results", headers=headers, timeout=TIMEOUT)
        assert lab_test_results_resp.status_code == 200, f"Failed to GET lab test results with status code {lab_test_results_resp.status_code}"
        lab_test_results_data = lab_test_results_resp.json()
        assert "data" in lab_test_results_data, "No data field in lab test results response"
    except requests.RequestException as e:
        raise AssertionError(f"GET lab-tests/:id/results request failed: {e}")

test_patient_lab_tests_api()