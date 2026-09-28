# LoanIQ Frontend

## 📌 Overview

The **LoanIQ Frontend** is the user interface of the LoanIQ application, built with **React + Vite**.

It allows users to enter applicant details, send them to the ML backend, and view the predicted loan-default risk in an interactive dashboard.

## ✨ Features

- Applicant and financial information form
- Loan-default risk prediction interface
- Interactive risk percentage/gauge
- Risk result and prediction details
- Light and dark mode
- Responsive design
- Backend health/status checking
- Error handling for failed predictions
- Modern fintech-style UI

## 📁 Structure

```text
frontend/
├── public/          # Static assets
├── src/
│   ├── assets/      # Application assets
│   ├── App.jsx      # Main application
│   ├── main.jsx     # React entry point
│   └── index.css    # Global styles
├── package.json
├── vite.config.js
└── vercel.json
```

## 🚀 Run Locally

```bash
npm install
npm run dev
```

The frontend normally runs at:

```text
http://localhost:5173
```

It communicates with the LoanIQ Flask backend through the `/predict` and `/health` API endpoints.

## ☁️ Deployment

The frontend is ready for deployment on **Vercel**.

Typical settings:

```text
Root Directory: frontend
Build Command: npm run build
Output Directory: dist
```

For backend/API details, see [`../backend/README.md`](../backend/README.md).
