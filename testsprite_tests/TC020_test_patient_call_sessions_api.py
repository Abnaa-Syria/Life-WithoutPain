import requests

BASE_URL = "http://localhost:4000"
LOGIN_URL = f"{BASE_URL}/api/v1/patient/auth/login"
CALL_SESSIONS_BY_APPOINTMENT_URL = f"{BASE_URL}/api/v1/patient/call-sessions/by-appointment"

PHONE_NUMBER = "+966522222222"
PASSWORD = "Password123"
TIMEOUT = 30

def test_patient_call_sessions_api():
    session = requests.Session()

    try:
        # Login to get accessToken
        login_payload = {"phoneNumber": PHONE_NUMBER, "password": PASSWORD}
        login_resp = session.post(LOGIN_URL, json=login_payload, timeout=TIMEOUT)
        assert login_resp.status_code == 200, f"Login failed: {login_resp.text}"
        login_data = login_resp.json()
        access_token = login_data.get("data", {}).get("accessToken")
        assert access_token, "No accessToken found in login response"

        headers = {"Authorization": f"Bearer {access_token}"}

        # Get upcoming appointments to find a confirmed remote appointment with call session
        upcoming_url = f"{BASE_URL}/api/v1/patient/appointments/upcoming"
        upcoming_resp = session.get(upcoming_url, headers=headers, timeout=TIMEOUT)
        assert upcoming_resp.status_code == 200, f"Failed to get upcoming appointments: {upcoming_resp.text}"
        upcoming_appointments = upcoming_resp.json().get("data", [])

        # Find an appointmentId suitable for call session (assume remote/confirmed have sessions)
        appointment_id = None
        for appointment in upcoming_appointments:
            # The PRD doesn't describe exact appointment fields,
            # try to find one with a flag that may indicate remote or confirmed status.
            # Usually, confirmed field might be "status" == "confirmed"
            # and remote check could be "isRemote" or "serviceType" or similar
            # Here we attempt heuristics; if not found, test will skip with fail.
            status = appointment.get("status", "").lower()
            service_type = appointment.get("serviceType", "").lower()
            if status == "confirmed" and service_type in ("remote", "telemedicine", "video"):
                appointment_id = appointment.get("id")
                break
        assert appointment_id, "No confirmed remote appointment found for call session test"

        # Call the call-sessions API by appointmentId
        call_session_url = f"{CALL_SESSIONS_BY_APPOINTMENT_URL}/{appointment_id}"
        call_session_resp = session.get(call_session_url, headers=headers, timeout=TIMEOUT)
        assert call_session_resp.status_code == 200, f"Call session fetch failed: {call_session_resp.text}"

        call_session_data = call_session_resp.json().get("data")
        assert call_session_data is not None, "No call session data returned"

        # Check expected keys in call session data for a valid session (heuristic)
        # Based on description, call session join info should be present
        assert "joinUrl" in call_session_data or "sessionId" in call_session_data or "token" in call_session_data, \
            "Call session join info missing expected keys"

    finally:
        session.close()

test_patient_call_sessions_api()