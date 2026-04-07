import datetime
from backend.db.models import SessionLocal
from sqlalchemy import text

# Window: flag device if seen across >= 2 accounts within 60 minutes
FLEET_WINDOW_MINUTES = 60
FLEET_MIN_ACCOUNTS = 2


def check_fleet_anomaly(device_fingerprint: str, user_id: int) -> dict:
    """
    Check if device_fingerprint has been used by multiple distinct user accounts
    within the last FLEET_WINDOW_MINUTES minutes.

    Returns:
        fleet_anomaly (bool): True if same device seen on >= 2 accounts
        accounts_seen (int): Number of distinct accounts using this device
        action (str): Recommended action
    """
    db = SessionLocal()
    try:
        cutoff_time = datetime.datetime.utcnow() - datetime.timedelta(minutes=FLEET_WINDOW_MINUTES)

        # Find all user_ids that used this exact device fingerprint recently
        # device_fingerprint stored in sessions as part of feature_vector_json
        # We query sessions started after cutoff that contain this fingerprint
        rows = db.execute(
            text("""
                SELECT DISTINCT s.user_id
                FROM sessions s
                WHERE s.started_at >= :cutoff
                  AND json_extract(s.feature_vector_json, '$[43]') IS NOT NULL
            """),
            {"cutoff": cutoff_time.isoformat()}
        ).fetchall()

        # Filter to only sessions where device matches
        # Simpler: use device_registry table if available; else fallback stub
        # For demo: use in-memory registry stored per session call
        distinct_accounts = _query_device_registry(db, device_fingerprint, cutoff_time)

        # Register current user's device
        _register_device(db, device_fingerprint, user_id)

        fleet_anomaly = len(distinct_accounts) >= FLEET_MIN_ACCOUNTS

        if fleet_anomaly:
            action = "CRITICAL_ALL_ACCOUNTS_FROZEN"
        else:
            action = "ALLOW"

        return {
            "fleet_anomaly": fleet_anomaly,
            "accounts_seen": len(distinct_accounts),
            "action": action,
            "flagged_accounts": list(distinct_accounts),
            "device_fingerprint": device_fingerprint,
        }

    finally:
        db.close()


def _query_device_registry(db, device_fingerprint: str, cutoff_time: datetime.datetime) -> set:
    """
    Return set of distinct user_ids that used device_fingerprint after cutoff_time.
    Uses raw SQLite query against device_registry table.
    Creates table if not exists (safe for demo).
    """
    # Ensure table exists
    db.execute(text("""
        CREATE TABLE IF NOT EXISTS device_registry (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id     INTEGER NOT NULL,
            device_fingerprint TEXT NOT NULL,
            first_seen  DATETIME NOT NULL,
            last_seen   DATETIME NOT NULL
        )
    """))
    db.commit()

    rows = db.execute(
        text("""
            SELECT DISTINCT user_id
            FROM device_registry
            WHERE device_fingerprint = :fp
              AND last_seen >= :cutoff
        """),
        {"fp": device_fingerprint, "cutoff": cutoff_time.isoformat()}
    ).fetchall()

    return {row[0] for row in rows}


def _register_device(db, device_fingerprint: str, user_id: int):
    """
    Upsert device fingerprint entry for user. Creates new row or updates last_seen.
    """
    now = datetime.datetime.utcnow().isoformat()

    existing = db.execute(
        text("""
            SELECT id FROM device_registry
            WHERE user_id = :uid AND device_fingerprint = :fp
        """),
        {"uid": user_id, "fp": device_fingerprint}
    ).fetchone()

    if existing:
        db.execute(
            text("UPDATE device_registry SET last_seen = :now WHERE id = :id"),
            {"now": now, "id": existing[0]}
        )
    else:
        db.execute(
            text("""
                INSERT INTO device_registry (user_id, device_fingerprint, first_seen, last_seen)
                VALUES (:uid, :fp, :now, :now)
            """),
            {"uid": user_id, "fp": device_fingerprint, "now": now}
        )

    db.commit()
