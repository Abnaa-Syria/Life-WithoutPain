import requests
import os

BASE_URL = "http://localhost:4000"
LOGIN_ENDPOINT = "/api/v1/patient/auth/login"
INSURANCE_PROVIDERS_ENDPOINT = "/api/v1/patient/insurances/providers"
INSURANCES_ENDPOINT = "/api/v1/patient/insurances"
TIMEOUT = 30

PHONE_NUMBER = "+966522222222"
PASSWORD = "Password123"


def test_patient_insurances_api():
    session = requests.Session()
    access_token = None

    # Login to get accessToken
    login_url = BASE_URL + LOGIN_ENDPOINT
    login_payload = {
        "phoneNumber": PHONE_NUMBER,
        "password": PASSWORD
    }
    try:
        login_resp = session.post(login_url, json=login_payload, timeout=TIMEOUT)
        assert login_resp.status_code == 200, f"Login failed with status {login_resp.status_code}"
        login_data = login_resp.json()
        access_token = login_data.get("data", {}).get("accessToken")
        assert access_token and isinstance(access_token, str), "accessToken missing or invalid in login response"
    except Exception as e:
        assert False, f"Exception during login: {e}"

    headers = {
        "Authorization": f"Bearer {access_token}"
    }

    # GET /insurances/providers
    try:
        providers_resp = session.get(BASE_URL + INSURANCE_PROVIDERS_ENDPOINT, headers=headers, timeout=TIMEOUT)
        assert providers_resp.status_code == 200, f"GET /insurances/providers failed with status {providers_resp.status_code}"
        providers_data = providers_resp.json()
        assert "data" in providers_data, "Missing 'data' in insurance providers response"
        providers_list = providers_data["data"]
        assert isinstance(providers_list, list), "Providers data is not a list"
        assert len(providers_list) > 0, "Insurance providers list is empty"
    except Exception as e:
        assert False, f"Exception during GET /insurances/providers: {e}"

    # We need a valid providerId from the list for POST / PUT
    provider_id = None
    for provider in providers_list:
        if isinstance(provider, dict) and "id" in provider:
            provider_id = provider["id"]
            break
    assert provider_id is not None, "No valid providerId found from insurance providers"

    created_insurance_id = None

    try:
        # GET /api/v1/patient/insurances (list existing insurances)
        get_insurances_resp = session.get(BASE_URL + INSURANCES_ENDPOINT, headers=headers, timeout=TIMEOUT)
        assert get_insurances_resp.status_code == 200, f"GET /insurances failed with status {get_insurances_resp.status_code}"
        insurances_list = get_insurances_resp.json().get("data", [])
        assert isinstance(insurances_list, list), "Insurances list is not a list"

        # POST /api/v1/patient/insurances to create a new insurance
        # Added required 'cardImage' field with dummy base64 string to meet PRD requirement
        post_payload = {
            "providerId": provider_id,
            "policyNumber": "POLICY-" + os.urandom(4).hex(),
            "cardImage": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA"  # truncated dummy
        }
        post_resp = session.post(BASE_URL + INSURANCES_ENDPOINT, json=post_payload, headers=headers, timeout=TIMEOUT)
        assert post_resp.status_code == 201, f"POST /insurances failed with status {post_resp.status_code}"
        post_data = post_resp.json()
        created_insurance_id = post_data.get("data", {}).get("id")
        assert created_insurance_id is not None, "Created insurance has no id"

        # GET the list again should include the new insurance
        get_insurances_resp2 = session.get(BASE_URL + INSURANCES_ENDPOINT, headers=headers, timeout=TIMEOUT)
        assert get_insurances_resp2.status_code == 200
        new_insurances_list = get_insurances_resp2.json().get("data", [])
        ids = [item.get("id") for item in new_insurances_list if "id" in item]
        assert created_insurance_id in ids, "Newly created insurance not found in GET list"

        # PUT /api/v1/patient/insurances/:id to update the created insurance
        put_payload = {
            "policyNumber": "UPDATED-" + os.urandom(4).hex()
            # We only update policyNumber for this test
        }
        put_resp = session.put(f"{BASE_URL}{INSURANCES_ENDPOINT}/{created_insurance_id}", json=put_payload, headers=headers, timeout=TIMEOUT)
        assert put_resp.status_code == 200, f"PUT /insurances/:id failed with status {put_resp.status_code}"
        put_data = put_resp.json().get("data", {})
        updated_policy_number = put_data.get("policyNumber")
        assert updated_policy_number is not None, "PUT response missing policyNumber"
        assert updated_policy_number == put_payload["policyNumber"], "PUT /insurances/:id did not update policyNumber correctly"

    finally:
        # Cleanup: DELETE the created insurance if it exists
        if created_insurance_id:
            try:
                delete_resp = session.delete(f"{BASE_URL}{INSURANCES_ENDPOINT}/{created_insurance_id}", headers=headers, timeout=TIMEOUT)
                assert delete_resp.status_code in (200, 204), f"DELETE /insurances/:id failed with status {delete_resp.status_code}"
            except Exception as e:
                # Log error but do not fail test on cleanup
                print(f"Warning: Exception during cleanup delete insurance: {e}")


test_patient_insurances_api()
