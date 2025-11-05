# Rate The Doctor & Hospital - Executive Summary

## Project Overview

**Rate The Doctor & Hospital** is a comprehensive medical directory platform for South Africa (with future expansion to India), connecting patients with verified doctors and hospitals. The platform features a unique **preloaded hospital database** with claim workflows, tiered promotion systems, and comprehensive verification processes.

**Founder**: Mohammed Amanjeee (Honours in Computer Science)  
**Platform**: Web (Next.js) + Mobile (Flutter iOS/Android) + Shared Backend (FastAPI)  
**Launch Strategy**: Start with one city (Johannesburg), expand nationally, then internationally

## Core Innovation: Preloaded Hospital Database

### Hospital Preload Strategy
- **Preloaded Database**: All major public and private hospitals pre-loaded into the system
- **Unclaimed State**: Hospitals start as `claimed=false`, `verification_status=pending`
- **Claim Workflow**: Hospitals can claim their profile via email invitation or dashboard login
- **Verification Required**: Only claimed + verified hospitals appear in active search results
- **Encouragement Mechanism**: Unclaimed hospitals shown as placeholder (greyed out) to encourage claiming

### Preloaded Hospitals (South Africa)
- **Public Hospitals**: All major provincial hospitals (Baragwanath, Groote Schuur, Addington, etc.)
- **Private Hospital Groups**: Netcare, Mediclinic, Life Healthcare, Clinix, etc.
- **Major Clinics**: Private clinics, day hospitals, specialty centers
- **Total**: 500+ hospitals pre-loaded across major cities

## Key Features

### For Patients
1. **Search Doctors**: By specialization, location, rating, medical aid acceptance
2. **Search Hospitals**: By type, city, rating, services, emergency availability
3. **Verified Reviews**: Only from patients who booked/attended appointments
4. **Booking System**: Direct appointment booking with calendar integration
5. **Mobile App**: Mandatory login, seamless sync with web

### For Doctors
1. **Professional Dashboard**: Manage profile, calendar, reviews, subscriptions
2. **Subscription Plans**: Free, Standard (R299/mo), Premium (R799/mo)
3. **Promoted Listings**: Premium doctors appear first in search results
4. **Verification**: HPCSA verification + document upload + admin review

### For Hospitals
1. **Claim Profile**: Claim preloaded hospital via email/dashboard
2. **Verification Workflow**: Upload documents (license, registration) → Admin review → Verified
3. **Promotion Tiers**:
   - **Basic**: Regular listing (free for verified hospitals)
   - **Standard**: Featured for 7 days (R1,999)
   - **Premium**: Featured for 30 days + Highlighted (R7,999)
4. **Hospital Dashboard**: Manage profile, services, promotions, analytics, reviews
5. **Analytics**: Profile views, booking inquiries, revenue tracking

## Technology Stack

### Frontend (Web)
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Features**: SSR, responsive, SEO-optimized

### Frontend (Mobile)
- **Framework**: Flutter (iOS + Android)
- **State**: Provider/Riverpod
- **Maps**: Google Maps
- **Auth**: Firebase Auth + JWT

### Backend
- **Framework**: FastAPI (Python 3.11+)
- **Database**: PostgreSQL 15 + PostGIS
- **Cache**: Redis
- **ORM**: SQLAlchemy
- **Auth**: JWT + Firebase Auth

### Infrastructure
- **Hosting**: Vercel (web), Google Cloud Run / AWS Lambda (backend)
- **Storage**: AWS S3 / Firebase Storage
- **Payments**: PayFast / Yoco / Paystack (South Africa)
- **Maps**: Google Maps API
- **Notifications**: Twilio SMS, Firebase Cloud Messaging

## Monetization Strategy

1. **Hospital Promotions**:
   - Standard: R1,999 for 7-day featured placement
   - Premium: R7,999 for 30-day featured + highlighted
   - Recurring or one-time payments

2. **Doctor Subscriptions**:
   - Free: Basic listing
   - Standard: R299/mo (enhanced visibility)
   - Premium: R799/mo (featured/promoted)

3. **Booking Commissions**: Percentage of booking fees (if applicable)

4. **Telehealth Fees**: Platform fee for video consultations

## Verification & Security

- **Doctors**: HPCSA verification + document upload + admin review
- **Hospitals**: License verification + document upload + admin review
- **Patients**: Email + phone OTP verification (required for reviews)
- **POPIA Compliance**: Data encryption, retention policies, user rights
- **Audit Logging**: All claim, verification, and payment actions logged

## Development Roadmap (0-12 Weeks MVP)

### Weeks 1-2: Foundation
- Database setup with preloaded hospitals
- Backend API structure
- Authentication system

### Weeks 3-4: Core Features
- Hospital search and filtering
- Doctor search (existing)
- Hospital claim workflow
- Basic verification process

### Weeks 5-6: Payment Integration
- PayFast/Yoco integration
- Promotion tier management
- Payment webhooks
- Subscription tracking

### Weeks 7-8: Verification & Admin
- Admin verification dashboard
- Document upload to S3
- Hospital verification workflow
- Email notifications

### Weeks 9-10: Mobile App
- Flutter app development
- Hospital search screens
- Claim workflow in mobile
- Cross-platform sync

### Weeks 11-12: Launch Prep
- UI/UX refinements
- Performance optimization
- Security audit
- Beta testing with 10-20 hospitals
- Launch in Johannesburg

## Success Metrics

- **Hospitals**: 100+ claimed hospitals in first 3 months
- **Doctors**: 200+ verified doctors in first 3 months
- **Users**: 5,000+ registered patients in first 3 months
- **Promotions**: 20+ hospital promotions in first month
- **Revenue**: R100,000+ MRR by month 6

## Competitive Advantage

1. **Preloaded Hospitals**: Immediate value, no empty database
2. **Claim Workflow**: Easy for hospitals to join
3. **Tiered Promotions**: Fair monetization for featured placement
4. **Dual Focus**: Doctors + Hospitals in unified platform
5. **South African Focus**: Local payment providers, HPCSA integration
6. **Verification**: Strict verification builds trust

---

**Status**: Complete production-ready scaffold with all components

