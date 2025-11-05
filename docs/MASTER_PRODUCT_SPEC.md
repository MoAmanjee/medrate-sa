# RateTheDoctor - Master Product Specification

## Project Overview

**Name**: RateTheDoctor  
**Description**: AI-enabled doctor search, booking, and review platform for South Africa with strict doctor and patient verification workflows. Includes monetization for doctors through subscriptions and booking commissions.

## Core Features

1. **Patient Verification**: OTP + ID verification for patients
2. **Doctor Verification**: HPCSA verification + admin workflow
3. **Review Verification**: Only verified patients with completed appointments can leave "Verified Visit" reviews
4. **Subscription Plans**: Free, Standard, Featured tiers for doctors
5. **Payment Integration**: Paystack/Stripe with mock adapter
6. **AI Features**: Symptom checker, review classification (OpenAI)
7. **Maps Integration**: Google Maps with mock adapter
8. **Notifications**: Twilio/SendGrid for OTP and booking confirmations

## Technology Stack

- **Web Frontend**: Next.js 14 + Tailwind CSS + TypeScript
- **Mobile**: Flutter (Dart)
- **Backend Options**: FastAPI (Python) or Node.js (Express + TypeScript)
- **Database**: PostgreSQL 15+ with PostGIS
- **ORM**: Prisma (Node.js) or SQLAlchemy (Python)
- **Authentication**: Firebase Auth or JWT
- **Storage**: AWS S3 / Google Cloud Storage
- **Payments**: Paystack (primary) / Stripe (alternative)
- **Maps**: Google Maps API
- **AI**: OpenAI API (GPT-4/3.5)
- **Notifications**: Twilio (SMS) / SendGrid (Email) / FCM (Push)

## Environment Variables

```bash
# Application
NODE_ENV=production
PORT=3000
API_VERSION=v1

# Database
DATABASE_URL=postgresql://user:pass@host:5432/ratedoctor

# Authentication
JWT_SECRET=your-secret-key-here
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-client-email

# External APIs (Mockable)
HPCSA_API_URL=https://api.hpcsa.co.za/v1
HPCSA_API_KEY=your-hpcsa-key
HPCSA_MOCK_MODE=true  # Set to true to use mock adapter

OPENAI_API_KEY=sk-your-openai-key

GOOGLE_MAPS_API_KEY=your-maps-key
GOOGLE_MAPS_MOCK_MODE=true  # Set to true to use mock adapter

# Payment Providers (Switchable)
PAYMENT_PROVIDER=paystack  # Options: paystack, stripe
PAYMENT_PROVIDER_KEY=your-payment-key
PAYMENT_MOCK_MODE=true  # Set to true to use mock adapter

# Storage
S3_BUCKET=ratethedoctor-documents
S3_KEY=your-s3-key
S3_SECRET=your-s3-secret
S3_REGION=af-south-1

# Notifications
TWILIO_SID=your-twilio-sid
TWILIO_AUTH=your-twilio-auth
TWILIO_PHONE=+1234567890

SENDGRID_API_KEY=your-sendgrid-key
SENDGRID_FROM_EMAIL=noreply@ratethedoctor.co.za

FCM_SERVER_KEY=your-fcm-key

# Security
RECAPTCHA_KEY=your-recaptcha-key
RECAPTCHA_SECRET=your-recaptcha-secret

# Admin
ADMIN_SECRET_KEY=your-admin-secret
```

## Verification Workflows

### Patient Verification
1. User registers with email/phone
2. OTP sent to phone/email
3. OTP verified
4. Optional: ID document upload for "Verified Patient" status
5. Admin reviews ID (if uploaded)
6. Patient marked as verified

### Doctor Verification
1. Doctor registers with HPCSA number
2. System calls HPCSA API (or mock) to verify credentials
3. If HPCSA verification passes → status: "auto_verified"
4. If HPCSA verification fails → status: "manual_review"
5. Admin reviews documents and approves/rejects
6. Doctor marked as verified

### Review Verification
1. Only verified patients can leave reviews
2. Review must be linked to a completed appointment
3. Review marked as "Verified Visit" if appointment status is "completed"
4. Reviews without appointment are rejected

## Subscription Plans

### Free Plan
- Basic profile listing
- Limited reviews visibility
- Standard search results

### Standard Plan
- Enhanced profile
- Featured in search results
- Analytics dashboard
- Priority support

### Featured Plan
- Premium placement
- Featured banner
- Advanced analytics
- Marketing tools
- Telemedicine integration

