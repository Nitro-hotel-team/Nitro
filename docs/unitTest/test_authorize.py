import pytest
import requests

# nhớ thay BASE_URL , CUSTOMER_TOKEN , RECEPTIONIST_TOKEN để chạy unit test
BASE_URL = "https://api.nitrohotel.com/api/v1" 

# Token mô phỏng thu được sau khi đăng nhập
CUSTOMER_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." # Token vai trò Khách hàng
RECEPTIONIST_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." # Token vai trò Lễ tân

class TestRBACSecurity:

    def test_customer_cannot_access_receptionist_checkin_endpoint(self):
        """
        [SEC-01] Khách hàng KHÔNG ĐƯỢC PHÉP gọi API Check-in của Lễ tân
        """
        headers = {
            "Authorization": f"Bearer {CUSTOMER_TOKEN}",
            "Content-Type": "application/json"
        }
        payload = {
            "booking_id": "NTR-260921-0042",
            "room_number": "302"
        }
        
        # Gọi API Endpoint của Lễ tân
        response = requests.post(f"{BASE_URL}/receptionist/check-in", json=payload, headers=headers)
        
        # Kiểm tra HTTP Status phải là 403 Forbidden
        assert response.status_code == 403, f"LỖI BẢO MẬT: Khách hàng vẫn gọi được API Lễ tân! Code trả về: {response.status_code}"

    def test_receptionist_can_access_checkin_endpoint(self):
        """
        [SEC-02] Lễ tân gọi API Check-in thành công
        """
        headers = {
            "Authorization": f"Bearer {RECEPTIONIST_TOKEN}",
            "Content-Type": "application/json"
        }
        payload = {
            "booking_id": "NTR-260921-0042",
            "room_number": "302"
        }
        
        response = requests.post(f"{BASE_URL}/receptionist/check-in", json=payload, headers=headers)
        
        # Trả về 200 OK
        assert response.status_code == 200