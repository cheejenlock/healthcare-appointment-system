# Deployment Guide — Healthcare Appointment System

This document provides a step-by-step guide to deploying the application both **locally** and to **Render (cloud)**.

---

## Part 1 — Local Deployment

### 1.1 Prerequisites

- **Node.js** >= 18 ([download](https://nodejs.org/))
- **PostgreSQL** >= 15 ([download](https://www.postgresql.org/download/windows/))
- **Git** ([download](https://git-scm.com/download/win))

### 1.2 Clone the Repository

```bash
git clone https://github.com/cheejenlock/healthcare-appointment-system.git
cd healthcare-appointment-system
```

### 1.3 Install Dependencies

```bash
npm install
```

### 1.4 Configure Environment Variables

Create a `.env` file in the project root:

```env
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/healthcare_db
JWT_SECRET=dev_secret_change_me_12345
JWT_EXPIRES_IN=1d
OPENFDA_BASE_URL=https://api.fda.gov
TEXTBELT_KEY=textbelt
```

> **Security**: `.env` is excluded via `.gitignore`. Never commit secrets.

### 1.5 Create Database & Import Schema

```bash
createdb -U postgres healthcare_db
psql -U postgres -d healthcare_db -f server/sql/schema.sql
```

Verify 5 tables:

```bash
psql -U postgres -d healthcare_db -c "\dt"
```

### 1.6 Run the Server

```bash
npm run dev
```

Access: http://localhost:5000/health

---

## Part 2 — Cloud Deployment (Render.com)

### 2.1 Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/healthcare-appointment-system.git
git push -u origin main
```

### 2.2 Create Render Account

Go to https://render.com/ → Sign up with **GitHub**.

### 2.3 Create PostgreSQL Database

1. Dashboard → **+ New** → **Postgres**
2. Configure:
   - Name: `healthcare-db`
   - Database: `healthcare_db`
   - User: `healthcare_user`
   - Region: **Singapore**
   - Instance Type: **Free**
3. Click **Create Database**
4. Copy **External Database URL** (needed later)

### 2.4 Import Schema to Cloud Database

```bash
psql "<EXTERNAL_DATABASE_URL>?sslmode=require" -f server/sql/schema.sql
```

### 2.5 Create Web Service

1. Dashboard → **+ New** → **Web Service**
2. Connect GitHub repo `healthcare-appointment-system`
3. Configure:
   - **Name**: `healthcare-appointment-system`
   - **Region**: Singapore
   - **Branch**: `main`
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `node server/index.js`
   - **Instance Type**: Free

### 2.6 Add Environment Variables

In the Web Service → **Environment** tab:

| Key | Value |
|---|---|
| `NODE_ENV` | `production` |
| `PORT` | `10000` |
| `DATABASE_URL` | (paste External Database URL) |
| `JWT_SECRET` | (your secret) |
| `JWT_EXPIRES_IN` | `1d` |
| `OPENFDA_BASE_URL` | `https://api.fda.gov` |
| `TEXTBELT_KEY` | `textbelt` |
| `TWILIO_ACCOUNT_SID` | (your SID) |
| `TWILIO_AUTH_TOKEN` | (your token) |
| `TWILIO_PHONE_NUMBER` | (blank) |
| `GOOGLE_CLIENT_ID` | (your Client ID) |
| `GOOGLE_CLIENT_SECRET` | (your Secret) |
| `GOOGLE_REDIRECT_URI` | `https://<your-service>.onrender.com/api/external/calendar/callback` |

### 2.7 Deploy

Click **Create Web Service**. Build takes ~1–2 minutes.

### 2.8 Update Google Cloud OAuth Redirect URIs

1. https://console.cloud.google.com/apis/credentials
2. Click **Healthcare Backend** OAuth client
3. Add redirect URI: `https://<your-service>.onrender.com/api/external/calendar/callback`
4. Save

### 2.9 Verify Cloud Deployment

```bash
# Health check
curl https://<your-service>.onrender.com/health

# Register patient
curl -X POST https://<your-service>.onrender.com/api/auth/register/patient \
  -H "Content-Type: application/json" \
  -d '{"full_name":"Test","email":"test@example.com","password":"password123"}'

# OpenFDA integration
curl "https://<your-service>.onrender.com/api/external/fda/drug?name=amoxicillin" \
  -H "Authorization: Bearer <token>"
```

---

## Part 3 — Continuous Deployment

Render auto-deploys when you push to `main`:

```bash
git add .
git commit -m "Update feature"
git push
```

Render detects the push → rebuilds → redeploys automatically.

---

## Part 4 — Screenshots Checklist (for report)

- [ ] Local `npm run dev` success
- [ ] `psql \dt` shows 5 tables
- [ ] GitHub repo with 27 files
- [ ] Render PostgreSQL "Available"
- [ ] Render Web Service "Live"
- [ ] Cloud `/health` returns JSON
- [ ] Cloud register patient returns token
- [ ] Cloud OpenFDA returns 5 results
- [ ] Cloud SMS sent
- [ ] Cloud Google Calendar event visible

---

## Troubleshooting

| Problem | Solution |
|---|---|
| `psql: command not found` | Add `C:\Program Files\PostgreSQL\17\bin` to PATH |
| `database does not exist` | Run `createdb healthcare_db` |
| `relation "patient" does not exist` | Import `schema.sql` |
| `ECONNREFUSED` | Start PostgreSQL service |
| Render 502 | Check logs, verify env vars |
| Free instance sleeping | Wait 30–50s for first request |