import requests

BASE_URL = "http://localhost:4000"
LOGIN_URL = f"{BASE_URL}/api/v1/auth/login"
USERS_URL = f"{BASE_URL}/api/v1/admin/users"


def test_user_management_api():
    session = requests.Session()
    timeout = 30
    # Step 1: Login once and reuse token
    login_payload = {
        "identifier": "admin@hayabilaalam.com",
        "password": "Password123"
    }
    login_resp = session.post(LOGIN_URL, json=login_payload, timeout=timeout)
    assert login_resp.status_code == 200, f"Login failed: {login_resp.text}"
    login_data = login_resp.json()
    assert login_data.get("success") is True, f"Login unsuccessful: {login_data}"
    access_token = login_data.get("data", {}).get("accessToken")
    assert access_token, "No accessToken in login response"

    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json",
        "Accept": "application/json",
    }

    user_id = None

    try:
        # Step 2: List existing users
        resp = session.get(USERS_URL, headers=headers, timeout=timeout)
        assert resp.status_code == 200, f"Listing users failed: {resp.text}"
        users_list = resp.json()
        assert users_list.get("success") is True, f"List users response not success: {users_list}"
        assert isinstance(users_list.get("data"), list), "Users data is not a list"

        # Step 3: Create a new user
        # Prepare new user data (minimal required fields assumed)
        new_user_payload = {
            "name": "Test User",
            "email": "testuser+tc003@hayabilaalam.com",
            "role": "staff",
            "password": "TestUserPass123!"
        }
        create_resp = session.post(USERS_URL, headers=headers, json=new_user_payload, timeout=timeout)
        assert create_resp.status_code == 201, f"Create user failed: {create_resp.text}"
        create_data = create_resp.json()
        assert create_data.get("success") is True, f"Create user response not success: {create_data}"
        created_user = create_data.get("data")
        assert created_user is not None, "No data for created user"
        user_id = created_user.get("id")
        assert user_id is not None, "Created user has no id"

        # Step 4: Update the created user
        updated_payload = {
            "name": "Updated Test User",
            "role": "admin"
        }
        update_url = f"{USERS_URL}/{user_id}"
        update_resp = session.put(update_url, headers=headers, json=updated_payload, timeout=timeout)
        assert update_resp.status_code == 200, f"Update user failed: {update_resp.text}"
        update_data = update_resp.json()
        assert update_data.get("success") is True, f"Update user response not success: {update_data}"
        updated_user = update_data.get("data")
        assert updated_user.get("name") == "Updated Test User", "User name not updated"
        assert updated_user.get("role") == "admin", "User role not updated"

        # Step 5: Delete the created user
        delete_url = f"{USERS_URL}/{user_id}"
        delete_resp = session.delete(delete_url, headers=headers, timeout=timeout)
        assert delete_resp.status_code == 200, f"Delete user failed: {delete_resp.text}"
        delete_data = delete_resp.json()
        assert delete_data.get("success") is True, f"Delete user response not success: {delete_data}"

        # Confirm user deletion by listing users and checking the id not present
        list_resp_after_delete = session.get(USERS_URL, headers=headers, timeout=timeout)
        assert list_resp_after_delete.status_code == 200, f"Listing users after delete failed: {list_resp_after_delete.text}"
        users_after_delete = list_resp_after_delete.json().get("data", [])
        user_ids_after_delete = {user.get("id") for user in users_after_delete if user.get("id") is not None}
        assert user_id not in user_ids_after_delete, "Deleted user still present in user list"

    finally:
        # Cleanup if user still exists (in case deletion failed)
        if user_id is not None:
            try:
                session.delete(f"{USERS_URL}/{user_id}", headers=headers, timeout=timeout)
            except Exception:
                pass


test_user_management_api()