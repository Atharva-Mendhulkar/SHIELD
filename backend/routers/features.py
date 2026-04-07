import numpy as np
from fastapi import APIRouter, HTTPException
from backend.db.models import SessionLocal, Session
from backend.ml.feature_schema import FEATURE_NAMES

FEATURE_DIM = len(FEATURE_NAMES)  # 55

router = APIRouter(prefix="/features", tags=["Feature Inspection"])

@router.get("/inspect/{session_id}")
def inspect_features(session_id: str):
    """
    Returns full feature vector vs user baseline.
    Powers the Feature Inspector table in the Simulator dashboard.
    """
    db = SessionLocal()
    try:
        session = db.query(Session).filter(Session.id == session_id).first()
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")

        vector = session.feature_vector_json or ([0.0] * FEATURE_DIM)
        # Pad if old 47-dim vector found
        if len(vector) < FEATURE_DIM:
            vector.extend([0.0] * (FEATURE_DIM - len(vector)))

        # Load user baseline for statistical comparison
        legit_sessions = db.query(Session).filter(
            Session.user_id == session.user_id,
            Session.session_type == 'legitimate'
        ).all()

        if not legit_sessions:
            return {"features": []}

        valid_vectors = [
            s.feature_vector_json for s in legit_sessions
            if s.feature_vector_json and len(s.feature_vector_json) == FEATURE_DIM
        ]
        if len(valid_vectors) == 0:
            return {"features": []}

        X_baseline = np.array(valid_vectors)
        baseline_mean = np.mean(X_baseline, axis=0)
        baseline_std = np.std(X_baseline, axis=0) + 1e-6

        results = []
        for i, name in enumerate(FEATURE_NAMES):
            val = vector[i]
            base = baseline_mean[i]
            z = (val - base) / baseline_std[i]

            results.append({
                "name": name,
                "value": round(float(val), 3),
                "baseline": round(float(base), 3),
                "z_score": round(float(z), 2),
                "flagged": abs(z) > 2.5
            })

        return {"features": results}
    finally:
        db.close()
