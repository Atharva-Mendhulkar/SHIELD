import uuid
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Dict, List, Optional
from backend.db.models import SessionLocal, Session, Score, SimSwapEvent, DeviceRegistry
from backend.ml.one_class_svm import predict_score, build_device_context
from backend.ml.score_fusion import fuse_score
from backend.ml.anomaly_explainer import top_anomaly_strings
from backend.ml.feature_schema import FEATURE_NAMES

FEATURE_DIM = len(FEATURE_NAMES)  # 55

router = APIRouter(prefix="/session", tags=["Session Management"])

class SessionStart(BaseModel):
    user_id: int
    session_type: str  # 'legitimate' | 'attacker' | 'scenario_N'
    device_class: str = "mobile"  # 'mobile' | 'desktop'
    device_fingerprint: str = "default_fp"

class FeatureSnapshot(BaseModel):
    session_id: str
    feature_snapshot: Dict[str, float]

class ScoreResponse(BaseModel):
    score: int
    risk_level: str
    action: str
    top_anomalies: List[str]

@router.post("/start")
def start_session(data: SessionStart):
    db = SessionLocal()
    try:
        session_id = str(uuid.uuid4())
        new_session = Session(
            id=session_id,
            user_id=data.user_id,
            session_type=data.session_type,
            device_class=data.device_class,
            feature_vector_json=[0.0] * FEATURE_DIM
        )
        db.add(new_session)

        # Upsert DeviceRegistry + increment session_count
        device = db.query(DeviceRegistry).filter(
            DeviceRegistry.user_id == data.user_id,
            DeviceRegistry.device_fingerprint == data.device_fingerprint
        ).first()
        if device:
            import datetime
            device.last_seen = datetime.datetime.utcnow()
            device.session_count += 1
            if device.session_count >= 3:
                device.trust_level = "known"
        else:
            import datetime
            device = DeviceRegistry(
                user_id=data.user_id,
                device_fingerprint=data.device_fingerprint,
                device_class=data.device_class,
                trust_level="new",
                session_count=1,
                first_seen=datetime.datetime.utcnow(),
                last_seen=datetime.datetime.utcnow(),
            )
            db.add(device)

        db.commit()
        return {"session_id": session_id, "started_at": new_session.started_at.isoformat()}
    finally:
        db.close()

@router.post("/feature", response_model=ScoreResponse)
def submit_feature(data: FeatureSnapshot):
    db = SessionLocal()
    try:
        session = db.query(Session).filter(Session.id == data.session_id).first()
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")

        # Merge snapshot into session vector
        current_vector = session.feature_vector_json or ([0.0] * FEATURE_DIM)
        # Pad if old 47-dim vector found in DB
        if len(current_vector) < FEATURE_DIM:
            current_vector.extend([0.0] * (FEATURE_DIM - len(current_vector)))

        for k, v in data.feature_snapshot.items():
            if k in FEATURE_NAMES:
                 current_vector[FEATURE_NAMES.index(k)] = v

        session.feature_vector_json = current_vector
        db.commit()

        # Check SIM swap
        sim_swap = db.query(SimSwapEvent).filter(
            SimSwapEvent.user_id == session.user_id,
            SimSwapEvent.is_active == True
        ).first()
        sim_swap_active = sim_swap is not None

        # Build device context from DeviceRegistry
        device_class = session.device_class or "mobile"

        # Find fingerprint for this session's device
        latest_device = db.query(DeviceRegistry).filter(
            DeviceRegistry.user_id == session.user_id
        ).order_by(DeviceRegistry.last_seen.desc()).first()
        device_fp = latest_device.device_fingerprint if latest_device else "unknown"

        device_context = build_device_context(db, session.user_id, device_fp, device_class)

        # Predict behavioral score
        behavior_score = predict_score(session.user_id, current_vector, device_class=device_class)

        # Fuse with SIM swap + device context
        fusion = fuse_score(behavior_score, sim_swap_active, device_context=device_context)

        # Get anomalies
        anomalies = top_anomaly_strings(session.user_id, current_vector, device_class=device_class)

        # Save score
        new_score = Score(
            session_id=session.id,
            confidence_score=fusion["final_score"],
            risk_level=fusion["risk_level"],
            action=fusion["action"],
            top_anomalies_json=anomalies
        )
        db.add(new_score)
        db.commit()

        return {
            "score": fusion["final_score"],
            "risk_level": fusion["risk_level"],
            "action": fusion["action"],
            "top_anomalies": anomalies
        }
    finally:
        db.close()

# Standalone fleet check proxy
@router.post("/fleet-check")
def fleet_check_proxy(device_fingerprint: str, user_id: int):
    from backend.ml.fleet_anomaly import check_fleet_anomaly
    return check_fleet_anomaly(device_fingerprint, user_id)
