"""
Kết nối Database SQL Server bằng SQLAlchemy
"""
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from app.core.config import settings


# Tạo engine kết nối SQL Server
engine = create_engine(
    settings.database_url,
    echo=False,  # Đặt True để debug SQL queries
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20,
)

# Session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


# Base class cho tất cả ORM models
class Base(DeclarativeBase):
    pass


# Dependency injection cho FastAPI
def get_db():
    """Tạo database session cho mỗi request, tự động đóng khi xong."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def test_connection():
    """Kiểm tra kết nối database."""
    try:
        with engine.connect() as conn:
            result = conn.execute(text("SELECT 1"))
            result.fetchone()
        return True
    except Exception as e:
        print(f"❌ Lỗi kết nối database: {e}")
        return False
