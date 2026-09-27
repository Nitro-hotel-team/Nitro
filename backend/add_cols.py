from app.core.database import engine
from sqlalchemy import text

def add_cols():
    conn = engine.connect()
    try:
        conn.execute(text("ALTER TABLE [LOAI_PHONG] ADD [SucChuaTreEm] INT DEFAULT 0"))
        conn.execute(text("ALTER TABLE [LOAI_PHONG] ADD [DienTich] INT DEFAULT 25"))
        conn.commit()
        print("Success")
    except Exception as e:
        print("Error:", e)
    finally:
        conn.close()

if __name__ == "__main__":
    add_cols()
