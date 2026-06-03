import requests

BASE_URL = "http://localhost:4000"
LOGIN_ENDPOINT = "/api/v1/auth/login"
TIMEOUT = 30

def test_admin_login_api():
    # Valid admin credentials per instructions
    valid_payload = {
        "identifier": "admin@hayabilaalam.com",
        "password": "Password123"
    }
    headers = {
        "Content-Type": "application/json"
    }
    
    # Test valid login
    try:
        response = requests.post(
            BASE_URL + LOGIN_ENDPOINT,
            json=valid_payload,
            headers=headers,
            timeout=TIMEOUT
        )
    except requests.RequestException as e:
        assert False, f"Request failed with exception: {e}"
        
    assert response.status_code == 200, f"Expected 200 OK but got {response.status_code}"
    
    json_response = response.json()
    assert isinstance(json_response, dict), "Response is not a JSON object"
    assert "success" in json_response, "'success' key missing from response"
    assert json_response["success"] is True, "Login success flag is not True for valid credentials"
    assert "data" in json_response, "'data' key missing from response"
    data = json_response["data"]
    assert isinstance(data, dict), "'data' is not a JSON object"
    assert "user" in data, "'user' key missing in data"
    assert "accessToken" in data, "'accessToken' missing in data"
    assert "refreshToken" in data, "'refreshToken' missing in data"
    access_token = data["accessToken"]
    refresh_token = data["refreshToken"]
    assert isinstance(access_token, str) and access_token, "accessToken is not a valid non-empty string"
    assert isinstance(refresh_token, str) and refresh_token, "refreshToken is not a valid non-empty string"
    
    # Test invalid login with wrong password
    invalid_payload_wrong_pass = {
        "identifier": "admin@hayabilaalam.com",
        "password": "WrongPassword123"
    }
    try:
        response_invalid = requests.post(
            BASE_URL + LOGIN_ENDPOINT,
            json=invalid_payload_wrong_pass,
            headers=headers,
            timeout=TIMEOUT
        )
    except requests.RequestException as e:
        assert False, f"Request failed with exception on invalid password test: {e}"
    
    assert response_invalid.status_code == 401, f"Expected 401 Unauthorized for invalid password but got {response_invalid.status_code}"
    
    json_invalid = response_invalid.json()
    assert isinstance(json_invalid, dict), "Invalid login response is not a JSON object"
    assert "success" in json_invalid, "'success' key missing from invalid login response"
    assert json_invalid["success"] is False, "Login success flag is not False for invalid credentials"
    assert json_invalid.get("message") == "Invalid credentials", f"Unexpected error message for invalid credentials: {json_invalid.get('message')}"

    # Test invalid login with wrong identifier
    invalid_payload_wrong_identifier = {
        "identifier": "notanadmin@hayabilaalam.com",
        "password": "Password123"
    }
    try:
        response_invalid_id = requests.post(
            BASE_URL + LOGIN_ENDPOINT,
            json=invalid_payload_wrong_identifier,
            headers=headers,
            timeout=TIMEOUT
        )
    except requests.RequestException as e:
        assert False, f"Request failed with exception on invalid identifier test: {e}"

    assert response_invalid_id.status_code == 401, f"Expected 401 Unauthorized for invalid identifier but got {response_invalid_id.status_code}"

    json_invalid_id = response_invalid_id.json()
    assert isinstance(json_invalid_id, dict), "Invalid login (identifier) response is not a JSON object"
    assert "success" in json_invalid_id, "'success' key missing from invalid login (identifier) response"
    assert json_invalid_id["success"] is False, "Login success flag is not False for invalid identifier"
    assert json_invalid_id.get("message") == "Invalid credentials", f"Unexpected error message for invalid identifier: {json_invalid_id.get('message')}"

test_admin_login_api()