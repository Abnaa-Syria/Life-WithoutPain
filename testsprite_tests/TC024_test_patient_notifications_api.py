import requests

BASE_URL = "http://localhost:4000"
LOGIN_ENDPOINT = "/api/v1/patient/auth/login"
NOTIFICATIONS_ENDPOINT = "/api/v1/patient/notifications"


def test_patient_notifications_api():
    timeout = 30
    phone_number = "+966522222222"
    password = "Password123"

    session = requests.Session()

    # Login to get accessToken
    login_payload = {
        "phoneNumber": phone_number,
        "password": password
    }
    login_resp = session.post(f"{BASE_URL}{LOGIN_ENDPOINT}", json=login_payload, timeout=timeout)
    assert login_resp.status_code == 200, f"Login failed: {login_resp.status_code} {login_resp.text}"
    login_data = login_resp.json().get("data")
    assert login_data and "accessToken" in login_data, "No accessToken in login response"
    access_token = login_data["accessToken"]

    headers = {
        "Authorization": f"Bearer {access_token}"
    }

    # GET /api/v1/patient/notifications - fetch notifications list
    get_notifications_resp = session.get(f"{BASE_URL}{NOTIFICATIONS_ENDPOINT}", headers=headers, timeout=timeout)
    assert get_notifications_resp.status_code == 200, f"GET notifications failed: {get_notifications_resp.status_code} {get_notifications_resp.text}"
    notifications_data = get_notifications_resp.json().get("data")
    assert isinstance(notifications_data, list), "Notifications data is not a list"

    # If there are notifications, test PATCH read on a single notification
    if notifications_data:
        notification_id = notifications_data[0].get("id")
        assert notification_id, "Notification has no id"

        patch_read_endpoint = f"{NOTIFICATIONS_ENDPOINT}/{notification_id}/read"
        patch_read_resp = session.patch(f"{BASE_URL}{patch_read_endpoint}", headers=headers, timeout=timeout)
        assert patch_read_resp.status_code == 200, f"PATCH read single notification failed: {patch_read_resp.status_code} {patch_read_resp.text}"

    # PATCH /api/v1/patient/notifications/read-all - mark all notifications as read
    patch_read_all_endpoint = f"{NOTIFICATIONS_ENDPOINT}/read-all"
    patch_read_all_resp = session.patch(f"{BASE_URL}{patch_read_all_endpoint}", headers=headers, timeout=timeout)
    assert patch_read_all_resp.status_code == 200, f"PATCH read-all notifications failed: {patch_read_all_resp.status_code} {patch_read_all_resp.text}"


test_patient_notifications_api()