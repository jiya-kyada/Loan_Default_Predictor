"""LoanIQ production Flask API.

Loads the trained model artifacts and exposes:
  GET  /health
  POST /predict

Local development:
    python app.py
Production (Render):
    gunicorn app:app
"""

import os
from pathlib import Path

import joblib
import pandas as pd
from flask import Flask, jsonify, request
from flask_cors import CORS

BASE_DIR = Path(__file__).resolve().parent

model = joblib.load(BASE_DIR / "model.pkl")
scaler = joblib.load(BASE_DIR / "scaler.pkl")
feature_columns = joblib.load(BASE_DIR / "feature_columns.pkl")
numerical_cols = joblib.load(BASE_DIR / "numerical_cols.pkl")

app = Flask(__name__)

# In development, allow Vite. In production, set FRONTEND_ORIGIN to the
# deployed Vercel URL. Multiple origins can be comma-separated.
allowed_origins = os.getenv("FRONTEND_ORIGIN", "http://localhost:5173,http://127.0.0.1:5173")
origins = [origin.strip() for origin in allowed_origins.split(",") if origin.strip()]
CORS(app, resources={r"/*": {"origins": origins}})

CATEGORICAL_COLUMNS = {
    "Education": ["Bachelor's", "High School", "Master's", "PhD"],
    "EmploymentType": ["Full-time", "Part-time", "Self-employed", "Unemployed"],
    "MaritalStatus": ["Divorced", "Married", "Single"],
    "LoanPurpose": ["Auto", "Business", "Education", "Home", "Other"],
}

REQUIRED_NUMERIC_FIELDS = [
    "age", "income", "loanAmount", "creditScore", "monthsEmployed",
    "creditLines", "interestRate", "loanTerm", "dtiRatio",
]
REQUIRED_BOOL_FIELDS = ["hasMortgage", "hasDependents", "hasCoSigner"]
REQUIRED_CATEGORY_FIELDS = {
    "education": "Education",
    "employmentType": "EmploymentType",
    "maritalStatus": "MaritalStatus",
    "loanPurpose": "LoanPurpose",
}


def build_feature_row(payload: dict) -> pd.DataFrame:
    """Turn the frontend form payload into the exact model input row."""
    missing = [field for field in REQUIRED_NUMERIC_FIELDS if field not in payload]
    missing += [field for field in REQUIRED_BOOL_FIELDS if field not in payload]
    missing += [field for field in REQUIRED_CATEGORY_FIELDS if field not in payload]
    if missing:
        raise ValueError(f"Missing fields: {missing}")

    row = {
        "Age": payload["age"],
        "Income": payload["income"],
        "LoanAmount": payload["loanAmount"],
        "CreditScore": payload["creditScore"],
        "MonthsEmployed": payload["monthsEmployed"],
        "NumCreditLines": payload["creditLines"],
        "InterestRate": payload["interestRate"],
        "LoanTerm": payload["loanTerm"],
        "DTIRatio": payload["dtiRatio"],
        "HasMortgage": 1 if payload["hasMortgage"] else 0,
        "HasDependents": 1 if payload["hasDependents"] else 0,
        "HasCoSigner": 1 if payload["hasCoSigner"] else 0,
    }

    for form_field, column_prefix in REQUIRED_CATEGORY_FIELDS.items():
        chosen = payload[form_field]
        options = CATEGORICAL_COLUMNS[column_prefix]
        if chosen not in options:
            raise ValueError(
                f"'{chosen}' is not a valid value for {form_field}. Expected one of {options}"
            )
        for option in options:
            row[f"{column_prefix}_{option}"] = int(chosen == option)

    df_row = pd.DataFrame([row])
    df_row = df_row[feature_columns]
    df_row[numerical_cols] = scaler.transform(df_row[numerical_cols])
    return df_row


@app.get("/health")
def health():
    return jsonify({"status": "ok"})


@app.post("/predict")
def predict():
    payload = request.get_json(silent=True)
    if payload is None:
        return jsonify({"error": "Request body must be JSON"}), 400

    try:
        X = build_feature_row(payload)
        proba_default = float(model.predict_proba(X)[0, 1])
        predicted_class = int(model.predict(X)[0])
    except (ValueError, KeyError, TypeError) as exc:
        return jsonify({"error": str(exc)}), 400
    except Exception as exc:  # keep unexpected server errors out of the response details
        app.logger.exception("Prediction failed")
        return jsonify({"error": "Prediction failed. Please verify the submitted values."}), 500

    return jsonify({
        "probability": proba_default,
        "percent": round(proba_default * 100, 2),
        "predictedClass": predicted_class,
        "isHighRisk": proba_default >= 0.5,
    })


if __name__ == "__main__":
    port = int(os.getenv("PORT", "8000"))
    app.run(host="0.0.0.0", port=port, debug=os.getenv("FLASK_DEBUG", "0") == "1")
