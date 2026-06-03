import sqlite3
import json

db_path = r"C:\Users\Cm\AppData\Roaming\Cursor\User\globalStorage\state.vscdb"
conn = sqlite3.connect(db_path)
cur = conn.cursor()

key = "src.vs.platform.reactivestorage.browser.reactiveStorageServiceImpl.persistentStorage.applicationUser"
cur.execute("SELECT value FROM ItemTable WHERE key = ?", (key,))
data = json.loads(cur.fetchone()[0])

modes = data.get("composerState", {}).get("modes4", [])
print(json.dumps(modes, indent=2))

conn.close()
