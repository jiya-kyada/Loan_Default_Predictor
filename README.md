# LoanIQ — AI-Powered Loan Default Risk Predictor

> **LoanIQ** is a full-stack machine-learning web application that estimates the probability of loan default from an applicant's financial and personal profile.

LoanIQ combines a **React + Vite frontend**, a **Flask REST API**, and a trained **Logistic Regression model** into a simple, interactive risk-analysis platform. A user enters applicant information, the frontend sends it to the backend, the trained model calculates the default probability, and the result is returned as an easy-to-understand risk assessment.

---

## 📌 Project Overview

Loan approval and underwriting involve evaluating multiple applicant attributes such as income, credit score, debt-to-income ratio, employment information, loan amount, and other financial characteristics.

LoanIQ demonstrates how machine learning can be used to turn these inputs into a **statistical loan-default risk estimate**.

### The basic idea

```text
Applicant Information
        │
        ▼
┌───────────────────────┐
│   LoanIQ Web Interface│
│     React + Vite      │
└───────────┬───────────┘
            │
            │ POST /predict
            ▼
┌───────────────────────┐
│      Flask API        │
│  Input validation &   │
│  feature preparation  │
└───────────┬───────────┘
            │
            ▼
┌───────────────────────┐
│   Preprocessing       │
│ Scaling + encoding    │
└───────────┬───────────┘
            │
            ▼
┌───────────────────────┐
│ Logistic Regression   │
│    Trained ML Model   │
└───────────┬───────────┘
            │
            ▼
┌───────────────────────┐
│ Risk Probability      │
│ + Prediction Class    │
│ + Risk Interpretation │
└───────────────────────┘
```

---

## ✨ Key Features

### 🤖 Machine-Learning Prediction
- Uses a trained **Logistic Regression** model.
- Returns a probability of default for the submitted applicant profile.
- Produces both the predicted class and probability score.
- Uses the saved preprocessing artifacts to keep inference consistent with the trained model.

### 📊 Interactive Risk Analyzer
Users can enter information including:

- Age
- Annual income
- Loan amount
- Credit score
- Months employed
- Number of credit lines
- Interest rate
- Loan term
- Debt-to-income ratio
- Education
- Employment type
- Marital status
- Loan purpose
- Mortgage status
- Dependents
- Co-signer status

The application sends these values to the backend and displays the returned prediction in an interactive risk-analysis interface.

### 🔎 Explainable Result Presentation
After an analysis, LoanIQ presents:
- Predicted default probability
- Prediction class
- High-risk indication
- Key risk factors
- A human-readable recommendation
- Submitted applicant values used for the analysis

> **Important:** The explanatory UI is designed to make the prediction easier to understand. It should not be interpreted as a direct display of the Logistic Regression model's fitted coefficients unless explicitly stated.

### 🟢 Live ML Engine Status
The frontend periodically checks the backend `/health` endpoint and displays whether the prediction engine is reachable.

This means the status indicator reflects an actual API health check rather than a simulated "online" state.

### 🌓 Light & Dark Mode
- Modern fintech-inspired interface
- Light and dark themes
- Theme preference is persisted in the browser
- Responsive layout for different screen sizes

### 🎨 Modern UI/UX
The frontend includes:
- Animated risk gauge
- Scroll-based reveal animations
- Interactive cards
- Responsive navigation
- Applicant and financial profile sections
- Visual ML pipeline
- Risk-analysis result panel
- Reduced-motion support for accessibility

---

## 🧠 Machine Learning Pipeline

LoanIQ's backend prepares the submitted applicant data before passing it to the trained model.

### 1. Input Collection

The frontend collects applicant attributes through the risk-checker form.

### 2. Validation

The Flask API checks that all required fields are present and that categorical values belong to the expected categories.

### 3. Categorical Encoding

Categorical attributes are converted into model-compatible binary features.

For example:

```text
Employment Type
       │
       ├── Full-time
       ├── Part-time
       ├── Self-employed
       └── Unemployed
```

The backend creates the corresponding encoded feature columns expected by the trained model.

### 4. Numerical Scaling

Numerical features are transformed using the saved `scaler.pkl` artifact.

### 5. Feature Ordering

The processed input is reordered using `feature_columns.pkl` so that the model receives the same feature structure expected during training.

### 6. Prediction

The trained model produces:

```text
Default Probability
Predicted Class
High-Risk Flag
```

### 7. API Response

Example response:

```json
{
  "probability": 0.2745,
  "percent": 27.45,
  "predictedClass": 0,
  "isHighRisk": false
}
```

---

## 📈 Model & Data Context

The application interface documents a modeling dataset containing:

- **255,347 records**
- **18 columns**
- Duplicate records removed
- No null values before encoding and scaling

The deployed application uses serialized machine-learning artifacts stored in the backend:

```text
model.pkl
scaler.pkl
feature_columns.pkl
numerical_cols.pkl
```

### Model

```text
Logistic Regression
        │
        ├── Numerical features → scaling
        ├── Categorical features → encoding
        └── Ordered feature vector
                    │
                    ▼
              Model inference
                    │
                    ▼
          Default probability
```

> The repository contains the trained inference artifacts, while the original model-training notebook/source is not included in this deployment-ready package.

---

## 🏗️ Technology Stack

### Frontend

| Technology | Purpose |
|---|---|
| React | UI development |
| Vite | Frontend build and development tooling |
| Tailwind CSS | Styling |
| Lucide React | Icons |
| JavaScript / JSX | Application logic |

### Backend

| Technology | Purpose |
|---|---|
| Python | Backend and ML integration |
| Flask | REST API |
| Flask-CORS | Cross-origin communication |
| Pandas | Data preparation |
| Scikit-learn | Machine-learning inference |
| Joblib | Loading serialized ML artifacts |
| Gunicorn | Production WSGI server |

### Deployment

| Platform | Role |
|---|---|
| Vercel | React frontend hosting |
| Render | Flask API hosting |
| GitHub | Source-code repository and deployment trigger |

---

## 📁 Project Structure

```text
LoanIQ/
│
├── frontend/
│   ├── public/
│   │   ├── favicon.svg
│   │   └── icons.svg
│   │
│   ├── src/
│   │   ├── assets/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   │
│   ├── .env.example
│   ├── package.json
│   ├── package-lock.json
│   ├── vite.config.js
│   └── vercel.json
│
├── backend/
│   ├── app.py
│   ├── model.pkl
│   ├── scaler.pkl
│   ├── feature_columns.pkl
│   ├── numerical_cols.pkl
│   ├── requirements.txt
│   └── .env.example
│
├── render.yaml
├── .gitignore
└── README.md
```

---

# 🚀 Getting Started

## Prerequisites

Install the following before running the project:

- **Python 3**
- **Node.js + npm**
- **Git**

Check your installations:

```bash
python --version
node --version
npm --version
git --version
```

---

## 💻 Run LoanIQ Locally

The frontend and backend run as two separate processes.

### Step 1 — Start the Backend

Open Terminal 1:

```bash
cd LoanIQ/backend
```

Create a virtual environment:

```bash
python -m venv venv
```

Activate it on Windows:

```cmd
venv\Scripts\activate
```

Install dependencies:

```bash
python -m pip install -r requirements.txt
```

Start the API:

```bash
python app.py
```

The backend will normally run at:

```text
http://localhost:8000
```

### Verify the backend

Open:

```text
http://localhost:8000/health
```

Expected response:

```json
{
  "status": "ok"
}
```

---

## Step 2 — Start the Frontend

Open Terminal 2:

```bash
cd LoanIQ/frontend
npm install
npm run dev
```

Vite will display a local URL, normally:

```text
http://localhost:5173
```

Open that URL in your browser.

The frontend is configured to use:

```text
http://localhost:8000/predict
```

by default.

### Optional frontend environment configuration

Copy:

```text
frontend/.env.example
```

to:

```text
frontend/.env
```

Then configure:

```env
VITE_API_URL=http://localhost:8000/predict
```

---

# 🔌 API Documentation

LoanIQ currently exposes two main endpoints.

## `GET /health`

Used by the frontend to check whether the backend is reachable.

### Response

```json
{
  "status": "ok"
}
```

---

## `POST /predict`

Runs the trained ML model against an applicant profile.

### Example request

```json
{
  "age": 35,
  "income": 75000,
  "loanAmount": 25000,
  "creditScore": 680,
  "monthsEmployed": 60,
  "creditLines": 4,
  "interestRate": 8.5,
  "loanTerm": 36,
  "dtiRatio": 0.32,
  "hasMortgage": true,
  "hasDependents": true,
  "hasCoSigner": false,
  "education": "Bachelor's",
  "employmentType": "Full-time",
  "maritalStatus": "Married",
  "loanPurpose": "Home"
}
```

### Example response

```json
{
  "probability": 0.2745,
  "percent": 27.45,
  "predictedClass": 0,
  "isHighRisk": false
}
```

### Response fields

| Field | Meaning |
|---|---|
| `probability` | Model-estimated probability of default, from 0 to 1 |
| `percent` | Same probability expressed as a percentage |
| `predictedClass` | Model classification |
| `isHighRisk` | Backend flag based on the application's configured probability threshold |

---

# ☁️ Deployment

LoanIQ is designed for a simple split deployment:

```text
                    ┌───────────────────┐
                    │      GitHub       │
                    │   Source Code     │
                    └─────────┬─────────┘
                              │
                  ┌───────────┴───────────┐
                  ▼                       ▼
          ┌───────────────┐       ┌───────────────┐
          │    Vercel     │       │    Render     │
          │ React + Vite  │ ────► │ Flask + ML    │
          │   Frontend    │ POST  │    Backend    │
          └───────────────┘/predict└───────────────┘
                                          │
                                          ▼
                                  Trained ML Model
```

---

## Backend — Render

1. Push the project to GitHub.
2. Create a new **Web Service** on Render.
3. Connect the GitHub repository.
4. Set the **Root Directory** to:

```text
backend
```

5. Build command:

```bash
pip install -r requirements.txt
```

6. Start command:

```bash
gunicorn --bind 0.0.0.0:$PORT app:app
```

7. Add:

```env
FRONTEND_ORIGIN=https://YOUR-VERCEL-DOMAIN.vercel.app
```

8. Deploy the service.
9. Verify:

```text
https://YOUR-RENDER-SERVICE.onrender.com/health
```

The included `render.yaml` can also be used with Render Blueprint deployment.

---

## Frontend — Vercel

1. Import the GitHub repository into Vercel.
2. Set the **Root Directory** to:

```text
frontend
```

3. Build command:

```bash
npm run build
```

4. Output directory:

```text
dist
```

5. Add:

```env
VITE_API_URL=https://YOUR-RENDER-SERVICE.onrender.com/predict
```

6. Deploy the frontend.

The included `vercel.json` provides SPA fallback routing.

---

# 🔄 End-to-End Request Flow

When the user clicks **Predict Loan Risk**, the following happens:

```text
1. User enters applicant details
              │
              ▼
2. React validates/submits the form
              │
              ▼
3. POST /predict
              │
              ▼
4. Flask receives JSON payload
              │
              ▼
5. Required fields are validated
              │
              ▼
6. Categorical fields are one-hot encoded
              │
              ▼
7. Numerical fields are scaled
              │
              ▼
8. Features are ordered using feature_columns.pkl
              │
              ▼
9. Logistic Regression performs inference
              │
              ▼
10. Probability + class + risk flag returned
              │
              ▼
11. React renders the result
```

---

# 🧪 Error Handling

The backend handles common API errors such as:

- Missing request fields
- Invalid categorical values
- Invalid JSON request bodies
- Unexpected prediction failures

Example:

```json
{
  "error": "Request body must be JSON"
}
```

or:

```json
{
  "error": "Missing fields: [...]"
}
```

The frontend also provides an error state and allows the user to retry the analysis.

---

# 🛠️ Troubleshooting

## Frontend says the prediction engine is offline

Check:

1. Is the Flask server running?
2. Does `/health` return `{"status":"ok"}`?
3. Is `VITE_API_URL` pointing to the correct `/predict` endpoint?
4. Is the backend `FRONTEND_ORIGIN` set to the correct frontend domain?
5. If an environment variable was changed on Vercel, was the frontend redeployed?

---

## CORS error

For local development, the backend allows:

```text
http://localhost:5173
http://127.0.0.1:5173
```

For production, set:

```env
FRONTEND_ORIGIN=https://YOUR-VERCEL-DOMAIN.vercel.app
```

Then redeploy the backend if required.

---

## Render deployment fails

Verify:

```text
Root Directory: backend
Build Command: pip install -r requirements.txt
Start Command: gunicorn --bind 0.0.0.0:$PORT app:app
Health Check: /health
```

Also make sure `gunicorn` exists in:

```text
backend/requirements.txt
```

---

## Local frontend cannot connect to backend

Make sure both services are running:

```text
Frontend → http://localhost:5173
Backend  → http://localhost:8000
```

And:

```env
VITE_API_URL=http://localhost:8000/predict
```

---

# 📦 Deployment Checklist

Before deploying:

- [ ] Backend dependencies are listed in `requirements.txt`
- [ ] Frontend dependencies are listed in `package.json`
- [ ] ML artifacts are present in `backend/`
- [ ] `/health` works locally
- [ ] `/predict` works locally
- [ ] `VITE_API_URL` points to the correct backend
- [ ] `FRONTEND_ORIGIN` points to the correct frontend
- [ ] `.env` files containing local/private values are not committed
- [ ] Frontend production build succeeds with `npm run build`
- [ ] Render service uses the correct root directory and start command
- [ ] Vercel uses `frontend` as the root directory

---

# 🔮 Possible Future Improvements

LoanIQ can be extended with:

- Model comparison between Logistic Regression, Random Forest, XGBoost, etc.
- SHAP-based explanations using the actual fitted model
- Applicant history and prediction records
- Authentication and role-based access
- Database-backed application management
- Model performance dashboard
- ROC-AUC, precision, recall and confusion-matrix reporting
- Batch loan-risk scoring through CSV upload
- PDF risk reports
- Model monitoring and drift detection
- Automated retraining pipelines
- Fairness and bias analysis across applicant groups

---

# ⚠️ Disclaimer

LoanIQ is an **educational and demonstration-oriented machine-learning application**.

The prediction is a statistical estimate produced by a trained model and **should not be treated as a real credit decision, financial advice, or a substitute for professional underwriting**.

Real-world lending systems require additional validation, regulatory compliance, fairness testing, security controls, explainability requirements, and human review.

---

# 👩‍💻 Development

Typical development workflow:

```bash
# Backend
cd backend
python app.py

# Frontend
cd frontend
npm run dev
```

After making changes:

```bash
git add .
git commit -m "Update LoanIQ"
git push
```

If Vercel and Render automatic deployments are enabled, pushing to the connected GitHub branch can trigger a new deployment.

---

## ⭐ Project Summary

**LoanIQ turns applicant information into an ML-powered loan-default risk estimate through a modern full-stack web application.**

```text
React + Vite
     │
     ▼
Applicant Risk Form
     │
     ▼
Flask REST API
     │
     ▼
Data Validation + Preprocessing
     │
     ▼
Logistic Regression
     │
     ▼
Default Probability
     │
     ▼
Interactive Risk Assessment
```

**Built with:** React · Vite · Flask · Python · Pandas · Scikit-learn · Joblib · Render · Vercel
