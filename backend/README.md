\# LoanIQ Backend



\## 📌 Overview



The \*\*LoanIQ Backend\*\* provides the REST API and machine-learning inference for the LoanIQ application.



It is built with \*\*Python + Flask\*\* and processes applicant information before passing it to the trained \*\*Logistic Regression\*\* model.



\## ✨ Features



\- Flask REST API

\- Loan-default prediction

\- Input validation

\- Categorical feature encoding

\- Numerical feature scaling

\- Trained ML model loading

\- Prediction probability calculation

\- Backend health-check endpoint

\- CORS support for frontend communication



\## 📁 Structure



```text

backend/

├── app.py                 # Flask API and prediction logic

├── model.pkl              # Trained ML model

├── scaler.pkl             # Saved feature scaler

├── feature\_columns.pkl    # Expected model feature order

├── numerical\_cols.pkl     # Numerical feature information

├── requirements.txt       # Python dependencies

└── .env.example           # Example configuration

```



\## 🔌 API Endpoints



\### Health Check



```text

GET /health

```



Returns:



```json

{"status": "ok"}

```



\### Prediction



```text

POST /predict

```



Receives applicant information and returns the estimated default probability and prediction class.



\## 🚀 Run Locally



```bash

python -m venv venv

venv\\Scripts\\activate

python -m pip install -r requirements.txt

python app.py

```



The backend normally runs at:



```text

http://localhost:8000

```



\## ☁️ Deployment



The backend is ready for deployment on \*\*Render\*\*.



Typical start command:



```bash

gunicorn --bind 0.0.0.0:$PORT app:app

```



The frontend communicates with this API to perform loan-default predictions.



For frontend details, see \[`../frontend/README.md`](../frontend/README.md).



