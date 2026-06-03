import requests
from requests.exceptions import RequestException

BASE_URL = "http://localhost:4000"
LOGIN_URL = f"{BASE_URL}/api/v1/auth/login"
APPOINTMENTS_URL = f"{BASE_URL}/api/v1/admin/appointments"
TIMEOUT = 30

def test_appointments_management_api():
    # Login once and reuse token
    try:
        login_resp = requests.post(
            LOGIN_URL,
            json={"email": "admin@hayabilaalam.com", "password": "Password123"},
            timeout=TIMEOUT
        )
        assert login_resp.status_code == 200, f"Login failed with status {login_resp.status_code}"
        login_data = login_resp.json()
        assert login_data.get("success") is True, "Login success flag is not true"
        access_token = login_data["data"]["accessToken"]
        headers = {"Authorization": f"Bearer {access_token}"}
    except RequestException as e:
        assert False, f"Login request exception: {e}"
    except (KeyError, AssertionError) as e:
        assert False, f"Login response invalid or missing data: {e}"

    # List appointments
    try:
        list_resp = requests.get(APPOINTMENTS_URL, headers=headers, timeout=TIMEOUT)
        assert list_resp.status_code == 200, f"Listing appointments failed with status {list_resp.status_code}"
        list_data = list_resp.json()
        assert isinstance(list_data, dict), "Listing appointments response is not JSON object"
        assert list_data.get("success") is True, "Listing appointments success flag is not true"
        appointments = list_data.get("data")
        assert isinstance(appointments, list), "Appointments data is not a list"
    except RequestException as e:
        assert False, f"List appointments request exception: {e}"
    except (KeyError, AssertionError) as e:
        assert False, f"List appointments response invalid or missing data: {e}"
    
    if not appointments:
        # No appointments to update, test ends successfully here
        return

    # Use first appointment for update testing
    appointment = appointments[0]
    appointment_id = appointment.get("id") or appointment.get("_id")
    assert appointment_id is not None, "No appointment ID found"

    # Save original status for restore later if possible
    original_status = appointment.get("status")

    new_status = "cancelled" if original_status != "cancelled" else "confirmed"

    # Update appointment status
    status_url = f"{APPOINTMENTS_URL}/{appointment_id}/status"
    try:
        update_resp = requests.patch(
            status_url,
            headers={**headers, "Content-Type": "application/json"},
            json={"status": new_status},
            timeout=TIMEOUT
        )
        assert update_resp.status_code == 200, f"Update appointment status failed with status {update_resp.status_code}"
        update_data = update_resp.json()
        assert update_data.get("success") is True, "Update appointment status success flag is not true"
        updated_appointment = update_data.get("data")
        assert updated_appointment.get("status") == new_status, f"Appointment status not updated, expected {new_status}"
    except RequestException as e:
        assert False, f"Update appointment status request exception: {e}"
    except (KeyError, AssertionError) as e:
        assert False, f"Update appointment status response invalid or missing data: {e}"

test_appointments_management_api()
