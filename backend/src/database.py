import sqlite3
import json
from pathlib import Path
from typing import List, Dict, Any

DB_PATH = Path("shared-data/fraud.db")

print(">>> [DB] Using database at:", DB_PATH.resolve())
JSON_PATH = Path("shared-data/fraud_cases.json")

def init_db():
    """Initialize the database and migrate data if needed"""
    DB_PATH.parent.mkdir(exist_ok=True)

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Create table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS fraud_cases (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            userName TEXT,
            securityIdentifier TEXT,
            cardEnding TEXT,
            status TEXT,
            transactionName TEXT,
            transactionAmount REAL,
            transactionTime TEXT,
            transactionCategory TEXT,
            transactionSource TEXT,
            location TEXT,
            securityQuestion TEXT,
            securityAnswer TEXT
        )
    ''')

    # Check if DB already has entries
    cursor.execute("SELECT COUNT(*) FROM fraud_cases")
    count = cursor.fetchone()[0]

    # Migrate JSON only if DB is empty
    if count == 0 and JSON_PATH.exists():
        try:
            with open(JSON_PATH, 'r') as f:
                cases = json.load(f)

            for case in cases:
                cursor.execute('''
                    INSERT INTO fraud_cases (
                        userName, securityIdentifier, cardEnding, status,
                        transactionName, transactionAmount, transactionTime,
                        transactionCategory, transactionSource, location,
                        securityQuestion, securityAnswer
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    case.get('userName'),
                    case.get('securityIdentifier'),
                    case.get('cardEnding'),
                    case.get('status'),
                    case.get('transactionName'),
                    case.get('transactionAmount'),
                    case.get('transactionTime'),
                    case.get('transactionCategory'),
                    case.get('transactionSource'),
                    case.get('location'),
                    case.get('securityQuestion'),
                    case.get('securityAnswer')
                ))

            conn.commit()
            print(f">>> [DB] Migrated {len(cases)} fraud cases from JSON → SQLite")

        except Exception as e:
            print(f">>> [DB ERROR] Migration failed: {e}")

    conn.close()


def load_fraud_cases() -> List[Dict[str, Any]]:
    """Load all fraud cases from SQLite"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM fraud_cases")
    rows = cursor.fetchall()
    conn.close()

    cases = []
    for row in rows:
        cases.append({
            'id': row[0],
            'userName': row[1],
            'securityIdentifier': row[2],
            'cardEnding': row[3],
            'status': row[4],
            'transactionName': row[5],
            'transactionAmount': row[6],
            'transactionTime': row[7],
            'transactionCategory': row[8],
            'transactionSource': row[9],
            'location': row[10],
            'securityQuestion': row[11],
            'securityAnswer': row[12]
        })
    return cases


def save_fraud_cases(cases: List[Dict[str, Any]]):
    """Overwrite fraud_cases table with updated cases"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    cursor.execute("DELETE FROM fraud_cases")

    for case in cases:
        cursor.execute('''
            INSERT INTO fraud_cases (
                userName, securityIdentifier, cardEnding, status,
                transactionName, transactionAmount, transactionTime,
                transactionCategory, transactionSource, location,
                securityQuestion, securityAnswer
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            case.get('userName'),
            case.get('securityIdentifier'),
            case.get('cardEnding'),
            case.get('status'),
            case.get('transactionName'),
            case.get('transactionAmount'),
            case.get('transactionTime'),
            case.get('transactionCategory'),
            case.get('transactionSource'),
            case.get('location'),
            case.get('securityQuestion'),
            case.get('securityAnswer')
        ))

    conn.commit()
    conn.close()
    print(f">>> [DB] Saved {len(cases)} updated fraud cases.")
