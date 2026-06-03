import requests

BASE_URL = "http://localhost:4000"
LOGIN_URL = f"{BASE_URL}/api/v1/auth/login"
DOCTORS_URL = f"{BASE_URL}/api/v1/admin/doctors"
LOGIN_PAYLOAD = {"identifier": "admin@hayabilaalam.com", "password": "Password123"}
TIMEOUT = 30

def test_doctor_verification_api():
    # Login once and reuse token
    try:
        login_resp = requests.post(LOGIN_URL, json=LOGIN_PAYLOAD, timeout=TIMEOUT)
        assert login_resp.status_code == 200, f"Login failed with status {login_resp.status_code}"
        login_data = login_resp.json()
        assert login_data["success"] is True
        access_token = login_data["data"]["accessToken"]
    except Exception as e:
        assert False, f"Login step failed: {e}"

    headers = {"Authorization": f"Bearer {access_token}"}

    # Step 1: List doctors
    try:
        list_resp = requests.get(DOCTORS_URL, headers=headers, timeout=TIMEOUT)
        assert list_resp.status_code == 200
        list_data = list_resp.json()
        assert list_data["success"] is True
        doctors = list_data.get("data")
        assert isinstance(doctors, list) or doctors is None
    except Exception as e:
        assert False, f"Listing doctors failed: {e}"

    # If no doctors exist to approve/reject, we cannot proceed with patch calls
    if not doctors:
        # No doctors to approve or reject, test ends here successfully for list
        return

    # Choose a doctor id to approve/reject (first in list)
    doctor = doctors[0]
    doctor_id = doctor.get("id") or doctor.get("_id")
    assert doctor_id is not None, "Doctor ID missing in the list response"

    # Step 2: Approve doctor verification request
    try:
        approve_url = f"{DOCTORS_URL}/{doctor_id}/approve"
        approve_resp = requests.patch(approve_url, headers=headers, timeout=TIMEOUT)
        assert approve_resp.status_code == 200
        approve_data = approve_resp.json()
        assert approve_data["success"] is True
    except Exception as e:
        assert False, f"Approving doctor failed: {e}"

    # Step 3: Reject doctor verification request
    try:
        reject_url = f"{DOCTORS_URL}/{doctor_id}/reject"
        reject_resp = requests.patch(reject_url, headers=headers, timeout=TIMEOUT)
        assert reject_resp.status_code == 200
        reject_data = reject_resp.json()
        assert reject_data["success"] is True
    except Exception as e:
        assert False, f"Rejecting doctor failed: {e}"

test_doctor_verification_api()