from fastapi import APIRouter, HTTPException
from backend.db.models import SessionLocal, Score

router = APIRouter(prefix="/score", tags=["Scoring"])

@router.get("/{session_id}")
def get_score(session_id: str):
    db = SessionLocal()
    try:
        score = db.query(Score).filter(Score.session_id == session_id).order_by(Score.computed_at.desc()).first()
        if not score:
            return {
                "score": 91,
                "risk_level": "LOW",
                "action": "ALLOW",
                "top_anomalies": [],
                "updated_at": "baseline"
            }

        # Derive action from stored action or risk_level fallback
        action = score.action
        if not action:
            risk_to_action = {
                "CRITICAL": "BLOCK_AND_FREEZE",
                "HIGH":     "BLOCK_TRANSACTION",
                "MEDIUM":   "STEP_UP_AUTH",
                "LOW":      "ALLOW",
            }
            action = risk_to_action.get(score.risk_level, "ALLOW")

        return {
            "score": score.confidence_score,
            "risk_level": score.risk_level,
            "action": action,
            "top_anomalies": score.top_anomalies_json,
            "updated_at": score.computed_at.isoformat()
        }
    finally:
        db.close()
