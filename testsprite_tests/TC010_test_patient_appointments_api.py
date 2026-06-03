import requests
import pytest

BASE_URL = "http://localhost:4000"
LOGIN_URL = f"{BASE_URL}/api/v1/patient/auth/login"
APPOINTMENTS_URL = f"{BASE_URL}/api/v1/patient/appointments"
TIMEOUT = 30

PHONE_NUMBER = "+966522222222"
PASSWORD = "Password123"


def test_patient_appointments_api():
    # Authenticate and get access token
    login_payload = {
        "phoneNumber": PHONE_NUMBER,
        "password": PASSWORD
    }
    login_resp = requests.post(LOGIN_URL, json=login_payload, timeout=TIMEOUT)
    assert login_resp.status_code == 200, f"Login failed: {login_resp.text}"
    login_data = login_resp.json()
    access_token = login_data.get("data", {}).get("accessToken")
    assert access_token, "accessToken missing in login response"
    headers = {
        "Authorization": f"Bearer {access_token}"
    }

    # 1. GET /appointments/upcoming
    upcoming_resp = requests.get(f"{APPOINTMENTS_URL}/upcoming", headers=headers, timeout=TIMEOUT)
    assert upcoming_resp.status_code == 200, f"GET upcoming appointments failed: {upcoming_resp.text}"
    upcoming_data = upcoming_resp.json()
    assert "data" in upcoming_data, "Upcoming appointments response missing data"

    # 2. GET /appointments (list)
    list_resp = requests.get(APPOINTMENTS_URL, headers=headers, timeout=TIMEOUT)
    assert list_resp.status_code == 200, f"GET appointments list failed: {list_resp.text}"
    list_data = list_resp.json()
    assert "data" in list_data, "Appointments list response missing data"
    appointments = list_data["data"]

    # If there is no existing appointment, create one to test GET by id and PATCH cancel
    appointment_id = None
    created_appointment_id = None
    try:
        if not appointments:
            # Find a doctorId and slot for booking personal appointment
            # We'll fetch doctors list and their availability to find a slot to book
            # Because no doctorId info from test or PRD, we'll try to find one
            doctors_search_url = f"{BASE_URL}/api/v1/patient/doctors/search"
            doctors_resp = requests.get(doctors_search_url, headers=headers, timeout=TIMEOUT)
            assert doctors_resp.status_code == 200, f"GET doctors search failed: {doctors_resp.text}"
            doctors_data = doctors_resp.json()
            doctors_list = doctors_data.get("data", [])
            assert doctors_list, "No doctors found to book an appointment"

            doctor_id = None
            slot = None
            # Try to find a doctor with available slots
            for doc in doctors_list:
                doctor_id = doc.get("id")
                if doctor_id:
                    availability_url = f"{BASE_URL}/api/v1/patient/doctors/{doctor_id}/availability"
                    avail_resp = requests.get(availability_url, headers=headers, timeout=TIMEOUT)
                    if avail_resp.status_code == 200:
                        avail_data = avail_resp.json()
                        slots = avail_data.get("data", {}).get("slots", [])
                        if slots:
                            slot = slots[0]
                            break
            assert doctor_id and slot, "No available doctor or slot found for booking"

            book_payload = {
                "doctorId": doctor_id,
                "slot": slot,
                "bookingData": {
                    "reason": "Test booking for automation"
                }
            }
            # Book a personal appointment
            book_resp = requests.post(f"{APPOINTMENTS_URL}/book/personal", json=book_payload, headers=headers, timeout=TIMEOUT)
            assert book_resp.status_code == 201, f"Book personal appointment failed: {book_resp.text}"
            book_data = book_resp.json()
            created_appointment_id = book_data.get("data", {}).get("id")
            assert created_appointment_id, "Created appointment ID missing"
            appointment_id = created_appointment_id
        else:
            appointment_id = appointments[0].get("id")
            assert appointment_id, "Appointment ID missing in list"

        # 3. GET /appointments/:id
        get_by_id_resp = requests.get(f"{APPOINTMENTS_URL}/{appointment_id}", headers=headers, timeout=TIMEOUT)
        assert get_by_id_resp.status_code == 200, f"GET appointment by id failed: {get_by_id_resp.text}"
        appointment_detail = get_by_id_resp.json()
        assert appointment_detail.get("data", {}).get("id") == appointment_id, "Returned appointment ID mismatch"

        # 4. PATCH /appointments/:id/cancel
        patch_cancel_resp = requests.patch(f"{APPOINTMENTS_URL}/{appointment_id}/cancel", headers=headers, timeout=TIMEOUT)
        assert patch_cancel_resp.status_code == 200, f"PATCH cancel appointment failed: {patch_cancel_resp.text}"
        cancel_data = patch_cancel_resp.json()
        assert cancel_data.get("data", {}).get("status") in ["canceled", "cancelled"], "Appointment not marked as canceled"

    finally:
        # Cleanup: delete created appointment if we created one and cancellation did not delete it
        if created_appointment_id:
            # No DELETE endpoint provided for appointments, so no cleanup except cancellation above
            # If API supported delete, here would be cleanup code
            pass


test_patient_appointments_api()