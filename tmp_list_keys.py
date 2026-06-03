import sqlite3

db_path = r"C:\Users\Cm\AppData\Roaming\Cursor\User\globalStorage\state.vscdb"
conn = sqlite3.connect(db_path)
cur = conn.cursor()

cur.execute("SELECT key FROM ItemTable ORDER BY key")
for row in cur.fetchall():
    k = row[0]
    if any(x in k.lower() for x in ["allow", "deny", "command", "terminal", "yolo", "auto", "trust", "approve", "sandbox"]):
        print(k)

conn.close()
