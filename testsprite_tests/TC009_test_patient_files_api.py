import requests
import io

BASE_URL = "http://localhost:4000"
LOGIN_ENDPOINT = "/api/v1/patient/auth/login"
FILES_ENDPOINT = "/api/v1/patient/files"
TIMEOUT = 30

PHONE_NUMBER = "+966522222222"
PASSWORD = "Password123"

def test_patient_files_api():
    session = requests.Session()
    access_token = None
    uploaded_file_id = None

    try:
        # Login to get accessToken
        login_resp = session.post(
            BASE_URL + LOGIN_ENDPOINT,
            json={"phoneNumber": PHONE_NUMBER, "password": PASSWORD},
            timeout=TIMEOUT,
        )
        assert login_resp.status_code == 200, f"Login failed: {login_resp.text}"
        login_data = login_resp.json()
        access_token = login_data.get("data", {}).get("accessToken")
        assert access_token, "Access token missing in login response"

        headers = {"Authorization": f"Bearer {access_token}"}

        # Test GET /api/v1/patient/files - expecting 200 and json list
        get_files_resp = session.get(BASE_URL + FILES_ENDPOINT, headers=headers, timeout=TIMEOUT)
        assert get_files_resp.status_code == 200, f"GET files failed: {get_files_resp.text}"
        files_list = get_files_resp.json()
        assert isinstance(files_list, (list, dict)), "Files response should be list or dict"

        # Prepare a small pdf file content to upload in-memory
        file_content = b"%PDF-1.4\n%Sample PDF content for upload"
        filename = "test_upload.pdf"

        # Test POST /api/v1/patient/files - multipart file upload using in-memory bytes buffer
        file_obj = io.BytesIO(file_content)
        files = {"file": (filename, file_obj, "application/pdf")}
        post_files_resp = session.post(BASE_URL + FILES_ENDPOINT, headers=headers, files=files, timeout=TIMEOUT)
        assert post_files_resp.status_code == 201, f"POST file upload failed: {post_files_resp.text}"
        post_resp_data = post_files_resp.json()
        # Extract the uploaded file id to delete later if possible
        uploaded_file_id = post_resp_data.get("data", {}).get("id") or post_resp_data.get("id")
        assert uploaded_file_id is not None, "Uploaded file id not returned"

    finally:
        # Cleanup uploaded file from server if id known
        if access_token and uploaded_file_id:
            headers = {"Authorization": f"Bearer {access_token}"}
            try:
                # Attempt DELETE if supported - not specified in PRD but attempt to clean
                del_resp = session.delete(f"{BASE_URL}{FILES_ENDPOINT}/{uploaded_file_id}", headers=headers, timeout=TIMEOUT)
                # Accept 200, 204, or 404 as okay for cleanup attempt
                assert del_resp.status_code in (200, 204, 404), f"Unexpected response on delete file: {del_resp.status_code}"
            except Exception:
                pass

test_patient_files_api()
