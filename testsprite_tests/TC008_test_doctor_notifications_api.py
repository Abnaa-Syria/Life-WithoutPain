import requests

BASE_URL = "http://localhost:4000"
LOGIN_URL = f"{BASE_URL}/api/v1/doctor/auth/login"
PROFILE_URL = f"{BASE_URL}/api/v1/doctor/auth/me"
NOTIFICATIONS_URL = f"{BASE_URL}/api/v1/doctor/notifications"

LOGIN_PAYLOAD = {
    "mobileNumber": "+966511111111",
    "password": "Password123"
}

TIMEOUT = 30


def test_doctor_notifications_api():
    session = requests.Session()

    # Login to get JWT access token
    try:
        login_resp = session.post(LOGIN_URL, json=LOGIN_PAYLOAD, timeout=TIMEOUT)
        login_resp.raise_for_status()
        access_token = login_resp.json().get("data", {}).get("accessToken")
        assert access_token, "No accessToken found in login response"
    except Exception as e:
        assert False, f"Login failed: {e}"

    headers = {"Authorization": f"Bearer {access_token}"}

    # Get profile to confirm login and get profileId (not necessarily used here but per instructions)
    try:
        profile_resp = session.get(PROFILE_URL, headers=headers, timeout=TIMEOUT)
        profile_resp.raise_for_status()
        profile_data = profile_resp.json().get("data")
        assert profile_data and "profileId" in profile_data, "profileId missing in profile response"
    except Exception as e:
        assert False, f"Fetching profile failed: {e}"

    # GET /api/v1/doctor/notifications
    try:
        get_notifications_resp = session.get(NOTIFICATIONS_URL, headers=headers, timeout=TIMEOUT)
        get_notifications_resp.raise_for_status()
        data = get_notifications_resp.json()
        notifications = data.get("data")
        assert isinstance(notifications, list), "Notifications is not a list"
        if not notifications:
            # No notifications present, test ends here as no :id to read patch
            return
        first_notification = notifications[0]
        notification_id = first_notification.get("id")
        assert notification_id, "Notification id missing"
    except Exception as e:
        assert False, f"Fetching notifications failed: {e}"

    # PATCH /api/v1/doctor/notifications/:id/read
    patch_read_url = f"{NOTIFICATIONS_URL}/{notification_id}/read"
    try:
        patch_resp = session.patch(patch_read_url, headers=headers, timeout=TIMEOUT)
        patch_resp.raise_for_status()
        patch_data = patch_resp.json()
        # Assuming typical response with success or updated notification object
        assert patch_data.get("success", True) or patch_data.get("data"), "Patch read did not succeed"
    except Exception as e:
        assert False, f"Patching notification as read failed: {e}"


test_doctor_notifications_api()