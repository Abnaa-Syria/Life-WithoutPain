import requests

BASE_URL = "http://localhost:4000"
LOGIN_URL = f"{BASE_URL}/api/v1/patient/auth/login"
MEDICAL_TIMELINE_URL = f"{BASE_URL}/api/v1/patient/medical-timeline"
TIMEOUT = 30

def test_patient_medical_timeline_api():
    try:
        # Login to get accessToken
        login_payload = {
            "phoneNumber": "+966522222222",
            "password": "Password123"
        }
        login_response = requests.post(LOGIN_URL, json=login_payload, timeout=TIMEOUT)
        assert login_response.status_code == 200, f"Login failed with status {login_response.status_code}"
        login_data = login_response.json()
        assert "data" in login_data and "accessToken" in login_data["data"], "accessToken missing in login response"
        access_token = login_data["data"]["accessToken"]

        # Use access token to get medical timeline
        headers = {
            "Authorization": f"Bearer {access_token}"
        }
        timeline_response = requests.get(MEDICAL_TIMELINE_URL, headers=headers, timeout=TIMEOUT)
        assert timeline_response.status_code == 200, f"Medical timeline request failed with status {timeline_response.status_code}"
        timeline_data = timeline_response.json()
        # Validate timeline_data structure (should be a list or dict containing timeline events)
        assert isinstance(timeline_data, dict) or isinstance(timeline_data, list), "Response is not JSON object or array"
        # Minimal content validation - expecting ordered timeline events under a key or list
        if isinstance(timeline_data, dict):
            # Check that keys exist and at least one event is present
            # Typically expect a key like 'events' or similar, but not specified
            events = timeline_data.get("events") or timeline_data.get("timeline") or timeline_data.get("data")
            if events is not None:
                assert isinstance(events, list), "Timeline events should be a list"
            else:
                # It's OK as long as dict is returned, no strict keys were specified
                pass
        else:
            # It is a list, check not empty or empty list
            assert all(isinstance(event, dict) for event in timeline_data), "Each timeline event should be a dict"
    except requests.RequestException as e:
        assert False, f"Request failed: {e}"

test_patient_medical_timeline_api()