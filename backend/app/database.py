import sqlite3

def get_connection():
    conn = sqlite3.connect("soldiers.db")
    conn.row_factory = sqlite3.Row
    return conn

def create_tables():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS soldiers (
            id INTEGER PRIMARY KEY,
            name TEXT,
            unit TEXT
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS metrics (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            soldier_id INTEGER,
            day INTEGER,
            heart_rate REAL,
            hrv REAL,
            sleep_hours REAL,
            stress_score REAL,
            activity_level REAL
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS readiness (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            soldier_id INTEGER,
            day INTEGER,
            score REAL,
            anomaly_flag INTEGER,
            reason TEXT,
            cluster TEXT
        )
    """)

    conn.commit()
    conn.close()
    print("✅ Tables created successfully!")

create_tables()