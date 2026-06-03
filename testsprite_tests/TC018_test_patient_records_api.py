import requests

BASE_URL = "http://localhost:4000"
LOGIN_ENDPOINT = "/api/v1/patient/auth/login"
HEADERS = {"Content-Type": "application/json"}
TIMEOUT = 30

def test_patient_records_api():
    login_payload = {
        "phoneNumber": "+966522222222",
        "password": "Password123"
    }
    # Authenticate and get access token
    login_resp = requests.post(f"{BASE_URL}{LOGIN_ENDPOINT}", json=login_payload, timeout=TIMEOUT, headers=HEADERS)
    assert login_resp.status_code == 200, f"Login failed with status {login_resp.status_code}"
    login_data = login_resp.json()
    access_token = login_data.get("data", {}).get("accessToken")
    assert access_token, "Access token not found in login response"
    auth_headers = {"Authorization": f"Bearer {access_token}"}

    # Helper function to get list and then try detail and pdf if applicable
    def test_list_and_details(list_endpoint, detail_sub_endpoints=None):
        # GET list
        list_resp = requests.get(f"{BASE_URL}{list_endpoint}", headers=auth_headers, timeout=TIMEOUT)
        assert list_resp.status_code == 200, f"GET {list_endpoint} failed with status {list_resp.status_code}"
        list_data = list_resp.json().get("data")
        assert isinstance(list_data, list), f"{list_endpoint} list data is not a list"

        if not list_data:
            # No records, skip detail tests
            return

        first_id = None
        if isinstance(list_data[0], dict):
            first_id = list_data[0].get("id") or list_data[0].get("recordId") or list_data[0].get("prescriptionId") or list_data[0].get("xrayId") or list_data[0].get("reportId")
        else:
            first_id = list_data[0]

        if not first_id:
            # No usable ID found, skip detail tests
            return

        if detail_sub_endpoints:
            for sub_ep in detail_sub_endpoints:
                endpoint = sub_ep.format(id=first_id)
                detail_resp = requests.get(f"{BASE_URL}{endpoint}", headers=auth_headers, timeout=TIMEOUT)
                assert detail_resp.status_code == 200, f"GET {endpoint} failed with status {detail_resp.status_code}"

    # Test Prescriptions list, detail, and pdf
    test_list_and_details(
        "/api/v1/patient/prescriptions",
        ["/api/v1/patient/prescriptions/{id}", "/api/v1/patient/prescriptions/{id}/pdf"]
    )

    # Test Reports list, detail, and pdf
    test_list_and_details(
        "/api/v1/patient/reports",
        ["/api/v1/patient/reports/{id}", "/api/v1/patient/reports/{id}/pdf"]
    )

    # Test X-rays list, detail, and pdf (optional detail test if x-rays endpoint returns objects with ids)
    # Also test for x-rays pdf endpoint
    # First get x-rays list
    xrays_resp = requests.get(f"{BASE_URL}/api/v1/patient/x-rays", headers=auth_headers, timeout=TIMEOUT)
    assert xrays_resp.status_code == 200, f"GET /api/v1/patient/x-rays failed with status {xrays_resp.status_code}"
    xrays_list = xrays_resp.json().get("data")
    assert isinstance(xrays_list, list), "/api/v1/patient/x-rays data is not a list"

    if xrays_list:
        first_xray = None
        if isinstance(xrays_list[0], dict):
            first_xray = xrays_list[0].get("id") or xrays_list[0].get("xrayId")
        else:
            first_xray = xrays_list[0]

        if first_xray:
            # GET x-ray detail (GET /api/v1/patient/x-rays/:id)
            xray_detail_resp = requests.get(f"{BASE_URL}/api/v1/patient/x-rays/{first_xray}", headers=auth_headers, timeout=TIMEOUT)
            assert xray_detail_resp.status_code == 200, f"GET /api/v1/patient/x-rays/{first_xray} failed with status {xray_detail_resp.status_code}"

            # GET x-ray pdf (GET /api/v1/patient/x-rays/:id/pdf)
            xray_pdf_resp = requests.get(f"{BASE_URL}/api/v1/patient/x-rays/{first_xray}/pdf", headers=auth_headers, timeout=TIMEOUT)
            assert xray_pdf_resp.status_code == 200, f"GET /api/v1/patient/x-rays/{first_xray}/pdf failed with status {xray_pdf_resp.status_code}"

test_patient_records_api()