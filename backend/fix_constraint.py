from app.core.database import engine
from sqlalchemy import text

def fix_constraint():
    conn = engine.connect()
    try:
        conn.execute(text("ALTER TABLE [PHONG] DROP CONSTRAINT [CK__PHONG__TinhTrang__19DFD96B]"))
        print("Dropped old constraint")
    except Exception as e:
        print("Could not drop constraint:", e)
        
    try:
        # Add a new check constraint that allows "Xóa mềm" as well
        conn.execute(text("ALTER TABLE [PHONG] ADD CONSTRAINT [CK__PHONG__TinhTrang__NEW] CHECK ([TinhTrang] IN (N'Bảo trì', N'Đang sử dụng', N'Đã đặt', N'Còn trống', N'Xóa mềm'))"))
        print("Added new constraint")
    except Exception as e:
        print("Could not add new constraint:", e)

    conn.commit()
    conn.close()

if __name__ == "__main__":
    fix_constraint()
