import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from database import get_connection
from ml_models import predict_readiness

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_status(score):
    if score > 75:
        return "GO"
    elif score >= 50:
        return "CAUTION"
    else:
        return "NO-GO"

@app.get("/")
def home():
    return {"message": "CRIS Backend is running!"}


@app.get("/soldiers")
def get_all_soldiers():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT s.id, s.name, s.unit,
               r.score, r.anomaly_flag, r.reason
        FROM soldiers s
        JOIN readiness r ON s.id = r.soldier_id
        WHERE r.day = (SELECT MAX(day) FROM readiness WHERE soldier_id = s.id)
        ORDER BY s.id
    """)
    rows = cursor.fetchall()
    conn.close()

    return [
        {
            "id": row["id"],
            "name": row["name"],
            "unit": row["unit"],
            "readiness_score": round(row["score"], 2),
            "status": get_status(row["score"]),
            "anomaly_flag": bool(row["anomaly_flag"]),
            "anomaly_reason": row["reason"] or ""
        }
        for row in rows
    ]


@app.get("/soldier/{soldier_id}")
def get_soldier(soldier_id: int):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM soldiers WHERE id = ?", (soldier_id,))
    soldier = cursor.fetchone()
    if not soldier:
        conn.close()
        raise HTTPException(status_code=404, detail="Soldier not found")

    cursor.execute("""
        SELECT m.day, m.heart_rate, m.hrv, m.sleep_hours, m.stress_score, m.activity_level,
               r.score, r.anomaly_flag, r.reason
        FROM metrics m
        JOIN readiness r ON m.soldier_id = r.soldier_id AND m.day = r.day
        WHERE m.soldier_id = ?
        ORDER BY m.day
    """, (soldier_id,))
    history_rows = cursor.fetchall()
    conn.close()

    history = [
        {
            "day": row["day"],
            "heart_rate": round(row["heart_rate"], 2),
            "hrv": round(row["hrv"], 2),
            "sleep_hours": round(row["sleep_hours"], 2),
            "stress_score": round(row["stress_score"], 2),
            "activity_level": round(row["activity_level"], 2),
            "readiness_score": round(row["score"], 2),
            "anomaly_flag": bool(row["anomaly_flag"]),
            "anomaly_reason": row["reason"] or ""
        }
        for row in history_rows
    ]

    return {
        "id": soldier["id"],
        "name": soldier["name"],
        "unit": soldier["unit"],
        "history": history
    }


@app.get("/squad")
def get_squad():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT s.id, s.name, s.unit, r.score
        FROM soldiers s
        JOIN readiness r ON s.id = r.soldier_id
        WHERE r.day = (SELECT MAX(day) FROM readiness WHERE soldier_id = s.id)
        ORDER BY r.score DESC
        LIMIT 6
    """)
    rows = cursor.fetchall()
    conn.close()

    squad = [
        {
            "id": row["id"],
            "name": row["name"],
            "unit": row["unit"],
            "readiness_score": round(row["score"], 2),
            "status": get_status(row["score"])
        }
        for row in rows
    ]

    avg = sum(s["readiness_score"] for s in squad) / len(squad)

    if avg > 75:
        mission_risk = "LOW"
    elif avg >= 50:
        mission_risk = "MEDIUM"
    else:
        mission_risk = "HIGH"

    return {
        "squad": squad,
        "average_readiness": round(avg, 2),
        "mission_risk": mission_risk
    }


@app.get("/predict/{soldier_id}")
def get_prediction(soldier_id: int):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM soldiers WHERE id = ?", (soldier_id,))
    soldier = cursor.fetchone()
    if not soldier:
        conn.close()
        raise HTTPException(status_code=404, detail="Soldier not found")

    cursor.execute("""
        SELECT score FROM readiness
        WHERE soldier_id = ?
        ORDER BY day ASC
    """, (soldier_id,))
    rows = cursor.fetchall()
    conn.close()

    history_scores = [row["score"] for row in rows]
    current_score = history_scores[-1]
    predictions_raw = predict_readiness(history_scores)

    predictions = [
        {"day": f"Day +{i+1}", "predicted_score": round(predictions_raw[i], 2)}
        for i in range(3)
    ]

    last_pred = predictions_raw[-1]
    if last_pred > current_score + 2:
        trend = "IMPROVING"
    elif last_pred >= current_score - 2:
        trend = "STABLE"
    else:
        trend = "DECLINING"

    return {
        "soldier_id": soldier_id,
        "name": soldier["name"],
        "current_score": round(current_score, 2),
        "predictions": predictions,
        "trend": trend
    }


@app.get("/cluster")
def get_clusters():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT s.id, s.name, s.unit, r.score, r.cluster
        FROM soldiers s
        JOIN readiness r ON s.id = r.soldier_id
        WHERE r.day = (SELECT MAX(day) FROM readiness WHERE soldier_id = s.id)
        ORDER BY r.score DESC
    """)
    rows = cursor.fetchall()
    conn.close()

    return [
        {
            "id": row["id"],
            "name": row["name"],
            "unit": row["unit"],
            "readiness_score": round(row["score"], 2),
            "cluster": row["cluster"]
        }
        for row in rows
    ]