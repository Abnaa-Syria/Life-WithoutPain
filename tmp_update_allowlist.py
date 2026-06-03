import sqlite3
import json

DB_PATH = r"C:\Users\Cm\AppData\Roaming\Cursor\User\globalStorage\state.vscdb"
STORAGE_KEY = "src.vs.platform.reactivestorage.browser.reactiveStorageServiceImpl.persistentStorage.applicationUser"

REMOVE_PATTERNS = (
    "run backend",
    "npm run dev",
    "npm run start",
    "cd backend",
    "backend",
)

DENY_ENTRIES = ("run backend", "npm run dev")


def should_remove(entry: str) -> bool:
    lower = entry.lower()
    return any(p in lower for p in REMOVE_PATTERNS)


conn = sqlite3.connect(DB_PATH)
cur = conn.cursor()
cur.execute("SELECT value FROM ItemTable WHERE key = ?", (STORAGE_KEY,))
row = cur.fetchone()
if not row:
    raise SystemExit("Cursor applicationUser storage key not found")

data = json.loads(row[0])
composer = data.setdefault("composerState", {})
allowlist = list(composer.get("yoloCommandAllowlist", []))
denylist = list(composer.get("yoloCommandDenylist", []))

before = list(allowlist)
allowlist = [entry for entry in allowlist if not should_remove(entry)]

for entry in DENY_ENTRIES:
    if entry not in denylist:
        denylist.append(entry)

composer["yoloCommandAllowlist"] = allowlist
composer["yoloCommandDenylist"] = denylist
updated = json.dumps(data, separators=(",", ":"))

cur.execute("UPDATE ItemTable SET value = ? WHERE key = ?", (updated, STORAGE_KEY))
conn.commit()
conn.close()

print("Before:", before)
print("After:", allowlist)
print("Denylist:", denylist)
print("Removed:", [e for e in before if e not in allowlist])
