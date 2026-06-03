import requests

BASE_URL = "http://localhost:4000"
LOGIN_URL = f"{BASE_URL}/api/v1/doctor/auth/login"
ME_URL = f"{BASE_URL}/api/v1/doctor/auth/me"
SUPPORT_INFO_URL = f"{BASE_URL}/api/v1/doctor/support/info"
SUPPORT_TICKETS_URL = f"{BASE_URL}/api/v1/doctor/support/tickets"

LOGIN_PAYLOAD = {"mobileNumber": "+966511111111", "password": "Password123"}
TIMEOUT = 30


def test_doctor_support_api():
    session = requests.Session()
    access_token = None
    headers = {}

    try:
        # Login to get access token
        login_resp = session.post(LOGIN_URL, json=LOGIN_PAYLOAD, timeout=TIMEOUT)
        assert login_resp.status_code == 200, f"Login failed: {login_resp.text}"
        login_data = login_resp.json()
        access_token = login_data["data"]["accessToken"]
        headers = {"Authorization": f"Bearer {access_token}"}

        # Get doctor profileId to validate authentication works
        me_resp = session.get(ME_URL, headers=headers, timeout=TIMEOUT)
        assert me_resp.status_code == 200, f"GET /me failed: {me_resp.text}"
        me_data = me_resp.json()
        assert "data" in me_data and "profileId" in me_data["data"], "profileId missing in /me response"

        # GET /api/v1/doctor/support/info
        support_info_resp = session.get(SUPPORT_INFO_URL, headers=headers, timeout=TIMEOUT)
        assert support_info_resp.status_code == 200, f"GET support/info failed: {support_info_resp.text}"
        support_info_data = support_info_resp.json()
        # Validate expected keys in support info response (at least data)
        assert "data" in support_info_data, "support info response missing 'data'"

        # GET /api/v1/doctor/support/tickets (list tickets)
        tickets_resp = session.get(SUPPORT_TICKETS_URL, headers=headers, timeout=TIMEOUT)
        assert tickets_resp.status_code == 200, f"GET support/tickets failed: {tickets_resp.text}"
        tickets_data = tickets_resp.json()
        assert "data" in tickets_data, "support tickets response missing 'data'"
        tickets_list = tickets_data["data"]
        assert isinstance(tickets_list, list), "support tickets data should be a list"

        if tickets_list:
            ticket_id = tickets_list[0].get("id")
            if ticket_id:
                # GET /api/v1/doctor/support/tickets/:id (ticket detail)
                ticket_detail_resp = session.get(f"{SUPPORT_TICKETS_URL}/{ticket_id}", headers=headers, timeout=TIMEOUT)
                assert ticket_detail_resp.status_code == 200, f"GET support/tickets/{ticket_id} failed: {ticket_detail_resp.text}"
                ticket_detail_data = ticket_detail_resp.json()
                assert "data" in ticket_detail_data, "ticket detail response missing 'data'"

                # POST /api/v1/doctor/support/tickets/:id/messages (post a reply message)
                message_payload = {"message": "Test reply message from automated test."}
                post_message_resp = session.post(f"{SUPPORT_TICKETS_URL}/{ticket_id}/messages", headers=headers, json=message_payload, timeout=TIMEOUT)
                assert post_message_resp.status_code == 201, f"POST reply message failed: {post_message_resp.text}"
                post_message_data = post_message_resp.json()
                assert "data" in post_message_data, "post reply message response missing 'data'"

    finally:
        session.close()


test_doctor_support_api()