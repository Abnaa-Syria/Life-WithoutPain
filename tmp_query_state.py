import sqlite3

db_path = r"C:\Users\Cm\AppData\Roaming\Cursor\User\globalStorage\state.vscdb"
conn = sqlite3.connect(db_path)
cur = conn.cursor()

patterns = ["%allow%", "%Allow%", "%command%", "%yolo%", "%terminal%", "%agent%", "%backend%"]
for pattern in patterns:
    cur.execute("SELECT key FROM ItemTable WHERE key LIKE ?", (pattern,))
    rows = cur.fetchall()
    if rows:
        print(f"\n=== keys matching {pattern} ===")
        for row in rows:
            print(row[0])

cur.execute("SELECT key, value FROM ItemTable WHERE value LIKE '%run backend%' OR value LIKE '%allowList%' OR value LIKE '%allowlist%'")
rows = cur.fetchall()
if rows:
    print("\n=== value matches ===")
    for key, value in rows:
        print(key)
        print(value[:500] if value else "")

conn.close()
