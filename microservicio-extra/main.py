from fastapi import FastAPI, HTTPException
from fastapi.responses import Response
from fastapi.middleware.cors import CORSMiddleware
from prometheus_client import generate_latest, CONTENT_TYPE_LATEST, Counter, Summary
import requests
import sqlite3
from utils.db import init_db, save_city, get_history

app = FastAPI()

# Middleware CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# 📊 Métricas personalizadas
weather_requests_total = Counter(
    "weather_requests_total",
    "Cantidad de consultas al endpoint /weather",
    ["city"]
)

weather_request_duration = Summary(
    "weather_request_duration_seconds",
    "Tiempo de respuesta del endpoint /weather"
)

# 🗃️ Inicializar base de datos
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

@app.on_event("startup")
def startup_event():
    init_db()

# 🧠 Guardar ciudad en el historial
def save_city(city: str):
    conn = sqlite3.connect("weather.db")
    cursor = conn.cursor()
    cursor.execute("INSERT INTO weather_history (city) VALUES (?)", (city,))
    conn.commit()
    conn.close()

# 📋 Obtener historial
def get_history():
    conn = sqlite3.connect("weather.db")
    cursor = conn.cursor()
    cursor.execute("SELECT city, timestamp FROM weather_history ORDER BY timestamp DESC LIMIT 10")
    result = cursor.fetchall()
    conn.close()
    return [{"city": row[0], "timestamp": row[1]} for row in result]

# Rutas
@app.get("/")
def read_root():
    return {"message": "Microservicio extra activo"}

@app.get("/metrics")
def metrics():
    return Response(generate_latest(), media_type=CONTENT_TYPE_LATEST)

@weather_request_duration.time()
@app.get("/weather")
def get_weather(city: str = "Corrientes"):
    print(f"⛅ Consultando clima para: {city}")
    weather_requests_total.labels(city=city).inc()
    save_city(city)  # Guardar la ciudad consultada

    url = f"http://api.weatherapi.com/v1/current.json?key=b4dd4ca6e1904177b2e153653252006&q={city}"

    try:
        res = requests.get(url)
        res.raise_for_status()
        data = res.json()
        return {
            "location": data["location"]["name"],
            "temp_c": data["current"]["temp_c"],
            "condition": data["current"]["condition"]["text"],
            "humidity": data["current"]["humidity"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/weather/history")
def weather_history():
    return get_history()
