import sqlite3
import json

db_path = r"C:\Users\Cm\AppData\Roaming\Cursor\User\globalStorage\state.vscdb"
conn = sqlite3.connect(db_path)
cur = conn.cursor()

key = "src.vs.platform.reactivestorage.browser.reactiveStorageServiceImpl.persistentStorage.applicationUser"
cur.execute("SELECT value FROM ItemTable WHERE key = ?", (key,))
data = json.loads(cur.fetchone()[0])

def walk(obj, path=""):
    if isinstance(obj, dict):
        for k, v in obj.items():
            p = f"{path}.{k}" if path else k
            if "allow" in k.lower() or "deny" in k.lower() or "trust" in k.lower() or "auto" in k.lower() and "run" in k.lower():
                if not isinstance(v, (dict, list)) or (isinstance(v, list) and len(v) < 20):
                    print(f"{p}: {json.dumps(v)}")
            walk(v, p)
    elif isinstance(obj, list):
        for i, v in enumerate(obj):
            walk(v, f"{path}[{i}]")

walk(data)

conn.close()
