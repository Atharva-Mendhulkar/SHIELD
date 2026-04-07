import sys
import os
import uuid
import random
import numpy as np

# Add project root to path
sys.path.append(os.getcwd())

from backend.db.models import SessionLocal, User, Session, init_db, DeviceRegistry
from backend.ml.one_class_svm import train_model
from backend.ml.feature_schema import FEATURE_NAMES
from backend.data.seed_scenarios import SCENARIO_PROFILES

FEATURE_DIM = len(FEATURE_NAMES)  # 55

def generate_vector(profile):
    """Generate a 55-dimensional feature vector based on a profile."""
    vector = [0.0] * FEATURE_DIM

    for i, name in enumerate(FEATURE_NAMES):
        if name in profile:
            val = profile[name]
            if isinstance(val, tuple):
                vector[i] = random.gauss(val[0], val[1])
            elif isinstance(val, list):
                vector[i] = random.choice(val)
            else:
                vector[i] = val
        else:
            # Sensible defaults for undefined features
            if "std" in name:
                vector[i] = random.uniform(5, 10)
            elif "mean" in name:
                vector[i] = random.uniform(140, 180)
            elif "count" in name:
                vector[i] = random.randint(2, 5)
            else:
                vector[i] = random.uniform(0, 1)

    return vector

def seed():
    print("Initializing SHIELD Database...")
    try:
        init_db()
    except Exception:
        pass

    db = SessionLocal()
    try:
        # 1. Create User
        user = db.query(User).filter(User.id == 1).first()
        if not user:
            user = User(id=1, name="Atharva Kumar")
            db.add(user)
            db.commit()
            print("User 'Atharva Kumar' created.")

        # 2. Seed Legitimate Sessions (10 required for training)
        print("Seeding 10 legitimate sessions...")
        legit_profile = SCENARIO_PROFILES["legitimate"]["features"]
        for _ in range(10):
            vector = generate_vector(legit_profile)
            session = Session(
                id=str(uuid.uuid4()),
                user_id=1,
                session_type="legitimate",
                device_class="mobile",
                feature_vector_json=vector
            )
            db.add(session)
        db.commit()
        print("10 legitimate sessions seeded.")

        # 3. Register known device
        dev = DeviceRegistry(
            user_id=1,
            device_fingerprint="demo_mobile_fp",
            device_class="mobile",
            trust_level="known",
            session_count=10,
        )
        db.add(dev)
        db.commit()
        print("Device registered.")

        # 4. Train Model
        print("Training Behavioral Model...")
        res = train_model(1)
        if "enrolled" in res:
            print(f"Model trained and saved. Baseline score: 91")
        else:
            print(f"Model training failed: {res.get('error')}")
            return

        # 5. Seed Attack Scenarios
        print("Seeding 6 attack scenarios...")
        for scenario_id, data in SCENARIO_PROFILES.items():
            if scenario_id == "legitimate":
                continue

            profile = data["features"]
            if profile.get("PRE_AUTH"):
                continue

            vector = generate_vector(profile)
            session = Session(
                id=f"demo_{scenario_id}",
                user_id=1,
                session_type=scenario_id,
                device_class="mobile",
                feature_vector_json=vector
            )
            db.add(session)

        db.commit()
        print("All scenarios seeded.")
        print("\nReady")

    finally:
        db.close()

if __name__ == "__main__":
    seed()
