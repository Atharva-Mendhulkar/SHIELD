from datetime import datetime, timedelta
from backend.db.models import SessionLocal, DeviceRegistry
from sqlalchemy import func

def check_fleet_anomaly(device_fingerprint: str, user_id: int) -> dict:
    """
    Check if a device fingerprint is associated with multiple accounts within a short window.
    """
    db = SessionLocal()
    try:
        # Time window: last 60 minutes
        window_start = datetime.utcnow() - timedelta(minutes=60)
        
        # Count distinct users for this device fingerprint within the window
        # In a real system, we'd check against a more robust log, 
        # but for this demo we'll use device_registry last_seen.
        distinct_users = db.query(DeviceRegistry.user_id).filter(
            DeviceRegistry.device_fingerprint == device_fingerprint,
            DeviceRegistry.last_seen >= window_start
        ).distinct().all()
        
        user_ids = [u[0] for u in distinct_users]
        
        # Also include the current attempt if it's not already in the list
        if user_id not in user_ids:
            user_ids.append(user_id)
            
        fleet_anomaly = len(user_ids) >= 2
        
        return {
            "fleet_anomaly": fleet_anomaly,
            "accounts_seen": len(user_ids),
            "affected_users": user_ids,
            "action": "FREEZE_ALL_ACCOUNTS" if fleet_anomaly else "ALLOW"
        }
    finally:
        db.close()

def register_device(user_id: int, device_fingerprint: str):
    """
    Update or create a device registry entry for a user.
    """
    db = SessionLocal()
    try:
        device = db.query(DeviceRegistry).filter(
            DeviceRegistry.user_id == user_id,
            DeviceRegistry.device_fingerprint == device_fingerprint
        ).first()
        
        if device:
            device.last_seen = datetime.utcnow()
        else:
            device = DeviceRegistry(
                user_id=user_id,
                device_fingerprint=device_fingerprint
            )
            db.add(device)
        
        db.commit()
        return device
    finally:
        db.close()
