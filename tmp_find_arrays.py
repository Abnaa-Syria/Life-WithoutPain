import sqlite3
import json
import re

db_path = r"C:\Users\Cm\AppData\Roaming\Cursor\User\globalStorage\state.vscdb"
conn = sqlite3.connect(db_path)
cur = conn.cursor()

cur.execute("SELECT key, value FROM ItemTable")
for key, value in cur.fetchall():
    if not value:
        continue
    # find JSON arrays that look like command allowlists
    for m in re.finditer(r'\[(?:[^\[\]]|"[^"]*")*\]', value):
        chunk = m.group(0)
        if any(x in chunk.lower() for x in ["npm run", "backend", "dev", "run backend", "node"]):
            if "BackendUrl" not in chunk and "backend_report" not in chunk:
                print(f"\n{key}:")
                print(chunk[:500])

conn.close()
