import sqlite3
import numpy as np
import pandas as pd


def generate_soldier_data():
    np.random.seed(42)
    records = []

    for soldier_id in range(1, 51):
        base_hr     = np.random.uniform(60, 80)
        base_hrv    = np.random.uniform(40, 80)
        base_sleep  = np.random.uniform(6, 8)
        base_stress = np.random.uniform(2, 5)
        base_act    = np.random.uniform(0.5, 1.0)

        for day in range(1, 11):
            hr     = base_hr     + np.random.normal(0, 3)
            hrv    = base_hrv    + np.random.normal(0, 5)
            sleep  = base_sleep  + np.random.normal(0, 0.5)
            stress = base_stress + np.random.normal(0, 0.5)
            act    = base_act    + np.random.normal(0, 0.05)

            if soldier_id == 2 and day >= 7:
                hr += 20
                hrv -= 20
                sleep -= 2
                stress += 3

            if soldier_id == 4 and day >= 6:
                hr += 15
                hrv -= 15
                sleep -= 1.5
                stress += 2.5

            records.append({
                "soldier_id":     soldier_id,
                "day":            day,
                "heart_rate":     round(hr,    2),
                "hrv":            round(hrv,   2),
                "sleep_hours":    round(sleep, 2),
                "stress_score":   round(stress,2),
                "activity_level": round(act,   3),
            })

    return pd.DataFrame(records)


def compute_zscore_anomalies(df):
    df = df.copy()
    df["anomaly_flag"]   = False
    df["anomaly_reason"] = ""

    for soldier_id in df["soldier_id"].unique():
        mask         = df["soldier_id"] == soldier_id
        soldier_data = df[mask]

        for metric in ["heart_rate", "hrv", "sleep_hours", "stress_score"]:
            mean = soldier_data[metric].mean()
            std  = soldier_data[metric].std()
            if std == 0:
                continue

            z_scores     = (soldier_data[metric] - mean) / std
            anomaly_rows = z_scores.abs() > 2

            for idx in soldier_data[anomaly_rows].index:
                df.at[idx, "anomaly_flag"] = True
                existing  = df.at[idx, "anomaly_reason"]
                separator = ", " if existing else ""
                df.at[idx, "anomaly_reason"] = existing + separator + f"{metric} anomaly"

    return df


def calculate_readiness_score(row):
    hrv_score    = min(row["hrv"], 100) / 100
    sleep_score  = min(row["sleep_hours"], 9) / 9
    stress_score = max(0, (10 - row["stress_score"]) / 10)
    act_score    = min(row["activity_level"], 1.0)

    score = (
        hrv_score    * 0.30 +
        sleep_score  * 0.30 +
        stress_score * 0.25 +
        act_score    * 0.15
    ) * 100

    return round(score, 2)


def assign_cluster(score):
    if score >= 75:
        return "Optimal"
    elif score >= 50:
        return "Moderate"
    else:
        return "At Risk"


def predict_readiness(history_scores):
    if len(history_scores) < 2:
        last = history_scores[-1] if history_scores else 50
        return [round(last, 2)] * 3

    x = np.arange(len(history_scores))
    slope, intercept = np.polyfit(x, history_scores, 1)

    predictions = []
    for i in range(1, 4):
        pred = intercept + slope * (len(history_scores) + i)
        pred = max(0, min(100, pred))
        predictions.append(round(pred, 2))

    return predictions


def load_data_into_db():
    print("Generating soldier data...")
    df = generate_soldier_data()

    print("Computing anomalies...")
    df = compute_zscore_anomalies(df)

    print("Calculating readiness scores...")
    df["readiness_score"] = df.apply(calculate_readiness_score, axis=1)
    df["cluster"]         = df["readiness_score"].apply(assign_cluster)

    conn   = sqlite3.connect("soldiers.db")
    cursor = conn.cursor()

    cursor.execute("DELETE FROM soldiers")
    cursor.execute("DELETE FROM metrics")
    cursor.execute("DELETE FROM readiness")

    units = ["Alpha Unit", "Bravo Unit", "Charlie Unit", "Delta Unit", "Echo Unit"]
    for i in range(1, 51):
        unit = units[(i - 1) // 10]
        cursor.execute(
            "INSERT INTO soldiers (id, name, unit) VALUES (?, ?, ?)",
            (i, f"Soldier_{i:02d}", unit)
        )

    for _, row in df.iterrows():
        cursor.execute(
            "INSERT INTO metrics (soldier_id, day, heart_rate, hrv, sleep_hours, stress_score, activity_level) VALUES (?, ?, ?, ?, ?, ?, ?)",
            (int(row["soldier_id"]), int(row["day"]), row["heart_rate"], row["hrv"], row["sleep_hours"], row["stress_score"], row["activity_level"])
        )

        cursor.execute(
            "INSERT INTO readiness (soldier_id, day, score, anomaly_flag, reason, cluster) VALUES (?, ?, ?, ?, ?, ?)",
            (int(row["soldier_id"]), int(row["day"]), row["readiness_score"], int(row["anomaly_flag"]), row["anomaly_reason"], row["cluster"])
        )

    conn.commit()
    conn.close()

    print("Database loaded successfully!")
    print("50 soldiers inserted")
    print(str(len(df)) + " metric records inserted")


if __name__ == "__main__":
    load_data_into_db()