import pytest
import asyncio
import httpx

# URL API Đặt phòng trên ứng dụng của bạn
API_URL = "http://localhost:8000/api/v1/bookings"

async def send_booking_request(client, user_id: int, room_id: int):
    payload = {
        "MaKH": user_id,
        "MaPhong": room_id,
        "NgayNhanPhong": "2026-11-01 14:00:00",
        "NgayTraPhong": "2026-11-03 12:00:00"
    }
    try:
        response = await client.post(API_URL, json=payload, timeout=10.0)
        return response.status_code, response.json()
    except Exception as e:
        return 500, str(e)


@pytest.mark.asyncio
async def test_50_concurrent_bookings_same_room():
    """
    Mô phỏng 50 yêu cầu đặt phòng cùng lúc cho phòng ID = 1
    """
    total_requests = 50
    room_id = 1

    async with httpx.AsyncClient() as client:
        # Tạo danh sách 50 coroutines đại diện cho 50 Virtual Users
        tasks = [
            send_booking_request(client, user_id=(i % 10) + 1, room_id=room_id)
            for i in range(total_requests)
        ]

        # KÍCH HOẠT ĐỒNG THỜI 50 REQUESTS TẠI CÙNG 1 THỜI ĐIỂM
        results = await asyncio.gather(*tasks)

    # Đếm số lượng phản hồi
    success_responses = [r for r in results if r[0] in (200, 201)]
    conflict_responses = [r for r in results if r[0] == 409] # 409 Conflict

    print(f"\n--- KẾT QUẢ TEST TRANH CHẤP ---")
    print(f"✅ Đặt phòng thành công: {len(success_responses)}")
    print(f"❌ Từ chối do đụng lịch: {len(conflict_responses)}")

    # ASSERTIONS (KIỂM TRẢ TIÊU CHÍ PASS/FAIL)
    assert len(success_responses) == 1, f"Lỗi Overbooking! Có {len(success_responses)} đơn đặt thành công."
    assert len(conflict_responses) == total_requests - 1