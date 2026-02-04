import os
import json
import joblib
import pandas as pd

# Basic smoke test to ensure artifacts exist and can predict
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
ARTIFACT_PATH = os.path.join(BASE_DIR, 'credit_card_model (2).pkl')

if __name__ == '__main__':
    if not os.path.exists(ARTIFACT_PATH):
        print('Artifact not found. Run backend/train.py first.')
    else:
        artifacts = joblib.load(ARTIFACT_PATH)
        model = artifacts['model']
        scaler = artifacts['scaler']
        fc = artifacts['feature_columns']
        print('Artifacts loaded. Feature columns:', fc)
