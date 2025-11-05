# RateTheDoctor Backend API

Production-grade backend API for RateTheDoctor platform built with Node.js/Express or FastAPI (Python).

## Architecture

```
backend/
├── src/
│   ├── api/              # API routes
│   │   ├── v1/
│   │   │   ├── auth/
│   │   │   ├── doctors/
│   │   │   ├── bookings/
│   │   │   ├── reviews/
│   │   │   ├── payments/
│   │   │   ├── ai/
│   │   │   └── notifications/
│   ├── services/          # Business logic
│   │   ├── auth.service.ts
│   │   ├── doctor.service.ts
│   │   ├── booking.service.ts
│   │   ├── payment.service.ts
│   │   ├── ai.service.ts
│   │   └── notification.service.ts
│   ├── models/           # Database models (Prisma)
│   ├── middleware/       # Express/FastAPI middleware
│   │   ├── auth.middleware.ts
│   │   ├── validation.middleware.ts
│   │   ├── error.middleware.ts
│   │   └── rate-limit.middleware.ts
│   ├── utils/            # Utility functions
│   │   ├── logger.ts
│   │   ├── encryption.ts
│   │   └── validation.ts
│   ├── config/           # Configuration
│   │   ├── database.ts
│   │   ├── firebase.ts
│   │   └── redis.ts
│   └── types/            # TypeScript types
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── migrations/       # Database migrations
├── tests/                # Test files
├── .env.example          # Environment variables template
├── package.json          # Node.js dependencies
└── Dockerfile           # Docker configuration
```

## Technology Stack

### Option 1: Node.js/Express
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **ORM**: Prisma
- **Language**: TypeScript

### Option 2: FastAPI (Python)
- **Runtime**: Python 3.11+
- **Framework**: FastAPI
- **ORM**: SQLAlchemy or Prisma (via Prisma Client Python)
- **Language**: Python

## Setup

### Prerequisites
- Node.js 18+ or Python 3.11+
- PostgreSQL 15+
- Redis 7+
- npm/yarn or pip

### Installation

#### Node.js/Express
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npx prisma generate
npx prisma migrate dev
npm run dev
```

#### FastAPI
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your configuration
prisma generate
prisma migrate dev
uvicorn main:app --reload
```

## Environment Variables

See `docs/INTEGRATIONS.md` for complete environment variable list.

Required variables:
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string
- `FIREBASE_PROJECT_ID` - Firebase project ID
- `JWT_SECRET` - JWT secret key
- `PAYSTACK_SECRET_KEY` - Paystack secret key
- `OPENAI_API_KEY` - OpenAI API key
- `GOOGLE_MAPS_API_KEY` - Google Maps API key

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/logout` - User logout
- `POST /api/v1/auth/refresh` - Refresh token
- `GET /api/v1/auth/me` - Get current user

### Doctors
- `GET /api/v1/doctors` - Search doctors (with filters)
- `GET /api/v1/doctors/:id` - Get doctor details
- `POST /api/v1/doctors` - Create doctor profile (Doctor only)
- `PUT /api/v1/doctors/:id` - Update doctor profile
- `GET /api/v1/doctors/:id/availability` - Get availability
- `PUT /api/v1/doctors/:id/availability` - Update availability

### Bookings
- `GET /api/v1/bookings` - Get user bookings
- `GET /api/v1/bookings/:id` - Get booking details
- `POST /api/v1/bookings` - Create booking
- `PUT /api/v1/bookings/:id` - Update booking
- `DELETE /api/v1/bookings/:id` - Cancel booking

### Reviews
- `GET /api/v1/reviews` - Get reviews (with filters)
- `GET /api/v1/reviews/:id` - Get review details
- `POST /api/v1/reviews` - Create review
- `PUT /api/v1/reviews/:id` - Update review
- `DELETE /api/v1/reviews/:id` - Delete review

### Payments
- `POST /api/v1/payments/initiate` - Initiate payment
- `POST /api/v1/payments/verify` - Verify payment
- `POST /api/v1/payments/subscriptions` - Create subscription
- `GET /api/v1/payments/subscriptions` - Get subscriptions
- `DELETE /api/v1/payments/subscriptions/:id` - Cancel subscription

### AI Services
- `POST /api/v1/ai/symptom-checker` - Symptom checker
- `POST /api/v1/ai/analyze-sentiment` - Analyze review sentiment
- `POST /api/v1/ai/suggest-reply` - Suggest auto-reply
- `POST /api/v1/ai/recommend-doctors` - Get doctor recommendations

### Notifications
- `GET /api/v1/notifications` - Get user notifications
- `PUT /api/v1/notifications/:id/read` - Mark as read
- `POST /api/v1/notifications/preferences` - Update preferences

## Database Migrations

### Create Migration
```bash
npx prisma migrate dev --name migration_name
```

### Apply Migrations
```bash
npx prisma migrate deploy
```

### Reset Database
```bash
npx prisma migrate reset
```

## Testing

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage

# E2E tests
npm run test:e2e
```

## Deployment

### Docker
```bash
docker build -t ratethedoctor-backend .
docker run -p 3000:3000 --env-file .env ratethedoctor-backend
```

### Google Cloud Run
```bash
gcloud run deploy ratethedoctor-backend \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

### AWS Lambda
See `serverless.yml` for serverless configuration.

## Monitoring

- **Logging**: Winston (Node.js) or structlog (Python)
- **Error Tracking**: Sentry
- **APM**: New Relic or Datadog
- **Health Checks**: `/health` endpoint

## Security

- **Authentication**: Firebase Auth + JWT
- **Authorization**: Role-based access control (RBAC)
- **Input Validation**: Zod (Node.js) or Pydantic (Python)
- **Rate Limiting**: Express-rate-limit or slowapi
- **CORS**: Configured for production domains
- **Helmet**: Security headers
- **Encryption**: AES-256 for sensitive data

## API Documentation

- **Swagger/OpenAPI**: Available at `/api/docs`
- **Postman Collection**: Available in `/docs/postman`

