import os
import joblib
import pandas as pd
import numpy as np

# --- 1. CONFIGURATION AND LOADING ---
# Path to your saved model file
MODEL_PATH = 'credit_card_model (2).pkl'

# Load the entire project object (model, scaler, encoders, etc.)
try:
    # The saved file is a dictionary containing all necessary components
    PROJECT_ARTIFACTS = joblib.load(MODEL_PATH)
    
    MODEL = PROJECT_ARTIFACTS['model']
    SCALER = PROJECT_ARTIFACTS['scaler']
    LABEL_ENCODERS = PROJECT_ARTIFACTS['label_encoders']
    FEATURE_COLUMNS = PROJECT_ARTIFACTS['feature_columns']
    
    print("✅ Successfully loaded Credit Card ML Project Artifacts.")
    print(f"Model Type: {type(MODEL).__name__}")
    print(f"Features expected: {FEATURE_COLUMNS}")
    
except Exception as e:
    print(f"❌ ERROR: Could not load the model from {MODEL_PATH}.")
    print("Please ensure the file is in the same directory and you have 'joblib' installed.")
    print(f"Details: {e}")
    exit()


# --- 2. PREPROCESSING FUNCTION ---
def preprocess_data(new_data: pd.DataFrame) -> np.ndarray:
    """
    Applies the necessary transformations (Label Encoding and Scaling) 
    to new data before prediction.
    """
    # 1. Ensure columns are in the correct order and only features are present
    df = new_data[FEATURE_COLUMNS].copy()
    
    # 2. Apply Label Encoding for Categorical Features
    for col, encoder in LABEL_ENCODERS.items():
        if col in df.columns:
            try:
                # Use the loaded encoder to transform the new data's column
                df[col] = encoder.transform(df[col])
            except ValueError as e:
                print(f"Warning: Could not encode categorical feature '{col}'. Check if new values are outside the training set.")
                print(f"Encoder details: {encoder.classes_}")
                # For a project, you might need a more robust way to handle unknown categories.
                
    # 3. Separate Numerical Features (Assuming all are numerical after encoding)
    # The order of features MUST match the training data.
    X_unscaled = df[FEATURE_COLUMNS].values
    
    # 4. Apply Standard Scaling
    # Use the pre-fitted SCALER object
    X_scaled = SCALER.transform(X_unscaled)
    
    return X_scaled


# --- 3. PREDICTION FUNCTION ---
def predict_risk(data: pd.DataFrame):
    """
    Takes new credit card applicant data and returns the risk prediction.
    """
    print("\n--- Starting Prediction Process ---")
    
    # 1. Preprocess the input data
    X_processed = preprocess_data(data)
    
    # 2. Make the prediction
    # Prediction is likely 0 (Low Risk) or 1 (High Risk / Default)
    predictions = MODEL.predict(X_processed)
    
    # Optionally, get the probability (e.g., probability of being High Risk)
    probabilities = MODEL.predict_proba(X_processed)[:, 1] 
    
    results = []
    for i, (pred, prob) in enumerate(zip(predictions, probabilities)):
        risk_level = "HIGH Risk (Default Likely)" if pred == 1 else "LOW Risk (Good Candidate)"
        results.append({
            'Applicant_ID': i + 1,
            'Prediction': int(pred),
            'Risk_Level': risk_level,
            'Probability_of_Default': f"{prob:.4f}"
        })
        
    return results


# --- 4. EXAMPLE USAGE ---
if __name__ == "__main__":
    # Try to load a dataset if available (saved by backend/train.py), otherwise use example rows
    data_file = 'data/credit_card_data.csv'
    if os.path.exists(data_file):
        print(f"Loading dataset from {data_file} and predicting on first 2 rows...")
        dataset = pd.read_csv(data_file)
        # Use only the feature columns expected by the model
        try:
            sample = dataset[FEATURE_COLUMNS].head(2)
        except Exception:
            # fallback: take first two rows and attempt to map column names
            sample = dataset.head(2)
    else:
        print("Dataset not found. Using example applicants defined in the script.")
        sample = pd.DataFrame({
            # Low-Risk Applicant (Good Credit Score, High Income)
            'Age': [35],
            'Income': [85000],
            'Credit_Score': [750],
            'Employment_Years': [10],
            'Debt_to_Income': [0.15],
            'Education': ['Graduate'],
            'Marital_Status': ['Married'],
            'Previous_Default': ['No'],
            'Loan_Amount': [10000]
        })

    # Run the prediction
    final_results = predict_risk(sample)

    print("\n--- FINAL PREDICTION RESULTS ---")
    for result in final_results:
        print(f"Applicant {result['Applicant_ID']}:")
        print(f"  -> {result['Risk_Level']}")
        print(f"  -> Default Probability: {result['Probability_of_Default']}")
        print("-" * 20)