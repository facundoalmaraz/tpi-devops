from fastapi import FastAPI
import sqlite3
from prometheus_client import generate_latest, CONTENT_TYPE_LATEST
from fastapi.responses import Response

app = FastAPI()

@app.get("/")
def read_root():
    conn = sqlite3.connect("app.db")
    return {"message": "SQLite funcionando"}

@app.get("/metrics")
def metrics():
    return Response(generate_latest(), media_type=CONTENT_TYPE_LATEST) 