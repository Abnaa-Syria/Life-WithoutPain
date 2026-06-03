import sqlite3
import json

db_path = r"C:\Users\Cm\AppData\Roaming\Cursor\User\globalStorage\state.vscdb"
conn = sqlite3.connect(db_path)
cur = conn.cursor()

cur.execute("SELECT key, value FROM ItemTable WHERE key LIKE '%agentData%' OR key LIKE '%terminalExecution%' OR key LIKE '%allow%'")
for key, value in cur.fetchall():
    if not value:
        continue
    print(f"\n=== {key} ===")
    try:
        data = json.loads(value)
        text = json.dumps(data, indent=2)
        if len(text) > 3000:
            for line in text.splitlines():
                if any(x in line.lower() for x in ["allow", "backend", "dev", "run", "deny", "trust"]):
                    print(line)
        else:
            print(text)
    except Exception:
        print(value[:1000])

conn.close()
