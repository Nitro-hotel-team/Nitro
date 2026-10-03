from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import text
from datetime import datetime
from app.core.database import get_db

router = APIRouter(tags=["Health Check"])

@router.get("")
def health_check(db: Session = Depends(get_db)):
    """Kiểm tra trạng thái máy chủ và cơ sở dữ liệu."""
    server_time = datetime.utcnow().isoformat()
    try:
        # Thực thi một câu lệnh SQL siêu nhẹ để kiểm tra kết nối CSDL
        db.execute(text("SELECT 1"))
        return {
            "status": "healthy",
            "server_time": server_time,
            "database": "connected"
        }
    except Exception as e:
        # Báo lỗi 503 Service Unavailable để hệ thống monitor biết
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={
                "status": "unhealthy",
                "server_time": server_time,
                "database": "disconnected",
                "error": str(e)
            }
        )
