import sqlite3
import json

db_path = r"C:\Users\Cm\AppData\Roaming\Cursor\User\globalStorage\state.vscdb"
conn = sqlite3.connect(db_path)
cur = conn.cursor()

for key in ["cursor.commands.globalCommands.classic", "cursor.commands.globalCommands.glass"]:
    cur.execute("SELECT value FROM ItemTable WHERE key = ?", (key,))
    row = cur.fetchone()
    if row:
        print(f"\n=== {key} ===")
        try:
            data = json.loads(row[0])
            text = json.dumps(data, indent=2)
            for line in text.splitlines():
                if "backend" in line.lower() or "run" in line.lower():
                    print(line)
        except Exception:
            if "backend" in row[0].lower():
                print(row[0][:2000])

conn.close()
