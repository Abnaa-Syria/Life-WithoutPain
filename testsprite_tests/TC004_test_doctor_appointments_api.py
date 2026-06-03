import requests

BASE_URL = "http://localhost:4000"
LOGIN_URL = f"{BASE_URL}/api/v1/doctor/auth/login"
ME_URL = f"{BASE_URL}/api/v1/doctor/auth/me"
APPOINTMENTS_URL = f"{BASE_URL}/api/v1/doctor/appointments"

def test_doctor_appointments_api():
    session = requests.Session()
    try:
        # Step 1: Login to get accessToken
        login_payload = {
            "mobileNumber": "+966511111111",
            "password": "Password123"
        }
        login_resp = session.post(LOGIN_URL, json=login_payload, timeout=30)
        assert login_resp.status_code == 200, f"Login failed: {login_resp.text}"
        login_data = login_resp.json()
        access_token = login_data.get("data", {}).get("accessToken")
        assert access_token, "No accessToken found in login response"
        headers = {"Authorization": f"Bearer {access_token}"}

        # Step 2: Get profileId from /me
        me_resp = session.get(ME_URL, headers=headers, timeout=30)
        assert me_resp.status_code == 200, f"GET /me failed: {me_resp.text}"
        me_data = me_resp.json()
        profile_id = me_data.get("data", {}).get("profileId")
        assert profile_id, "No profileId in /me response"

        # Step 3: GET /api/v1/doctor/appointments - list appointments
        list_resp = session.get(APPOINTMENTS_URL, headers=headers, timeout=30)
        assert list_resp.status_code == 200, f"GET appointments failed: {list_resp.text}"
        list_data = list_resp.json()
        appointments = list_data.get("data")
        assert isinstance(appointments, list), "Appointments list missing or invalid"

        if not appointments:
            # No appointments found; test cannot proceed for GET/:id or PATCH
            print("No appointments found to test GET by ID or PATCH actions.")
            return
        
        # Use first appointment for further tests
        appointment = appointments[0]
        appointment_id = appointment.get("id")
        assert appointment_id, "Appointment ID missing"

        # Step 4: GET by ID /api/v1/doctor/appointments/:id
        get_id_resp = session.get(f"{APPOINTMENTS_URL}/{appointment_id}", headers=headers, timeout=30)
        assert get_id_resp.status_code == 200, f"GET appointment by ID failed: {get_id_resp.text}"
        get_id_data = get_id_resp.json()
        get_appointment = get_id_data.get("data")
        assert get_appointment and get_appointment.get("id") == appointment_id, "GET by ID returned invalid data"

        # Step 5: PATCH appointment confirm
        confirm_payload = {"status": "confirmed"}
        patch_confirm_resp = session.patch(f"{APPOINTMENTS_URL}/{appointment_id}", headers=headers, json=confirm_payload, timeout=30)
        assert patch_confirm_resp.status_code == 200, f"PATCH confirm failed: {patch_confirm_resp.text}"
        confirm_data = patch_confirm_resp.json()
        assert confirm_data.get("data", {}).get("status") == "confirmed", "Confirm status not updated"

        # Step 6: PATCH appointment reject
        reject_payload = {"status": "rejected"}
        patch_reject_resp = session.patch(f"{APPOINTMENTS_URL}/{appointment_id}", headers=headers, json=reject_payload, timeout=30)
        assert patch_reject_resp.status_code == 200, f"PATCH reject failed: {patch_reject_resp.text}"
        reject_data = patch_reject_resp.json()
        assert reject_data.get("data", {}).get("status") == "rejected", "Reject status not updated"

        # Step 7: PATCH appointment cancel
        cancel_payload = {"status": "cancelled"}
        patch_cancel_resp = session.patch(f"{APPOINTMENTS_URL}/{appointment_id}", headers=headers, json=cancel_payload, timeout=30)
        assert patch_cancel_resp.status_code == 200, f"PATCH cancel failed: {patch_cancel_resp.text}"
        cancel_data = patch_cancel_resp.json()
        assert cancel_data.get("data", {}).get("status") == "cancelled", "Cancel status not updated"

    finally:
        session.close()

test_doctor_appointments_api()