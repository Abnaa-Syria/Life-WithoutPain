import requests

BASE_URL = "http://localhost:4000"
LOGIN_URL = f"{BASE_URL}/api/v1/patient/auth/login"
SERVICES_URL = f"{BASE_URL}/api/v1/patient/services"

PHONE_NUMBER = "+966522222222"
PASSWORD = "Password123"
TIMEOUT = 30

def test_patient_services_api():
    # Step 1: Login to get accessToken
    login_payload = {
        "phoneNumber": PHONE_NUMBER,
        "password": PASSWORD
    }
    login_resp = requests.post(LOGIN_URL, json=login_payload, timeout=TIMEOUT)
    assert login_resp.status_code == 200, f"Login failed: {login_resp.text}"
    login_data = login_resp.json().get("data")
    assert login_data and "accessToken" in login_data, "accessToken missing in login response"
    access_token = login_data["accessToken"]
    headers = {
        "Authorization": f"Bearer {access_token}"
    }

    # Step 2: GET /api/v1/patient/services
    services_resp = requests.get(SERVICES_URL, headers=headers, timeout=TIMEOUT)
    assert services_resp.status_code == 200, f"Failed to get services: {services_resp.text}"
    services_json = services_resp.json()
    assert "data" in services_json, "Response missing data key for services"
    services_list = services_json["data"]
    assert isinstance(services_list, list), "Services data is not a list"
    assert len(services_list) > 0, "Services list is empty"

    # Step 3: For each service, GET /api/v1/patient/services/:id and verify data
    for service in services_list:
        service_id = service.get("id")
        assert service_id, "Service missing id"
        service_detail_url = f"{SERVICES_URL}/{service_id}"
        detail_resp = requests.get(service_detail_url, headers=headers, timeout=TIMEOUT)

        if detail_resp.status_code == 200:
            detail_json = detail_resp.json()
            assert "data" in detail_json, f"Service detail response missing data for id {service_id}"
            detail_data = detail_json["data"]
            assert detail_data.get("id") == service_id, f"Service detail id mismatch: expected {service_id}, got {detail_data.get('id')}"
        elif detail_resp.status_code == 404:
            # Service might be removed between list and detail call; acceptable
            pass
        else:
            assert False, f"Unexpected status code {detail_resp.status_code} for service id {service_id}"

test_patient_services_api()