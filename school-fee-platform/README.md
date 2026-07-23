# School Fee Platform (Standalone)

A standalone school fee payment application with:

- Frontend: Next.js + Tailwind + shadcn/ui
- Backend: Django + Django REST Framework
- Database: PostgreSQL (with SQLite fallback for local quick start)
- Payment gateway: SIKINAPAY

## Features

- Parent registration and JWT login
- One parent linked to multiple children
- Parent dashboard with fee category breakdown
- Payment initiation through SIKINAPAY API
- Webhook-based payment confirmation
- Automatic PDF receipt generation
- Staff dashboard for payment status and manual payment marking
- CSV export for transaction reports

## Backend setup

```bash
cd backend
cp .env.example .env
python3 -m pip install --user -r requirements.txt
python3 manage.py makemigrations
python3 manage.py migrate
python3 manage.py seed_demo_data
python3 manage.py runserver 0.0.0.0:8000
```

Demo users:

- Parent: `parent@demo.com` / `DemoPass123!`
- Staff: `staff@demo.com` / `DemoPass123!`

## Frontend setup

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

App URL: `http://localhost:3000`

## SIKINAPAY notes

- Set `SIKINAPAY_MOCK_MODE=false` to use real gateway calls.
- Configure `SIKINAPAY_SECRET_KEY` and `SIKINAPAY_WEBHOOK_SECRET`.
- Webhook endpoint:
  - `POST /api/payments/sikinapay/webhook/`

## Important implementation details

- Payment amounts are server-calculated from outstanding student fees.
- Duplicate webhooks are idempotently handled via `(provider, event_reference)` uniqueness.
- Successful settlement updates `StudentFee.amount_paid` and generates a receipt PDF under `media/receipts/`.
