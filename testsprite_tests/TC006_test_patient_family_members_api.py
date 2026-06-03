import requests

BASE_URL = "http://localhost:4000"
LOGIN_URL = f"{BASE_URL}/api/v1/patient/auth/login"
FAMILY_MEMBERS_URL = f"{BASE_URL}/api/v1/patient/family-members"
TIMEOUT = 30

def test_patient_family_members_api():
    phoneNumber = "+966522222222"
    password = "Password123"

    # Authenticate and get access token
    login_payload = {
        "phoneNumber": phoneNumber,
        "password": password
    }
    try:
        login_resp = requests.post(LOGIN_URL, json=login_payload, timeout=TIMEOUT)
        assert login_resp.status_code == 200, f"Login failed with status {login_resp.status_code}"
        login_data = login_resp.json()
        access_token = login_data.get("data", {}).get("accessToken")
        assert access_token, "No accessToken in login response"
    except requests.RequestException as e:
        assert False, f"Login request failed: {e}"

    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }

    # --- CREATE a family member ---
    new_member_payload = {
        "name": "Test Family Member",
        "relation": "child",
        "birthDate": "2010-01-01"
    }
    try:
        create_resp = requests.post(FAMILY_MEMBERS_URL, json=new_member_payload, headers=headers, timeout=TIMEOUT)
        assert create_resp.status_code == 201, f"Create family member failed with status {create_resp.status_code}"
        created_member = create_resp.json().get("data")
        assert created_member and "id" in created_member, "Created family member response missing id"
        member_id = created_member["id"]

        # --- GET family members list and check if created member is listed ---
        get_list_resp = requests.get(FAMILY_MEMBERS_URL, headers=headers, timeout=TIMEOUT)
        assert get_list_resp.status_code == 200, f"Get family members list failed with status {get_list_resp.status_code}"
        list_data = get_list_resp.json().get("data", [])
        assert any(m["id"] == member_id for m in list_data), "Created family member not found in list"

        # --- UPDATE the family member ---
        updated_payload = {
            "name": "Updated Family Member",
            "relation": "child",
            "birthDate": "2010-01-01"
        }
        update_url = f"{FAMILY_MEMBERS_URL}/{member_id}"
        update_resp = requests.put(update_url, json=updated_payload, headers=headers, timeout=TIMEOUT)
        assert update_resp.status_code == 200, f"Update family member failed with status {update_resp.status_code}"
        updated_data = update_resp.json().get("data")
        assert updated_data.get("name") == updated_payload["name"], "Family member name not updated correctly"

        # --- VERIFY updated member by checking the list ---
        verify_list_resp = requests.get(FAMILY_MEMBERS_URL, headers=headers, timeout=TIMEOUT)
        assert verify_list_resp.status_code == 200, f"Verification list fetch failed with status {verify_list_resp.status_code}"
        verify_list_data = verify_list_resp.json().get("data", [])
        found_member = next((m for m in verify_list_data if m["id"] == member_id), None)
        assert found_member is not None, "Updated family member not found in list"
        assert found_member.get("name") == updated_payload["name"], "Updated family member name mismatch in list"

    finally:
        # --- DELETE the created family member ---
        if 'member_id' in locals():
            try:
                delete_resp = requests.delete(f"{FAMILY_MEMBERS_URL}/{member_id}", headers=headers, timeout=TIMEOUT)
                assert delete_resp.status_code in (200, 204), f"Delete family member failed with status {delete_resp.status_code}"
            except requests.RequestException as e:
                assert False, f"Delete request failed: {e}"

test_patient_family_members_api()
