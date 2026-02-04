# Credit Card Prediction (ML + React Frontend)

This repository contains a small end-to-end demo: a Python backend that trains a credit-card-default prediction model and a minimal React frontend to query predictions.

Structure
- `backend/train.py` - generates a synthetic dataset, trains a RandomForest model, and saves artifacts (`credit_card_model (2).pkl`) in the repo root.
- `backend/app.py` - Flask API that loads the saved artifacts and exposes `/predict`.
- `frontend/` - minimal React app (Vite) that posts applicant data to the backend.

Quick start (Python backend)
1. Create a virtualenv and install dependencies:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```
2. Train the model:

```powershell
python backend/train.py
```
3. Run the API:

```powershell
python backend/app.py
```
Quick start (React frontend)
1. In `frontend/`, install dependencies and start dev server (requires Node.js):

```powershell
cd frontend
npm install
npm run dev
```
2. Open the URL printed by Vite (usually http://localhost:5173) and use the form to send requests to the backend.

Notes
- This demo uses a synthetic dataset. Replace with a real dataset by placing `creditcard.csv` or your data and adapting `backend/train.py`.
- The training script saves a file named `credit_card_model (2).pkl` in the project root. `backend/app.py` expects that file.

