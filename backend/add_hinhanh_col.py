from app.core.database import engine
from sqlalchemy import text

def add_hinhanh_col():
    conn = engine.connect()
    try:
        conn.execute(text("ALTER TABLE [LOAI_PHONG] ADD [HinhAnh] NVARCHAR(MAX) NULL"))
        conn.commit()
        print("Success")
    except Exception as e:
        print("Error")

    conn.close()

if __name__ == "__main__":
    add_hinhanh_col()
