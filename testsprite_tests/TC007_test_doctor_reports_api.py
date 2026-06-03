import requests

BASE_URL = "http://localhost:4000"
LOGIN_URL = f"{BASE_URL}/api/v1/doctor/auth/login"
ME_URL = f"{BASE_URL}/api/v1/doctor/auth/me"
REPORTS_URL = f"{BASE_URL}/api/v1/doctor/reports"


def test_doctor_reports_api():
    timeout = 30
    # Authenticate and get access token
    login_payload = {
        "mobileNumber": "+966511111111",
        "password": "Password123"
    }
    try:
        login_resp = requests.post(LOGIN_URL, json=login_payload, timeout=timeout)
        assert login_resp.status_code == 200, f"Login failed: {login_resp.text}"
        login_data = login_resp.json()
        access_token = login_data.get("data", {}).get("accessToken")
        assert access_token, "No accessToken in login response"
    except requests.RequestException as e:
        assert False, f"Login request failed: {e}"

    headers = {
        "Authorization": f"Bearer {access_token}"
    }

    # Get profile ID
    try:
        me_resp = requests.get(ME_URL, headers=headers, timeout=timeout)
        assert me_resp.status_code == 200, f"GET /me failed: {me_resp.text}"
        me_data = me_resp.json()
        profile_id = me_data.get("data", {}).get("profileId")
        assert profile_id, "No profileId in /me response"
    except requests.RequestException as e:
        assert False, f"GET /me request failed: {e}"

    # Prepare report data for creation
    # Minimal valid report data assumed - as not detailed in PRD, use placeholders
    report_payload = {
        "title": "Test Report Title",
        "description": "Test report description",
        "patientEmail": "patient@example.com",
        "appointmentId": None  # To be omitted or null if unknown
    }

    # Create Report (POST)
    report_id = None
    try:
        post_resp = requests.post(REPORTS_URL, headers={**headers, "Content-Type": "application/json"}, json=report_payload, timeout=timeout)
        assert post_resp.status_code in (200, 201), f"POST report failed: {post_resp.text}"
        post_data = post_resp.json()
        report_id = post_data.get("data", {}).get("id")
        assert report_id, "No report id returned after creation"
    except requests.RequestException as e:
        assert False, f"POST report request failed: {e}"

    # Always attempt to clean up the created report
    try:
        # GET /api/v1/doctor/reports
        try:
            get_list_resp = requests.get(REPORTS_URL, headers=headers, timeout=timeout)
            assert get_list_resp.status_code == 200, f"GET reports list failed: {get_list_resp.text}"
            list_data = get_list_resp.json()
            assert isinstance(list_data.get("data"), list), "Reports list data is not a list"
        except requests.RequestException as e:
            assert False, f"GET reports list request failed: {e}"

        # GET /api/v1/doctor/reports/:id/pdf
        report_pdf_url = f"{REPORTS_URL}/{report_id}/pdf"
        try:
            pdf_resp = requests.get(report_pdf_url, headers=headers, timeout=timeout)
            assert pdf_resp.status_code == 200, f"GET report PDF failed: {pdf_resp.text}"
            content_type = pdf_resp.headers.get("Content-Type", "")
            assert "pdf" in content_type.lower(), f"Report PDF Content-Type invalid: {content_type}"
            assert pdf_resp.content, "Report PDF content is empty"
        except requests.RequestException as e:
            assert False, f"GET report PDF request failed: {e}"

    finally:
        # Cleanup: delete the created report if API supports (no DELETE endpoint specified in PRD for reports)
        # If DELETE endpoint exists, implement it here; else pass
        pass


test_doctor_reports_api()