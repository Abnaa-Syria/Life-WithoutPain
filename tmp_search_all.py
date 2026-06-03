import sqlite3

db_path = r"C:\Users\Cm\AppData\Roaming\Cursor\User\globalStorage\state.vscdb"
conn = sqlite3.connect(db_path)
cur = conn.cursor()

cur.execute("SELECT key FROM ItemTable WHERE value LIKE '%run backend%'")
for row in cur.fetchall():
    print(row[0])

cur.execute("SELECT key FROM ItemTable WHERE value LIKE '%npm run dev%'")
print("\n--- npm run dev ---")
for row in cur.fetchall():
    print(row[0])

# workspace state
ws_db = r"C:\Users\Cm\AppData\Roaming\Cursor\User\workspaceStorage\a3f5d8de629890400cd48a87ec05f5a3\state.vscdb"
import os
if os.path.exists(ws_db):
    print("\n=== workspace state.vscdb ===")
    wconn = sqlite3.connect(ws_db)
    wcur = wconn.cursor()
    wcur.execute("SELECT key, value FROM ItemTable")
    for k, v in wcur.fetchall():
        if v and ("allow" in v.lower() or "backend" in v.lower() or "run dev" in v.lower()):
            print(k, v[:300] if len(v) > 300 else v)
    wconn.close()

conn.close()
