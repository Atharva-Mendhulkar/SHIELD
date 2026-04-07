from fastapi import APIRouter
from backend.ml.one_class_svm import train_model, predict_score
from backend.db.models import SessionLocal, Session
from backend.ml.feature_schema import FEATURE_NAMES
import numpy as np

router = APIRouter(prefix="/enroll", tags=["Account Enrollment"])

@router.post("/{user_id}")
def enroll_user(user_id: int):
    """
    Triggers the training process for the behavioral pattern of a specific user.
    Uses existing 'legitimate' sessions in the database for that user.
    """
    res = train_model(user_id)

    # Compute actual baseline score from average legitimate vector
    baseline_score = 91.0
    db = SessionLocal()
    try:
        legit_sessions = db.query(Session).filter(
            Session.user_id == user_id,
            Session.session_type == "legitimate"
        ).all()
        valid = [
            s.feature_vector_json for s in legit_sessions
            if s.feature_vector_json and len(s.feature_vector_json) == len(FEATURE_NAMES)
        ]
        if valid:
            avg_vector = np.mean(valid, axis=0).tolist()
            baseline_score = float(predict_score(user_id, avg_vector))
    finally:
        db.close()

    return {
        "enrolled": res.get("enrolled", False),
        "sessions_used": res.get("sessions_used", 0),
        "model_saved": res.get("enrolled", False),
        "baseline_score": baseline_score
    }
