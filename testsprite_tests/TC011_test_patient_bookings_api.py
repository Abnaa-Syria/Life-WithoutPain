import requests

BASE_URL = "http://localhost:4000"
LOGIN_URL = f"{BASE_URL}/api/v1/patient/auth/login"
BOOKINGS_URL = f"{BASE_URL}/api/v1/patient/bookings"
TIMEOUT = 30

def test_patient_bookings_api():
    # Step 1: Login to get accessToken
    login_payload = {
        "phoneNumber": "+966522222222",
        "password": "Password123"
    }
    try:
        login_resp = requests.post(LOGIN_URL, json=login_payload, timeout=TIMEOUT)
        assert login_resp.status_code == 200, f"Login failed with status code {login_resp.status_code}"
        login_data = login_resp.json()
        assert "data" in login_data and "accessToken" in login_data["data"], "accessToken not found in login response"
        access_token = login_data["data"]["accessToken"]

        # Step 2: Use accessToken to call GET /api/v1/patient/bookings
        headers = {
            "Authorization": f"Bearer {access_token}"
        }
        bookings_resp = requests.get(BOOKINGS_URL, headers=headers, timeout=TIMEOUT)
        assert bookings_resp.status_code == 200, f"Bookings API failed with status code {bookings_resp.status_code}"
        bookings_data = bookings_resp.json()
        # bookings_data is expected to contain booking history, we just check basic structure
        assert isinstance(bookings_data, dict) or isinstance(bookings_data, list), "Unexpected bookings response format"

    except requests.RequestException as e:
        assert False, f"RequestException occurred: {str(e)}"

test_patient_bookings_api()