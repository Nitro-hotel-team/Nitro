from app.core.database import engine
from sqlalchemy import text
conn = engine.connect()
res = conn.execute(text("SELECT definition FROM sys.check_constraints WHERE name = 'CK__PHONG__TinhTrang__19DFD96B'")).fetchone()
with open("constraint.txt", "w", encoding="utf-8") as f:
    f.write(res[0])
conn.close()
