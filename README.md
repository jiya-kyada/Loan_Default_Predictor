# LoanIQ — Deployment Ready

LoanIQ is a React/Vite frontend connected to a Flask API that serves the trained loan-default ML model.

## Project structure

```text
LoanIQ/
├── frontend/              # React + Vite UI
│   ├── src/
│   ├── package.json
│   ├── .env.example
│   └── vercel.json
├── backend/               # Flask ML API
│   ├── app.py
│   ├── model.pkl
│   ├── scaler.pkl
│   ├── feature_columns.pkl
│   ├── numerical_cols.pkl
│   ├── requirements.txt
│   └── .env.example
└── render.yaml
```

## 1. Run locally

### Backend — terminal 1

Windows CMD:

```cmd
cd LoanIQ\backend
python -m venv venv
venv\Scripts\activate
python -m pip install -r requirements.txt
python app.py
```

The API runs at `http://localhost:8000`.

Test:

```text
http://localhost:8000/health
```

Expected response:

```json
{"status":"ok"}
```

### Frontend — terminal 2

```cmd
cd LoanIQ\frontend
npm install
npm run dev
```

Open the Vite URL shown in the terminal, normally `http://localhost:5173`.

The included frontend default is already configured to call:

```text
http://localhost:8000/predict
```

For an explicit local configuration, copy `frontend/.env.example` to `frontend/.env`.

## 2. Deploy backend to Render

1. Push this repository to GitHub.
2. In Render, create a **Web Service** from the GitHub repository.
3. Set **Root Directory** to `backend`.
4. Set **Build Command** to:

```bash
pip install -r requirements.txt
```

5. Set **Start Command** to:

```bash
gunicorn --bind 0.0.0.0:$PORT app:app
```

6. Add the environment variable:

```text
FRONTEND_ORIGIN=https://YOUR-VERCEL-DOMAIN.vercel.app
```

7. Deploy and test:

```text
https://YOUR-RENDER-SERVICE.onrender.com/health
```

It should return `{"status":"ok"}`.

`render.yaml` is included as a deployment blueprint if you prefer Render's Blueprint workflow.

## 3. Deploy frontend to Vercel

1. Import the same GitHub repository into Vercel.
2. Set **Root Directory** to `frontend`.
3. Vercel detects Vite automatically. The build command is `npm run build` and output is `dist`.
4. Add this environment variable:

```text
VITE_API_URL=https://YOUR-RENDER-SERVICE.onrender.com/predict
```

5. Deploy.

The included `frontend/vercel.json` provides SPA fallback routing.

## 4. Final connection

```text
Browser
   │
   ▼
Vercel (React/Vite)
   │ POST /predict
   ▼
Render (Flask/Gunicorn)
   │
   ▼
model.pkl + scaler.pkl
   │
   ▼
Loan default prediction
```

## Important environment-variable rule

Vite embeds `VITE_*` variables into the browser build. Do not put private API keys or secrets in `VITE_*` variables. LoanIQ's backend URL is not a secret.

## Updating the application

After changing code:

```cmd
git add .
git commit -m "Update LoanIQ"
git push
```

Vercel and Render can automatically redeploy from GitHub when auto-deploy is enabled.

## Troubleshooting

### Frontend says the backend is offline

1. Open the Render `/health` URL directly.
2. Confirm `VITE_API_URL` ends in `/predict`.
3. Confirm Render's `FRONTEND_ORIGIN` matches the Vercel domain.
4. Redeploy Vercel after changing an environment variable.

### Render build fails

Check that `backend/requirements.txt` contains `gunicorn` and that the service Root Directory is `backend`.

### Local frontend cannot call the backend

Make sure the backend is running on port 8000 and the frontend is running on port 5173.
