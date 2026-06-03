import requests
import os

BASE_URL = "http://localhost:4000"
LOGIN_URL = f"{BASE_URL}/api/v1/auth/login"
SUPPORT_TICKETS_URL = f"{BASE_URL}/api/v1/admin/support/tickets"
TIMEOUT = 30


def login_admin():
    try:
        response = requests.post(
            LOGIN_URL,
            json={"identifier": "admin@hayabilaalam.com", "password": "Password123"},
            timeout=TIMEOUT,
        )
        response.raise_for_status()
        data = response.json()
        assert data["success"] is True
        assert "accessToken" in data["data"]
        access_token = data["data"]["accessToken"]
        refresh_token = data["data"]["refreshToken"]
        return access_token, refresh_token
    except requests.RequestException as e:
        raise AssertionError(f"Login request failed: {e}")
    except (KeyError, AssertionError) as e:
        raise AssertionError(f"Login response validation failed: {e}")


def test_support_tickets_api():
    access_token, refresh_token = login_admin()
    headers = {"Authorization": f"Bearer {access_token}"}

    # Step 1: List support tickets (GET)
    try:
        response = requests.get(SUPPORT_TICKETS_URL, headers=headers, timeout=TIMEOUT)
        response.raise_for_status()
        tickets_data = response.json()
        assert tickets_data.get("success") is True
        tickets = tickets_data.get("data")
        assert isinstance(tickets, list)
    except requests.RequestException as e:
        raise AssertionError(f"Failed to list support tickets: {e}")
    except (AssertionError, KeyError) as e:
        raise AssertionError(f"Response validation failed for listing tickets: {e}")

    # If no ticket exists, create one (simulate by creating a new ticket)
    # The PRD doesn't specify a create ticket endpoint, so we assume at least one ticket exists.
    if not tickets:
        raise AssertionError("No support tickets found to test against.")

    ticket = tickets[0]
    ticket_id = ticket.get("id")
    assert ticket_id, "Ticket ID missing in ticket list."

    # Step 2: Assign ticket to a staff member (PATCH /:id/assign)
    # We will assign the ticket to a staff ID as per expected schema.
    assign_url = f"{SUPPORT_TICKETS_URL}/{ticket_id}/assign"
    assign_payload = {"staffId": "1"}  # Changed from placeholder to "1" to comply with type expectations
    try:
        resp = requests.patch(assign_url, headers={**headers, "Content-Type": "application/json"}, json=assign_payload, timeout=TIMEOUT)
        resp.raise_for_status()
        assign_resp = resp.json()
        assert assign_resp.get("success") is True
    except requests.RequestException as e:
        raise AssertionError(f"Failed to assign ticket {ticket_id}: {e}")
    except (AssertionError, KeyError) as e:
        raise AssertionError(f"Response validation failed for assigning ticket: {e}")

    # Step 3: Reply to ticket with a message and optional attachment (POST /:id/messages)
    messages_url = f"{SUPPORT_TICKETS_URL}/{ticket_id}/messages"
    # To test attachment, use a small text file created on the fly
    file_content = b"Test attachment content"
    filename = "test_attachment.txt"
    try:
        with open(filename, "wb") as f:
            f.write(file_content)

        files = {"attachment": (filename, open(filename, "rb"), "text/plain")}
        data = {"message": "This is a test reply message"}

        resp = requests.post(
            messages_url,
            headers={"Authorization": f"Bearer {access_token}"},
            data=data,
            files=files,
            timeout=TIMEOUT,
        )
        resp.raise_for_status()
        message_resp = resp.json()
        assert message_resp.get("success") is True
        assert "message" in message_resp.get("data", {})
    except requests.RequestException as e:
        raise AssertionError(f"Failed to post reply message to ticket {ticket_id}: {e}")
    except (AssertionError, KeyError) as e:
        raise AssertionError(f"Response validation failed for replying message: {e}")
    finally:
        try:
            files["attachment"][1].close()
        except Exception:
            pass
        if os.path.exists(filename):
            os.remove(filename)

    # Step 4: Change ticket status (PATCH)
    # Assuming status field on ticket can be changed via PATCH, example status "closed" or "open".
    # We try to change status to "closed"
    status_url = f"{SUPPORT_TICKETS_URL}/{ticket_id}/status"
    status_payload = {"status": "closed"}
    try:
        resp = requests.patch(status_url, headers={**headers, "Content-Type": "application/json"}, json=status_payload, timeout=TIMEOUT)
        resp.raise_for_status()
        status_resp = resp.json()
        assert status_resp.get("success") is True
        updated_ticket = status_resp.get("data")
        assert updated_ticket.get("status") == "closed"
    except requests.RequestException as e:
        raise AssertionError(f"Failed to update status for ticket {ticket_id}: {e}")
    except (AssertionError, KeyError) as e:
        raise AssertionError(f"Response validation failed for updating ticket status: {e}")


test_support_tickets_api()
