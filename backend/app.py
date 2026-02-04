import os
import joblib
import pandas as pd
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Load artifacts on startup
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
ARTIFACT_PATH = os.path.join(BASE_DIR, 'credit_card_model (2).pkl')

if not os.path.exists(ARTIFACT_PATH):
    raise FileNotFoundError(f"Model artifact not found at {ARTIFACT_PATH}. Run backend/train.py first to generate it.")

ARTIFACTS = joblib.load(ARTIFACT_PATH)
MODEL = ARTIFACTS['model']
SCALER = ARTIFACTS['scaler']
LABEL_ENCODERS = ARTIFACTS.get('label_encoders', {})
FEATURE_COLUMNS = ARTIFACTS['feature_columns']


def preprocess_input(df):
    df2 = df[FEATURE_COLUMNS].copy()
    for col, le in LABEL_ENCODERS.items():
        if col in df2.columns:
            df2[col] = le.transform(df2[col])
    X = SCALER.transform(df2.values)
    return X


@app.route('/predict', methods=['POST'])
def predict():
    payload = request.get_json(force=True)
    if isinstance(payload, dict):
        df = pd.DataFrame([payload])
    else:
        df = pd.DataFrame(payload)

    # Validate expected columns
    missing = [c for c in FEATURE_COLUMNS if c not in df.columns]
    if missing:
        return jsonify({'error': 'Missing columns in input', 'missing': missing}), 400

    try:
        X = preprocess_input(df)
        preds = MODEL.predict(X)
        probs = MODEL.predict_proba(X)[:, 1]
        results = []
        for p, pr in zip(preds, probs):
            results.append({'prediction': int(p), 'probability': float(pr)})
        return jsonify({'results': results})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
