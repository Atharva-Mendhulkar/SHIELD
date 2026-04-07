import sys
import os
import unittest
import numpy as np

# Add root directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
print("DEBUG sys.path:", sys.path)

from backend.db.models import SessionLocal, Session, init_db, Base, engine
from backend.ml.one_class_svm import train_model, predict_score
from backend.ml.score_fusion import fuse_score
from backend.ml.anomaly_explainer import top_anomaly_strings
from backend.data.seed_legitimate import generate_legitimate_session
from backend.data.seed_attacker import generate_attacker_session

class TestShieldModel(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        Base.metadata.drop_all(bind=engine)
        init_db()
        db = SessionLocal()
        cls.user_id = 1

        # Seed training data
        from backend.data.seed_legitimate import seed_legitimate_data
        seed_legitimate_data(cls.user_id, 30)

        # Train model
        train_model(cls.user_id)
        db.close()

    def test_legitimate_scores_high(self):
        db = SessionLocal()
        sessions = db.query(Session).filter(Session.user_id == self.user_id, Session.session_type == "legitimate").limit(5).all()
        for sess in sessions:
            score = predict_score(self.user_id, sess.feature_vector_json)
            self.assertGreaterEqual(score, 70, f"Legitimate session scored {score} - too low")
        db.close()

    def test_attacker_scores_low(self):
        sess = generate_attacker_session(self.user_id)
        score = predict_score(self.user_id, sess.feature_vector_json)
        self.assertLessEqual(score, 50, f"Attacker session scored {score} - not detected")

    def test_sim_swap_fusion_critical(self):
        # Critical behavior + SIM swap
        result = fuse_score(behavior_score=35, sim_swap_active=True)
        self.assertEqual(result["risk_level"], "CRITICAL")
        self.assertEqual(result["action"], "BLOCK_AND_FREEZE")

        # Good behavior but SIM swap (penalized)
        result = fuse_score(behavior_score=90, sim_swap_active=True)
        self.assertEqual(result["risk_level"], "MEDIUM")
        self.assertLess(result["final_score"], 70)

    def test_anomaly_count_attacker(self):
        sess = generate_attacker_session(self.user_id)
        anomalies = top_anomaly_strings(self.user_id, sess.feature_vector_json)
        self.assertGreaterEqual(len(anomalies), 1)

if __name__ == "__main__":
    unittest.main()
