import sqlite3
import json

db_path = r"C:\Users\Cm\AppData\Roaming\Cursor\User\globalStorage\state.vscdb"
conn = sqlite3.connect(db_path)
cur = conn.cursor()

key = "src.vs.platform.reactivestorage.browser.reactiveStorageServiceImpl.persistentStorage.applicationUser"
cur.execute("SELECT value FROM ItemTable WHERE key = ?", (key,))
row = cur.fetchone()
data = json.loads(row[0])

def find_paths(obj, target_keys, path=""):
    if isinstance(obj, dict):
        for k, v in obj.items():
            p = f"{path}.{k}" if path else k
            if k in target_keys:
                print(f"\n=== {p} ===")
                print(json.dumps(v, indent=2))
            find_paths(v, target_keys, p)
    elif isinstance(obj, list):
        for i, v in enumerate(obj):
            find_paths(v, target_keys, f"{path}[{i}]")

find_paths(data, {"yoloCommandAllowlist", "smartAllowlistDenylist", "yoloCommandDenylist"})

# also search for backend-related strings anywhere
text = json.dumps(data)
for term in ["run backend", "npm run dev", "backend"]:
    idx = 0
    while True:
        idx = text.lower().find(term.lower(), idx)
        if idx == -1:
            break
        print(f"\n--- found '{term}' at {idx} ---")
        print(text[max(0, idx-100):idx+200])
        idx += len(term)

conn.close()
