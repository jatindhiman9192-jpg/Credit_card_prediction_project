import os
import joblib
import pandas as pd
import numpy as np
from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, accuracy_score


def generate_synthetic_credit_data(n_samples=10000, random_state=42):
    """Create a synthetic credit dataset with a few categorical features."""
    X_num, y = make_classification(
        n_samples=n_samples,
        n_features=6,
        n_informative=4,
        n_redundant=0,
        n_clusters_per_class=2,
        weights=[0.85, 0.15],  # imbalanced (default is rarer)
        flip_y=0.01,
        random_state=random_state,
    )

    # Map the numeric columns into named features
    df = pd.DataFrame(X_num, columns=[
        'Age_cont', 'Income_cont', 'CreditScore_cont', 'EmploymentYears_cont',
        'DebtRatio_cont', 'LoanAmount_cont'
    ])

    # Transform continuous values into realistic ranges
    rng = np.random.RandomState(random_state)
    df['Age'] = (np.clip((df['Age_cont'] * 12 + 45).astype(int), 18, 90))
    df['Income'] = (np.clip((df['Income_cont'] * 20000 + 50000).astype(int), 8000, 250000))
    df['Credit_Score'] = np.clip((df['CreditScore_cont'] * 100 + 650).astype(int), 300, 850)
    df['Employment_Years'] = np.clip((np.abs(df['EmploymentYears_cont'] * 3)).astype(int), 0, 40)
    df['Debt_to_Income'] = np.clip(np.abs(df['DebtRatio_cont']), 0.0, 3.0)
    df['Loan_Amount'] = np.clip((np.abs(df['LoanAmount_cont']) * 10000).astype(int), 500, 100000)

    # Add categorical features with some randomness
    educations = ['High School', 'Bachelor', 'Graduate', 'Other']
    marital = ['Single', 'Married', 'Divorced']
    prev_default = ['No', 'Yes']

    df['Education'] = rng.choice(educations, size=n_samples, p=[0.35, 0.35, 0.25, 0.05])
    df['Marital_Status'] = rng.choice(marital, size=n_samples, p=[0.4, 0.5, 0.1])
    df['Previous_Default'] = rng.choice(prev_default, size=n_samples, p=[0.9, 0.1])

    # Label is y from make_classification but we can make it correlated with Debt_to_Income and Credit_Score
    y_final = ((y == 1) | (df['Debt_to_Income'] > 1.0) | (df['Credit_Score'] < 550)).astype(int)

    df['Default'] = y_final

    # Select feature columns
    feature_columns = [
        'Age', 'Income', 'Credit_Score', 'Employment_Years', 'Debt_to_Income',
        'Loan_Amount', 'Education', 'Marital_Status', 'Previous_Default'
    ]

    return df[feature_columns + ['Default']], feature_columns


if __name__ == '__main__':
    print("Starting training pipeline...")
    df, FEATURE_COLUMNS = generate_synthetic_credit_data(n_samples=8000)

    # Save the generated dataset to data/ for use by other scripts (e.g., credit_card.py)
    data_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'data'))
    os.makedirs(data_dir, exist_ok=True)
    data_path = os.path.join(data_dir, 'credit_card_data.csv')
    df.to_csv(data_path, index=False)
    print(f"Saved synthetic dataset to {data_path}")

    X = df[FEATURE_COLUMNS].copy()
    y = df['Default'].values

    # Encode categorical features
    categorical_cols = ['Education', 'Marital_Status', 'Previous_Default']
    label_encoders = {}
    for col in categorical_cols:
        le = LabelEncoder()
        X[col] = le.fit_transform(X[col])
        label_encoders[col] = le

    # Split
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

    # Scale
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train.values)
    X_test_scaled = scaler.transform(X_test.values)

    # Train model
    clf = RandomForestClassifier(n_estimators=100, random_state=42, n_jobs=-1)
    clf.fit(X_train_scaled, y_train)

    # Evaluate
    preds = clf.predict(X_test_scaled)
    acc = accuracy_score(y_test, preds)
    print(f"Test Accuracy: {acc:.4f}")
    print(classification_report(y_test, preds))

    # Save artifacts (model, scaler, encoders, feature columns)
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    artifact_path = os.path.join(base_dir, 'credit_card_model (2).pkl')
    artifacts = {
        'model': clf,
        'scaler': scaler,
        'label_encoders': label_encoders,
        'feature_columns': FEATURE_COLUMNS
    }
    joblib.dump(artifacts, artifact_path)
    print(f"Saved trained artifacts to {artifact_path}")
