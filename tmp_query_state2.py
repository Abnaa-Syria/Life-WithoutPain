import sqlite3
import json

db_path = r"C:\Users\Cm\AppData\Roaming\Cursor\User\globalStorage\state.vscdb"
conn = sqlite3.connect(db_path)
cur = conn.cursor()

cur.execute("SELECT key, value FROM ItemTable")
rows = cur.fetchall()

keywords = ["allowlist", "allowList", "AllowList", "run backend", "commandAllow", "autoRun", "yolo", "terminalAllow", "approvedCommand", "trustedCommand"]

for key, value in rows:
    if not value:
        continue
    val_lower = value.lower()
    for kw in keywords:
        if kw.lower() in val_lower:
            print(f"\n=== KEY: {key} (matched: {kw}) ===")
            # try to pretty print json
            try:
                data = json.loads(value)
                # search nested
                text = json.dumps(data, indent=2)
                for line in text.splitlines():
                    if any(k.lower() in line.lower() for k in keywords + ["backend", "npm run dev", "4000"]):
                        print(line)
            except Exception:
                idx = val_lower.find(kw.lower())
                start = max(0, idx - 200)
                print(value[start:start+600])
            break

conn.close()
