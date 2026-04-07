# SHIELD Project Audit -- README vs Codebase

Full cross-check of every file, route, schema column, feature count, and function signature.

---

## Fixed Errors (All Resolved)

### 1. Merge Conflict in anomaly_explainer.py
**File:** `backend/ml/anomaly_explainer.py`
**Was:** Git conflict markers (`<<<<<<< HEAD`, `=======`, `>>>>>>>`) left in file. Desktop templates (device_class_switch, mouse_movement_entropy, etc.) missing from incoming branch.
**Fix:** Resolved conflict. Kept `--` dash style + all 5 desktop-specific templates. Total: 18 templates.

---

### 2. session.py -- 47-dim vectors
**File:** `backend/routers/session.py`
**Was:** `[0.0] * 47` on lines 36 and 53. Backend schema expects 55 features.
**Fix:** Changed to `[0.0] * len(FEATURE_NAMES)`. Added padding for old 47-dim vectors found in DB.

---

### 3. session.py -- Missing device_context in fuse_score()
**Was:** `fuse_score(behavior_score, sim_swap_active)` -- no device_context.
**Fix:** Added `build_device_context()` call using DeviceRegistry. Passes result to `fuse_score(behavior_score, sim_swap_active, device_context=device_context)`. All 7 PC-aware rules now active.

---

### 4. session.py -- Wrong top_anomaly_strings() signature
**Was:** `top_anomaly_strings(user_id, vector, sim_swap_active=True)` -- sim_swap_active not accepted.
**Fix:** Changed to `top_anomaly_strings(user_id, vector, device_class=device_class)`. Matches actual function signature.

---

### 5. session.py -- SessionStart missing device_class/device_fingerprint
**Was:** Only `user_id` and `session_type` accepted.
**Fix:** Added `device_class: str = "mobile"` and `device_fingerprint: str = "default_fp"` to `SessionStart` Pydantic model. `POST /start` now upserts DeviceRegistry + increments session_count.

---

### 6. features.py -- 47-dim hardcode
**File:** `backend/routers/features.py`
**Was:** `[0.0] * 47` fallback. Baseline computation crashed on mixed-dimension vectors.
**Fix:** Uses `len(FEATURE_NAMES)`. Pads old vectors. Filters baseline vectors by correct dimension before `np.mean()`.

---

### 7. score.py -- Binary action derivation
**File:** `backend/routers/score.py`
**Was:** `"BLOCK_AND_FREEZE" if CRITICAL else "ALLOW"`. Ignored HIGH and MEDIUM risk levels.
**Fix:** Uses stored `Score.action` column first. Falls back to 4-level mapping: CRITICAL->BLOCK_AND_FREEZE, HIGH->BLOCK_TRANSACTION, MEDIUM->STEP_UP_AUTH, LOW->ALLOW.

---

### 8. scenarios.py -- Missing SIM swap flag for Scenario 2
**File:** `backend/routers/scenarios.py`
**Was:** `sim_swap_active = scenario_id in ["scenario_1", "scenario_4", "scenario_5"]`. Scenario 2 (Laptop Browser, SIM used for OTP) missing.
**Fix:** Added `"scenario_2"` to SIM swap list.

---

### 9. scenarios.py -- Hardcoded anomaly strings
**Was:** Same 4 strings returned for all 6 scenarios.
**Fix:** Per-scenario anomaly descriptions. Scenario 2 gets desktop-specific strings, Scenario 3 gets bot-specific strings, etc.

---

### 10. scenarios.py -- Missing per-scenario detection_time_s
**Was:** Default 28 for all scenarios.
**Fix:** S1=28s, S2=34s, S3=12s, S4=52s, S5=28s, S6=5s. Values also added to `seed_scenarios.py` SCENARIO_PROFILES.

---

### 11. test_model.py -- Import nonexistent module
**File:** `backend/tests/test_model.py`
**Was:** `from backend.utils.scoring import get_top_anomalies`. File `backend/utils/scoring.py` does not exist.
**Fix:** Changed to `from backend.ml.anomaly_explainer import top_anomaly_strings`. Updated `test_anomaly_count_attacker` to use correct function.

---

### 12. DB models.py -- Missing columns
**File:** `backend/db/models.py`
**Was:** `Session.completed`, `Score.action`, `AlertLog.message_sid` columns missing.
**Fix:** Added `Session.completed = Column(Boolean, default=False)`, `Score.action = Column(String)`, `AlertLog.message_sid = Column(String)`.

---

### 13. fleet_anomaly.py -- Device registration incomplete
**File:** `backend/ml/fleet_anomaly.py`
**Was:** `_register_device()` private, never set `device_class`, never incremented `session_count`, never updated `trust_level`.
**Fix:** `register_device()` now public, accepts `device_class`, increments `session_count`, promotes `trust_level="known"` at 3+ sessions. Response key changed from `flagged_accounts` to `affected_users` to match `FleetCheckResponse` Pydantic model.

---

### 14. lstm_autoencoder.py -- Hardcoded FEATURE_DIM=47
**File:** `backend/ml/lstm_autoencoder.py`
**Was:** `FEATURE_DIM = 47` hardcoded. Breaks on 55-dim input.
**Fix:** Imports `FEATURE_NAMES` from `feature_schema.py`. `FEATURE_DIM = len(FEATURE_NAMES)` = 55.

---

### 15. seed_legitimate.py -- Missing 8 new feature defaults
**File:** `backend/data/seed_legitimate.py`
**Was:** New features 48-55 (device trust context, mouse biometrics) got random garbage values.
**Fix:** Legitimate profile now sets: `device_class_known=1`, `device_session_count=(15,5)`, `device_class_switch=0`, `is_known_fingerprint=1`, `time_since_last_seen_hours=(24,12)`, mouse features=0 (mobile user). Sets `device_class='mobile'` on Session.

---

### 16. seed_attacker.py -- Missing 8 new feature defaults
**File:** `backend/data/seed_attacker.py`
**Was:** Same problem as seed_legitimate.
**Fix:** Attacker profile now sets: `device_class_known=0`, `device_session_count=0`, `device_class_switch=1`, `is_known_fingerprint=0`, `time_since_last_seen_hours=0`, mouse features=0. Sets `device_class='mobile'` on Session.

---

### 17. seed_runner.py -- 47-dim vectors
**File:** `demo/seed_runner.py`
**Was:** `vector = [0.0] * 47`. SVM rejects all vectors.
**Fix:** `vector = [0.0] * len(FEATURE_NAMES)`. Sensible defaults for undefined features. Registers demo device in DeviceRegistry with `trust_level="known"`, `session_count=10`. Sets `device_class` on sessions.

---

### 18. enroll.py -- Hardcoded baseline_score
**File:** `backend/routers/enroll.py`
**Was:** `"baseline_score": 91.0` regardless of actual model output.
**Fix:** Computes actual baseline by averaging legitimate vectors and running `predict_score()`. Falls back to 91.0 if no sessions.

---

### 19. Frontend SDK -- 47-feature snapshot
**File:** `frontend/src/hooks/useBehaviorSDK.ts`
**Was:** Only 47 features sent. No device fingerprinting. No mouse tracking. No device class detection.
**Fix:** SDK now sends all 55 features. Added:
- `computeDeviceFingerprint()` -- hash of UA + screen + timezone + cores
- `detectDeviceClass()` -- maxTouchPoints + UA check -> 'mobile' | 'desktop'
- `mousemove` handler with 50ms sampling + entropy/speed CV computation
- `wheel` handler for scroll count
- Touch features zeroed on desktop
- Exposes `deviceClass` and `deviceFingerprint` for session start calls

---

### 20. seed_scenarios.py -- Missing detection_time_s
**File:** `backend/data/seed_scenarios.py`
**Was:** No `detection_time_s` key in any scenario profile.
**Fix:** Added per-scenario: S1=28, S2=34, S3=12, S4=52, S5=28, S6=5.

---

## Files Changed Summary

| File | Change |
|---|---|
| `backend/ml/anomaly_explainer.py` | Merge conflict resolved, desktop templates preserved |
| `backend/routers/session.py` | 47->55 dim, device_context wiring, correct function signatures |
| `backend/routers/features.py` | 47->55 dim, vector padding, dimension-safe baseline |
| `backend/routers/score.py` | 4-level action mapping from stored Score.action |
| `backend/routers/scenarios.py` | Per-scenario anomalies, SIM flag for S2, detection times |
| `backend/routers/enroll.py` | Dynamic baseline_score computation |
| `backend/db/models.py` | Added Session.completed, Score.action, AlertLog.message_sid |
| `backend/ml/fleet_anomaly.py` | Public register_device, session_count++, trust_level promotion |
| `backend/ml/lstm_autoencoder.py` | FEATURE_DIM from schema (55), imports FEATURE_NAMES |
| `backend/data/seed_legitimate.py` | 55-dim profiles with device trust + mouse defaults |
| `backend/data/seed_attacker.py` | 55-dim profiles with attacker device context |
| `backend/data/seed_scenarios.py` | Added detection_time_s to all 6 scenarios |
| `backend/tests/test_model.py` | Fixed broken import, correct function calls |
| `demo/seed_runner.py` | 55-dim vectors, device registration, sensible defaults |
| `frontend/src/hooks/useBehaviorSDK.ts` | 55-feature SDK, fingerprinting, mouse/wheel tracking |

---

## Remaining Non-Breaking Items (Documentation Only)

These do NOT cause runtime errors. They are README text that is stale but does not affect code execution.

| README Reference | Actual | Impact |
|---|---|---|
| `behaviourshield/` root dir | `SHIELD/` | None -- cosmetic |
| `backend/behaviourshield.db` | `backend/db/shield.db` | None -- cosmetic |
| "canonical 47-feature schema" | 55 features now | README text outdated |
| `Nu: 0.05` | Code uses `nu=0.01` | README text outdated |
| "Platt scaling calibration" | Zone-based calibration in code | README text outdated |
| `.env.example` | Not created | Optional -- Twilio gracefully falls back |
| `demo/demo_script.md`, `judge_qa.md`, `backup_video.md` | Not created | Demo docs -- not code |
| `backend/tests/test_routes.py`, `test_scenarios.py` | Not created | Optional test files |
| `backend/data/profiles.json` | Not created | seed_scenarios.py serves same purpose |
| `frontend/src/lib/` | Not created | No utility functions needed currently |

---

## Post-Fix Action Required

1. **Delete old `shield.db`** -- schema changed (new columns). Backend `init_db()` will recreate on startup.
2. **Re-run `demo/seed_runner.py`** -- re-seeds 55-dim vectors into fresh DB.
3. **Frontend**: Components that call `POST /session/start` should pass `device_class` and `device_fingerprint` from the SDK's exported values.
