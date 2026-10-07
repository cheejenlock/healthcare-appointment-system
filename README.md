# Healthcare Appointment & Patient Management System

A production-ready **Express.js** backend integrated with **PostgreSQL**, **JWT authentication**, and **3 external APIs** (OpenFDA, Twilio/Textbelt SMS, Google Calendar).

---

## 🌐 Live Deployment

- **Backend API**: https://healthcare-appointment-system-5cob.onrender.com
- **Health Check**: https://healthcare-appointment-system-5cob.onrender.com/health
- **GitHub Repo**: https://github.com/cheejenlock/healthcare-appointment-system

---

## 🏗️ Architecture

```
┌──────────────┐      ┌─────────────────┐      ┌──────────────────┐
│   Client     │─────▶│  Express.js     │─────▶│   PostgreSQL     │
│  (REST API)  │      │  API Gateway    │      │   (5 tables)     │
└──────────────┘      └────────┬────────┘      └──────────────────┘
                               │
                  ┌────────────┼────────────┐
                  ▼            ▼            ▼
             ┌─────────┐  ┌─────────┐  ┌────────────┐
             │ OpenFDA │  │  SMS    │  │  Google    │
             │  API    │  │ Twilio/ │  │  Calendar  │
             │         │  │Textbelt │  │    API     │
             └─────────┘  └─────────┘  └────────────┘
```

---

## 🚀 Local Setup

### 1. Prerequisites

- Node.js >= 18
- PostgreSQL >= 15
- Git

### 2. Clone & Install

```bash
git clone https://github.com/cheejenlock/healthcare-appointment-system.git
cd healthcare-appointment-system
npm install
```

### 3. Configure `.env`

Create a `.env` file in the project root:

```env
PORT=5000
NODE_ENV=development

DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/healthcare_db

JWT_SECRET=dev_secret_change_me_12345
JWT_EXPIRES_IN=1d

OPENFDA_BASE_URL=https://api.fda.gov
TEXTBELT_KEY=textbelt
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=http://localhost:5000/api/external/calendar/callback
```

### 4. Create Database & Import Schema

```bash
createdb -U postgres healthcare_db
psql -U postgres -d healthcare_db -f server/sql/schema.sql
```

### 5. Run

```bash
npm run dev      # development (nodemon)
npm start        # production
```

Server starts at `http://localhost:5000`.

Test: `curl http://localhost:5000/health`

---

## 📡 API Endpoints

### Authentication
| Method | Path | Description |
|---|---|---|
| POST | `/api/auth/register/patient` | Register patient |
| POST | `/api/auth/register/doctor` | Register doctor |
| POST | `/api/auth/login` | Login (JWT) |
| GET  | `/api/auth/me` | Get current user (JWT) |

### Core CRUD
| Method | Path | Description |
|---|---|---|
| GET/POST/PUT/DELETE | `/api/patients` | Patient CRUD |
| GET/POST/PUT/DELETE | `/api/doctors` | Doctor CRUD |
| GET/POST/PUT/DELETE | `/api/appointments` | Appointment CRUD (transactional) |
| GET/POST/PUT/DELETE | `/api/prescriptions` | Prescription CRUD (new feature) |

### External APIs
| Method | Path | Description |
|---|---|---|
| GET  | `/api/external/fda/drug?name=amoxicillin` | OpenFDA drug lookup |
| POST | `/api/external/sms/test` | Send test SMS (Textbelt/Twilio) |
| GET  | `/api/external/calendar/auth` | Get Google OAuth URL |
| GET  | `/api/external/calendar/callback` | OAuth callback |
| POST | `/api/external/calendar/sync/:id` | Sync appointment to Google Calendar |

---

## ☁️ Cloud Deployment (Render)

This project is deployed on **Render** with:

- **Web Service**: Node.js runtime (Free plan)
- **PostgreSQL Database**: 90-day free trial
- **Auto-deploy** from GitHub `main` branch

### Deploy Steps (Summary)

1. Push code to GitHub
2. Render → **New +** → **PostgreSQL** → create `healthcare-db`
3. Render → **New +** → **Web Service** → connect GitHub repo
4. Set **Build Command** = `npm install`
5. Set **Start Command** = `node server/index.js`
6. Add environment variables (see `.env.example`)
7. Click **Deploy web service**

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed steps.

---

## 🔒 Security

- **Password hashing**: bcrypt (12 rounds)
- **Authentication**: JWT Bearer tokens
- **SQL injection prevention**: parameterised queries (`$1, $2, ...`)
- **Input validation**: express-validator
- **HTTP headers**: Helmet.js
- **Rate limiting**: express-rate-limit (200 req / 15 min)

---

## 📦 Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js 4
- **Database**: PostgreSQL 17
- **Auth**: jsonwebtoken + bcryptjs
- **Validation**: express-validator
- **External APIs**: axios (OpenFDA, Textbelt), googleapis (Calendar), twilio
- **Deployment**: Render.com

---

## 📄 License

MIT — for academic use (DIT2324 Web Application Development, QIU).