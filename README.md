# Parent-School Platform (Web + AI)

A modular parent-school communication and student performance monitoring platform with:

- **Frontend**: React + Vite
- **Backend API**: Node.js + Express + Sequelize + MySQL
- **AI Service**: Python + FastAPI + scikit-learn

The system is implemented in two stages:

1. Full working non-AI platform (auth, RBAC, dashboards, operations, notifications, reports)
2. AI add-on for at-risk prediction and summary insights

---

## Monorepo structure

```text
/backend      # REST API, RBAC, DB models, notifications, reports, AI proxy endpoints
/frontend     # Role-based UI (Parent, Teacher, Admin, Director)
/ai-service   # ML model training/prediction/summary service
```

---

## 1) Backend setup

### Install

```bash
cd backend
npm install
```

### Environment

```bash
cp .env.example .env
```

Update `.env` values for MySQL and JWT as needed.

### Database

Create database in MySQL and run schema:

```bash
mysql -u root -p < scripts/schema.sql
```

Optional seed:

```bash
npm run seed
```

### Run

```bash
npm run dev
```

Backend default URL: `http://localhost:4000`

Health check: `GET /api/health`

---

## 2) Frontend setup

### Install

```bash
cd frontend
npm install
```

### Environment

```bash
cp .env.example .env
```

Default API base URL is `http://localhost:4000/api`.

### Run

```bash
npm run dev
```

Frontend default URL: `http://localhost:5173`

---

## 3) AI service setup

### Install

```bash
cd ai-service
python3 -m pip install --user -r requirements.txt
```

### Run

```bash
python3 main.py
```

AI service default URL: `http://localhost:8001`

---

## Core features delivered

### Authentication & RBAC

- Register/Login with JWT
- Roles: `parent`, `teacher`, `admin`, `director`
- Route-level authorization middleware

### Entities and normalized schema

- Users
- Students
- ParentStudent (many-to-many)
- TeacherStudent (many-to-many)
- Attendance
- Grades
- BehaviorReports
- Notifications
- SystemSettings

### Teacher workflows

- View assigned students
- Record attendance
- Record grades
- Record behavior reports

### Parent workflows

- View linked students
- View child progress details and summaries

### Admin workflows

- Manage users
- Manage students
- Assign parent/teacher relationships
- Manage system settings
- Registration/account creation is managed by admin through the admin dashboard

### Director workflows

- Access school-wide system summaries and reports
- Access AI insights and training controls
- View notifications and reporting dashboards

### Reports

- Student report endpoint
- Class summary endpoint
- System summary endpoint
- My-summary endpoint (role-aware)

### Notifications (near real-time)

- In-app notifications table + APIs
- Generated when teacher records attendance/grades/behavior
- Frontend polls notifications periodically

### AI integration (after core system)

- FastAPI ML service:
  - `POST /train`
  - `POST /predict`
  - `POST /summary`
- Backend AI endpoints:
  - `GET /api/ai/risk-summary`
  - `POST /api/ai/train` (admin)
  - `GET /api/ai/summary`
- Predicts at-risk level from attendance, grade, and behavior features

---

## Notes

- Backend does not auto-sync schema by default (`DB_SYNC=false`) to protect production-like data.
- Use SQL schema/migrations first, then seed data.
- Recommended production hardening:
  - stronger password policy
  - refresh token flow
  - stricter CORS and secure cookies
  - audit logging
