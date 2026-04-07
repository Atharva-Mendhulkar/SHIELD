from datetime import datetime, timedelta
from backend.db.models import SessionLocal, DeviceRegistry

# Configurable thresholds
FLEET_WINDOW_MINUTES = 60
FLEET_MIN_ACCOUNTS = 2


def check_fleet_anomaly(device_fingerprint: str, user_id: int) -> dict:
    """
    Cross-account attack detection. Identifies same device used across
    multiple user accounts in a short time window.
    """
    db = SessionLocal()
    try:
        window_start = datetime.utcnow() - timedelta(minutes=FLEET_WINDOW_MINUTES)

        rows = db.query(DeviceRegistry.user_id).filter(
            DeviceRegistry.device_fingerprint == device_fingerprint,
            DeviceRegistry.last_seen >= window_start
        ).distinct().all()

        distinct_accounts = [r[0] for r in rows]

        # Register / upsert current device
        register_device(user_id, device_fingerprint, db=db)

        if user_id not in distinct_accounts:
            distinct_accounts.append(user_id)

        fleet_anomaly = len(distinct_accounts) >= FLEET_MIN_ACCOUNTS

        return {
            "fleet_anomaly":      fleet_anomaly,
            "accounts_seen":      len(distinct_accounts),
            "action":             "CRITICAL_ALL_ACCOUNTS_FROZEN" if fleet_anomaly else "ALLOW",
            "affected_users":     distinct_accounts,
            "device_fingerprint": device_fingerprint
        }

    finally:
        db.close()


def register_device(user_id: int, device_fingerprint: str, device_class: str = "mobile", db=None):
    """
    Upsert device registration. Increments session_count and updates trust_level.
    """
    close_db = False
    if db is None:
        db = SessionLocal()
        close_db = True

    try:
        device = db.query(DeviceRegistry).filter(
            DeviceRegistry.user_id == user_id,
            DeviceRegistry.device_fingerprint == device_fingerprint
        ).first()

        if device:
            device.last_seen = datetime.utcnow()
            device.session_count += 1
            # Promote trust once seen 3+ times
            if device.session_count >= 3:
                device.trust_level = "known"
        else:
            device = DeviceRegistry(
                user_id=user_id,
                device_fingerprint=device_fingerprint,
                device_class=device_class,
                trust_level="new",
                session_count=1,
                first_seen=datetime.utcnow(),
                last_seen=datetime.utcnow(),
            )
            db.add(device)

        db.commit()
    finally:
        if close_db:
            db.close()