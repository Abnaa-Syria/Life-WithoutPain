import sqlite3
import json
import re

db_path = r"C:\Users\Cm\AppData\Roaming\Cursor\User\globalStorage\state.vscdb"
conn = sqlite3.connect(db_path)
cur = conn.cursor()

cur.execute("SELECT value FROM ItemTable WHERE key = ?", (
    "src.vs.platform.reactivestorage.browser.reactiveStorageServiceImpl.persistentStorage.applicationUser",
))
text = cur.fetchone()[0]
data = json.loads(text)

# Print full yoloCommandAllowlist and search entire tree for backend-related allowlist entries
allowlist = data["composerState"]["yoloCommandAllowlist"]
print("Current allowlist:", allowlist)

def find_strings(obj, path=""):
    if isinstance(obj, str):
        if any(x in obj.lower() for x in ["run backend", "npm run dev", "npm run", "backend"]):
            if "http" not in obj and "BackendUrl" not in obj and "backendHas" not in obj and "backend_report" not in obj:
                print(f"  {path}: {obj!r}")
    elif isinstance(obj, dict):
        for k, v in obj.items():
            find_strings(v, f"{path}.{k}" if path else k)
    elif isinstance(obj, list):
        for i, v in enumerate(obj):
            find_strings(v, f"{path}[{i}]")

print("\nBackend-related strings in applicationUser storage:")
find_strings(data)

conn.close()
