import requests

BASE_URL = "http://localhost:4000"
LOGIN_URL = f"{BASE_URL}/api/v1/patient/auth/login"
PAYMENTS_URL = f"{BASE_URL}/api/v1/patient/payments"
TIMEOUT = 30

def test_patient_payments_api():
    # Step 1: Login to get accessToken
    login_payload = {
        "phoneNumber": "+966522222222",
        "password": "Password123"
    }
    try:
        login_resp = requests.post(LOGIN_URL, json=login_payload, timeout=TIMEOUT)
        login_resp.raise_for_status()
        login_data = login_resp.json()
        assert "data" in login_data and "accessToken" in login_data["data"], "Login response missing accessToken"
        access_token = login_data["data"]["accessToken"]
    except Exception as e:
        assert False, f"Login failed: {e}"

    headers = {
        "Authorization": f"Bearer {access_token}"
    }

    # Step 2: GET /api/v1/patient/payments to fetch payment history
    try:
        get_payments_resp = requests.get(PAYMENTS_URL, headers=headers, timeout=TIMEOUT)
        get_payments_resp.raise_for_status()
        payments_data = get_payments_resp.json()
        assert isinstance(payments_data, dict), "Payments response is not a JSON object"
        assert "data" in payments_data, "Payments response missing 'data'"
        payments_list = payments_data["data"]
        assert isinstance(payments_list, list), "Payments 'data' is not a list"
    except Exception as e:
        assert False, f"GET /api/v1/patient/payments failed: {e}"

    # Step 3: If payments exist, GET /api/v1/patient/payments/:id for the first payment's details
    if payments_list:
        payment_id = payments_list[0].get("id")
        assert payment_id is not None, "First payment item missing 'id'"
        payment_detail_url = f"{PAYMENTS_URL}/{payment_id}"
        try:
            payment_detail_resp = requests.get(payment_detail_url, headers=headers, timeout=TIMEOUT)
            payment_detail_resp.raise_for_status()
            payment_detail_data = payment_detail_resp.json()
            assert isinstance(payment_detail_data, dict), "Payment detail response is not a JSON object"
            assert "data" in payment_detail_data, "Payment detail response missing 'data'"
            detail = payment_detail_data["data"]
            assert isinstance(detail, dict), "Payment detail 'data' is not an object"
            assert detail.get("id") == payment_id, "Payment detail id does not match requested id"
        except Exception as e:
            assert False, f"GET /api/v1/patient/payments/:id failed: {e}"
    else:
        # No payments found, test concludes here successfully
        pass

test_patient_payments_api()