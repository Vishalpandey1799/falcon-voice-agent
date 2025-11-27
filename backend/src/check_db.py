import sqlite3
from database import init_db, load_fraud_cases

# Initialize database and migrate if needed
init_db()

# Check using the load function
cases = load_fraud_cases()
print(f"Loaded {len(cases)} fraud cases:")
for case in cases:
    print(case)

# Also check directly
conn = sqlite3.connect("shared-data/fraud.db")
cur = conn.cursor()

cur.execute("SELECT * FROM fraud_cases")
rows = cur.fetchall()

# print(f"\nDirect query returned {len(rows)} rows:")
# for r in rows:
#     print(r)

conn.close()
