import sqlite3
import json

db_path = r"C:\Users\Cm\AppData\Roaming\Cursor\User\globalStorage\state.vscdb"
conn = sqlite3.connect(db_path)
cur = conn.cursor()

cur.execute("SELECT key, value FROM ItemTable")
rows = cur.fetchall()

terms = ["run backend", "npm run dev", "yoloCommandAllowlist", "commandAllowlist", "terminalAllow"]

for key, value in rows:
    if not value:
        continue
    for term in terms:
        if term.lower() in value.lower():
            print(f"\n=== KEY: {key} (matched: {term}) ===")
            try:
                data = json.loads(value)
                text = json.dumps(data, indent=2)
                for line in text.splitlines():
                    if any(t.lower() in line.lower() for t in terms):
                        print(line)
            except Exception:
                idx = value.lower().find(term.lower())
                print(value[max(0, idx-150):idx+300])
            break

conn.close()
