# utils/db.py
import sqlite3

def init_db():
    conn = sqlite3.connect("weather.db")
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS weather_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            city TEXT NOT NULL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    """)
    conn.commit()
    conn.close()

def save_city(city: str):
    conn = sqlite3.connect("weather.db")
    cursor = conn.cursor()
    cursor.execute("INSERT INTO weather_history (city) VALUES (?)", (city,))
    conn.commit()
    conn.close()

def get_history():
    conn = sqlite3.connect("weather.db")
    cursor = conn.cursor()
    cursor.execute("SELECT city, timestamp FROM weather_history ORDER BY timestamp DESC LIMIT 10")
    result = cursor.fetchall()
    conn.close()
    return [{"city": row[0], "timestamp": row[1]} for row in result]
