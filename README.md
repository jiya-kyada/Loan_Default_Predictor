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

---

# 📦 Deployment Checklist

Before deploying:

- [ ] Backend dependencies are installed
- [ ] ML artifacts are present in `backend/`
- [ ] `/health` and `/predict` work locally
- [ ] Frontend points to the correct backend
- [ ] Frontend production build succeeds
- [ ] Render and Vercel use the correct root directories

---

# ⚠️ Disclaimer

LoanIQ is an **educational and demonstration-oriented machine-learning application**.

The prediction is a statistical estimate produced by a trained model and **should not be treated as a real credit decision, financial advice, or a substitute for professional underwriting**.

Real-world lending systems require additional validation, regulatory compliance, fairness testing, security controls, explainability requirements, and human review.

---

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
