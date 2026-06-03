import requests

BASE_URL = "http://localhost:4000"
LOGIN_URL = f"{BASE_URL}/api/v1/patient/auth/login"
CONVERSATIONS_URL = f"{BASE_URL}/api/v1/patient/conversations"

PHONE_NUMBER = "+966522222222"
PASSWORD = "Password123"
TIMEOUT = 30

def test_patient_conversations_api():
    # Step 1: Login to get accessToken
    login_payload = {
        "phoneNumber": PHONE_NUMBER,
        "password": PASSWORD
    }

    try:
        login_resp = requests.post(LOGIN_URL, json=login_payload, timeout=TIMEOUT)
        assert login_resp.status_code == 200, f"Login failed: {login_resp.text}"
        login_data = login_resp.json().get("data")
        access_token = login_data.get("accessToken")
        assert access_token, "accessToken is missing in login response"

        headers = {
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json"
        }

        # Step 2: GET /api/v1/patient/conversations (list conversations)
        get_conversations_resp = requests.get(CONVERSATIONS_URL, headers=headers, timeout=TIMEOUT)
        assert get_conversations_resp.status_code == 200, f"Failed to GET conversations: {get_conversations_resp.text}"
        conversations = get_conversations_resp.json().get("data")
        assert isinstance(conversations, list), "Conversations response data is not a list"

        # Step 3: POST /api/v1/patient/conversations to create new conversation
        post_conversation_payload = {"appointmentId": "dummy-appointment-id"}
        post_conversation_resp = requests.post(CONVERSATIONS_URL, headers=headers, json=post_conversation_payload, timeout=TIMEOUT)
        assert post_conversation_resp.status_code == 201, f"Failed to POST conversation: {post_conversation_resp.text}"
        post_conversation_data = post_conversation_resp.json().get("data")
        conversation_id = post_conversation_data.get("id")
        assert conversation_id, "Conversation id missing after creation"

        try:
            messages_url = f"{CONVERSATIONS_URL}/{conversation_id}/messages"

            # Step 4: GET /api/v1/patient/conversations/:id/messages to get messages
            get_messages_resp = requests.get(messages_url, headers=headers, timeout=TIMEOUT)
            assert get_messages_resp.status_code == 200, f"Failed to GET messages: {get_messages_resp.text}"
            messages = get_messages_resp.json().get("data")
            assert isinstance(messages, list), "Messages response data is not a list"

            # Step 5: POST /api/v1/patient/conversations/:id/messages to send a message
            post_message_payload = {
                "content": "Test message from automated test"
            }
            post_message_resp = requests.post(messages_url, headers=headers, json=post_message_payload, timeout=TIMEOUT)
            assert post_message_resp.status_code == 201, f"Failed to POST message: {post_message_resp.text}"
            post_message_data = post_message_resp.json().get("data")
            message_id = post_message_data.get("id")
            assert message_id, "Message id missing after message send"

            # Step 6: PATCH /api/v1/patient/conversations/:id/messages/:messageId/read to mark message read
            patch_read_url = f"{messages_url}/{message_id}/read"
            patch_read_resp = requests.patch(patch_read_url, headers=headers, timeout=TIMEOUT)
            assert patch_read_resp.status_code == 200, f"Failed to PATCH message read: {patch_read_resp.text}"

        finally:
            # Cleanup skipped as no delete endpoint
            pass

    except requests.RequestException as e:
        assert False, f"Request failed with exception: {e}"


test_patient_conversations_api()