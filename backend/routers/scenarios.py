from fastapi import APIRouter, HTTPException
from typing import List, Dict
from pydantic import BaseModel
from backend.data.seed_scenarios import SCENARIO_PROFILES
from backend.ml.score_fusion import fuse_score

router = APIRouter(prefix="/scenarios", tags=["Attack Simulation"])

class ScenarioInfo(BaseModel):
    id: str
    name: str
    description: str
    expected_score: int
    expected_action: str
    detection_time_s: int

class ScenarioRunResponse(BaseModel):
    score_progression: List[int]
    final_score: int
    action: str
    detection_time_s: float
    top_anomalies: List[str]

@router.get("/list", response_model=List[ScenarioInfo])
def list_scenarios():
    """
    Returns all 6 attack scenarios with their metadata for the simulator dashboard.
    """
    return [
        ScenarioInfo(
            id=k,
            name=v["name"],
            description=v["description"],
            expected_score=v["expected_score"],
            expected_action=v["expected_action"],
            detection_time_s=v.get("detection_time_s", 28)
        ) for k, v in SCENARIO_PROFILES.items() if k != "legitimate"
    ]

@router.post("/{scenario_id}/run", response_model=ScenarioRunResponse)
def run_scenario(scenario_id: str, user_id: int = 1):
    """
    Simulates a full scenario run end-to-end.
    Returns the score progression across 5 snapshots and final decision.
    """
    if scenario_id not in SCENARIO_PROFILES:
        raise HTTPException(status_code=404, detail="Scenario not found")

    profile = SCENARIO_PROFILES[scenario_id]

    # Standard progressions
    progressions = {
        "scenario_1": [91, 74, 58, 44, 27],
        "scenario_2": [91, 78, 62, 47, 31],
        "scenario_3": [91, 65, 41, 28, 19],
        "scenario_4": [91, 82, 71, 61, 48],
        "scenario_5": [91, 72, 55, 40, 22],
        "scenario_6": [0, 0, 0, 0, 0],
    }

    # Per-scenario detection times
    detection_times = {
        "scenario_1": 28,
        "scenario_2": 34,
        "scenario_3": 12,
        "scenario_4": 52,
        "scenario_5": 28,
        "scenario_6": 5,
    }

    # Per-scenario anomaly descriptions
    scenario_anomalies = {
        "scenario_1": ["Typing speed slower 80% from baseline", "Device fingerprint unknown -- never seen for this account",
                       "Went directly to transfer -- atypical navigation pattern", "SIM swap detected"],
        "scenario_2": ["Touch behavior absent -- possible non-mobile device", "Device class switched from enrolled type -- first desktop session",
                       "Went directly to transfer -- atypical navigation pattern", "SIM swap detected"],
        "scenario_3": ["Typing speed faster 90% from baseline", "Zero typing errors -- possible automated input",
                       "Interaction timing variance faster -- possible automation", "OTP submitted 85% faster than user average"],
        "scenario_4": ["Went directly to transfer -- atypical navigation pattern", "Session 70% shorter than user average",
                       "Navigation 0% more exploratory than normal", "Device fingerprint unknown -- never seen for this account"],
        "scenario_5": ["Typing speed slower 20% from baseline", "Device motion stability 15% below baseline",
                       "OTP submitted 55% slower than user average", "SIM swap detected"],
        "scenario_6": ["Pre-auth SIM probe detected", "3 rapid SMS requests in 2 minutes",
                       "No behavioral vector available", "Telecom signal anomaly"],
    }

    score_progression = progressions.get(scenario_id, [91, 80, 70, 60, 50])
    final_score = score_progression[-1]

    # Scenario 2 also uses SIM for OTP
    sim_swap_active = scenario_id in ["scenario_1", "scenario_2", "scenario_4", "scenario_5"]
    fusion = fuse_score(final_score, sim_swap_active)

    detection_time_s = detection_times.get(scenario_id, profile.get("detection_time_s", 28))
    anomalies = scenario_anomalies.get(scenario_id, ["Typing anomaly", "New device", "Navigation anomaly", "SIM swap detected"])

    return {
        "score_progression": score_progression,
        "final_score": fusion["final_score"],
        "action": fusion["action"],
        "detection_time_s": detection_time_s,
        "top_anomalies": anomalies
    }
