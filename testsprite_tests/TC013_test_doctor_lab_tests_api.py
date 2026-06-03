import requests
import json

BASE_URL = "http://localhost:4000"
LOGIN_ENDPOINT = "/api/v1/doctor/auth/login"
AUTH_ME_ENDPOINT = "/api/v1/doctor/auth/me"
LAB_TESTS_ENDPOINT = "/api/v1/doctor/lab-tests"

TIMEOUT = 30

def test_doctor_lab_tests_api():
    # Step 1: Login to get JWT accessToken
    login_payload = {
        "mobileNumber": "+966511111111",
        "password": "Password123"
    }
    try:
        login_response = requests.post(
            BASE_URL + LOGIN_ENDPOINT,
            json=login_payload,
            timeout=TIMEOUT
        )
        assert login_response.status_code == 200, f"Login failed: {login_response.text}"
        login_data = login_response.json()
        access_token = login_data["data"]["accessToken"]
        assert access_token, "No accessToken received"
    except Exception as e:
        raise Exception(f"Login request failed: {str(e)}")

    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }

    # Step 2: Get profileId from /me
    try:
        me_response = requests.get(
            BASE_URL + AUTH_ME_ENDPOINT,
            headers=headers,
            timeout=TIMEOUT
        )
        assert me_response.status_code == 200, f"/me request failed: {me_response.text}"
        me_data = me_response.json()
        profile_id = me_data["data"]["profileId"]
        assert profile_id, "No profileId returned"
    except Exception as e:
        raise Exception(f"/me request failed: {str(e)}")

    # Step 3: GET /api/v1/doctor/lab-tests - fetch existing lab tests
    try:
        get_lab_tests_resp = requests.get(
            BASE_URL + LAB_TESTS_ENDPOINT,
            headers=headers,
            timeout=TIMEOUT
        )
        assert get_lab_tests_resp.status_code == 200, f"GET lab-tests failed: {get_lab_tests_resp.text}"
        lab_tests_data = get_lab_tests_resp.json()
        lab_tests_list = lab_tests_data.get("data", [])
    except Exception as e:
        raise Exception(f"GET lab-tests failed: {str(e)}")

    # Step 4: If no lab test exists, create one (POST) - example payload is minimal and generic
    created_lab_test_id = None
    # For POST payload, assume minimal required fields since not specified;
    # here we mock a lab test creation with a sample payload
    # We will create a new lab test for the current profile_id and delete after test.
    try:
        if not lab_tests_list:
            post_payload = {
                "patientProfileId": profile_id,
                "testType": "blood",
                "notes": "Automated test creation for testing"
            }
            post_resp = requests.post(
                BASE_URL + LAB_TESTS_ENDPOINT,
                headers=headers,
                json=post_payload,
                timeout=TIMEOUT
            )
            assert post_resp.status_code == 201, f"POST lab-test failed: {post_resp.text}"
            post_data = post_resp.json()
            created_lab_test_id = post_data["data"]["id"]
        else:
            # Use the first existing lab test id for patch/post results
            created_lab_test_id = lab_tests_list[0]["id"]
        assert created_lab_test_id, "No lab test id available for tests"
    except Exception as e:
        raise Exception(f"POST lab-test failed: {str(e)}")

    # Define URL for specific lab test operations
    lab_test_id_endpoint = f"{LAB_TESTS_ENDPOINT}/{created_lab_test_id}"
    lab_test_results_endpoint = f"{lab_test_id_endpoint}/results"

    try:
        # Step 5: PATCH status of the lab test to 'completed'
        patch_payload = {
            "status": "completed"
        }
        patch_resp = requests.patch(
            BASE_URL + lab_test_id_endpoint,
            headers=headers,
            json=patch_payload,
            timeout=TIMEOUT
        )
        assert patch_resp.status_code == 200, f"PATCH lab-test status failed: {patch_resp.text}"
        patch_data = patch_resp.json()
        assert patch_data["data"]["status"] == "completed", "Lab test status not updated"

        # Step 6: POST results to lab test results endpoint
        # Assume results payload contains at least 'resultData'
        post_results_payload = {
            "resultData": "All values normal",
            "comments": "Automated result upload"
        }
        post_results_resp = requests.post(
            BASE_URL + lab_test_results_endpoint,
            headers=headers,
            json=post_results_payload,
            timeout=TIMEOUT
        )
        assert post_results_resp.status_code in (200, 201), f"POST lab-test results failed: {post_results_resp.text}"
        results_data = post_results_resp.json()
        assert "id" in results_data["data"], "No result id returned"

        # Optional: GET lab test results to confirm
        get_results_resp = requests.get(
            BASE_URL + lab_test_results_endpoint,
            headers=headers,
            timeout=TIMEOUT
        )
        assert get_results_resp.status_code == 200, f"GET lab-test results failed: {get_results_resp.text}"
        get_results_data = get_results_resp.json()
        assert isinstance(get_results_data["data"], list), "Lab test results data not a list"
        assert len(get_results_data["data"]) > 0, "No lab test results found"
    finally:
        # Cleanup: Delete the created lab test if it was created in this test
        if created_lab_test_id and not lab_tests_list:
            try:
                del_resp = requests.delete(
                    BASE_URL + lab_test_id_endpoint,
                    headers=headers,
                    timeout=TIMEOUT
                )
                assert del_resp.status_code in (200, 204), f"Cleanup delete lab-test failed: {del_resp.text}"
            except Exception:
                pass

test_doctor_lab_tests_api()