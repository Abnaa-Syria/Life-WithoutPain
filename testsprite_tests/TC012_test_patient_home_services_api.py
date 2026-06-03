import requests
import datetime

BASE_URL = "http://localhost:4000"
LOGIN_URL = f"{BASE_URL}/api/v1/patient/auth/login"
HOME_SERVICES_URL = f"{BASE_URL}/api/v1/patient/home-services"
TIMEOUT = 30

def test_patient_home_services_api():
    # Step 1: Login to get access token
    login_payload = {
        "phoneNumber": "+966522222222",
        "password": "Password123"
    }
    login_resp = requests.post(LOGIN_URL, json=login_payload, timeout=TIMEOUT)
    assert login_resp.status_code == 200, f"Login failed: {login_resp.text}"
    login_data = login_resp.json()
    access_token = login_data.get("data", {}).get("accessToken")
    assert access_token, "No accessToken in login response"
    headers = {"Authorization": f"Bearer {access_token}"}

    # Step 2: GET /api/v1/patient/home-services list
    get_list_resp = requests.get(HOME_SERVICES_URL, headers=headers, timeout=TIMEOUT)
    assert get_list_resp.status_code == 200, f"Failed to get home services list: {get_list_resp.text}"
    list_data = get_list_resp.json()
    assert "data" in list_data, "No data field in home services list response"
    # Save existing home services count
    existing_requests = list_data.get("data", [])

    # Step 3: POST /api/v1/patient/home-services create new service request
    # Prepare dummy payload - serviceId must be a number as per validation
    preferred_date = (datetime.datetime.utcnow() + datetime.timedelta(days=1)).strftime("%Y-%m-%d")
    service_id = 1  # Use numeric service ID

    new_request_payload = {
        "serviceId": service_id,
        "address": "123 Test Street, Riyadh, Saudi Arabia",
        "preferredDate": preferred_date,
        "notes": "Automated test request - please ignore."
    }
    create_resp = requests.post(HOME_SERVICES_URL, headers=headers, json=new_request_payload, timeout=TIMEOUT)
    assert create_resp.status_code == 201, f"Failed to create home service request: {create_resp.text}"
    created_data = create_resp.json()
    created_request = created_data.get("data")
    assert created_request, "No data field in create home service response"
    request_id = created_request.get("id")
    assert request_id, "Created home service request has no id"

    try:
        # Step 4: GET /api/v1/patient/home-services/:id retrieve the created service request
        get_single_resp = requests.get(f"{HOME_SERVICES_URL}/{request_id}", headers=headers, timeout=TIMEOUT)
        assert get_single_resp.status_code == 200, f"Failed to get created home service request: {get_single_resp.text}"
        single_data = get_single_resp.json()
        retrieved_request = single_data.get("data")
        assert retrieved_request, "No data field in get single home service response"
        assert retrieved_request.get("id") == request_id, "Retrieved request ID mismatch"
        assert retrieved_request.get("address") == new_request_payload["address"], "Address mismatch in retrieved request"
        assert retrieved_request.get("notes") == new_request_payload["notes"], "Notes mismatch in retrieved request"

    finally:
        # Cleanup: Cancel the created request if possible or delete if API supports
        cancel_url = f"{HOME_SERVICES_URL}/{request_id}/cancel"
        cancel_resp = requests.patch(cancel_url, headers=headers, timeout=TIMEOUT)
        # Accept 200 success or if already completed (400/409) treat as pass since cleanup intention met
        assert cancel_resp.status_code in (200, 400, 409), f"Failed to cancel home service request cleanup: {cancel_resp.text}"

test_patient_home_services_api()
