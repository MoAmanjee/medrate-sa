# Rate The Doctor & Hospital - Complete Architecture

## System Architecture Diagram

```mermaid
graph TB
    subgraph "Client Layer"
        WEB[Web App<br/>Next.js + TypeScript<br/>Optional Login]
        MOBILE[Mobile App<br/>Flutter<br/>Mandatory Login]
    end

    subgraph "API Gateway"
        GATEWAY[API Gateway<br/>FastAPI<br/>Rate Limiting<br/>CORS<br/>Authentication]
    end

    subgraph "Backend Services"
        AUTH[Auth Service<br/>JWT + Firebase]
        DOCTOR[Doctor Service<br/>HPCSA Verification]
        HOSPITAL[Hospital Service<br/>Claim Workflow<br/>Promotions]
        BOOKING[Booking Service<br/>Calendar Sync]
        REVIEW[Review Service<br/>AI Moderation]
        PAYMENT[Payment Service<br/>PayFast/Yoco]
        PROMO[Promotion Service<br/>Tier Management]
        VERIFY[Verification Service<br/>Admin Review]
    end

    subgraph "Data Layer"
        POSTGRES[(PostgreSQL<br/>+ PostGIS<br/>Preloaded Hospitals)]
        REDIS[(Redis<br/>Cache & Sessions)]
        S3[(AWS S3<br/>Documents & Images)]
    end

    subgraph "External Services"
        HPCSA[HPCSA API<br/>Doctor Verification]
        PAYFAST[PayFast<br/>Payments]
        YOCO[Yoco<br/>Payments]
        TWILIO[Twilio<br/>SMS & Video]
        FIREBASE[Firebase<br/>Auth & Storage]
        GMAPS[Google Maps<br/>Location Services]
    end

    subgraph "Admin & Analytics"
        ADMIN[Admin Dashboard<br/>Verification & Claims]
        HOSP_DASH[Hospital Dashboard<br/>Profile & Promotions]
        DOC_DASH[Doctor Dashboard<br/>Profile & Bookings]
    end

    WEB --> GATEWAY
    MOBILE --> GATEWAY
    ADMIN --> GATEWAY
    HOSP_DASH --> GATEWAY
    DOC_DASH --> GATEWAY

    GATEWAY --> AUTH
    GATEWAY --> DOCTOR
    GATEWAY --> HOSPITAL
    GATEWAY --> BOOKING
    GATEWAY --> REVIEW
    GATEWAY --> PAYMENT
    GATEWAY --> PROMO
    GATEWAY --> VERIFY

    AUTH --> POSTGRES
    AUTH --> REDIS
    AUTH --> FIREBASE
    DOCTOR --> POSTGRES
    DOCTOR --> HPCSA
    DOCTOR --> S3
    HOSPITAL --> POSTGRES
    HOSPITAL --> PAYMENT
    BOOKING --> POSTGRES
    BOOKING --> TWILIO
    REVIEW --> POSTGRES
    PAYMENT --> PAYFAST
    PAYMENT --> YOCO
    PROMO --> POSTGRES
    VERIFY --> POSTGRES
    VERIFY --> S3

    HOSPITAL --> GMAPS
    DOCTOR --> GMAPS
```

## Data Flow

### Hospital Claim Flow
1. **Preload**: Hospitals inserted into DB as `claimed=false`
2. **Claim Initiation**: Hospital admin requests claim via email/dashboard
3. **Token Generation**: System generates unique claim token
4. **Email Verification**: Admin receives email with claim link
5. **Document Upload**: Admin uploads license, registration, ID
6. **Admin Review**: Admin verifies documents
7. **Activation**: Hospital marked as `claimed=true`, `verified=true`

### Promotion Purchase Flow
1. **Selection**: Hospital admin selects promotion tier (Standard/Premium)
2. **Payment**: Redirect to PayFast/Yoco checkout
3. **Webhook**: Payment provider sends webhook on success
4. **Activation**: System creates `hospital_promotions` record
5. **Trigger**: Database trigger updates `is_featured=true`
6. **Display**: Hospital appears first in search results

### Search Flow
1. **User Input**: Patient enters search query + filters
2. **API Call**: Frontend calls `/api/hospitals/search`
3. **Filtering**: Backend filters by:
   - City, type, rating
   - `claimed=true` AND `verification_status=verified` (default)
4. **Sorting**: Featured first, then by rating
5. **Response**: Paginated results with hospital details

## Component Descriptions

### Hospital Service
- **Search**: Filtered search with geolocation
- **Claim Management**: Initiate, verify, complete claims
- **Promotion Management**: Purchase, activate, track promotions
- **Profile Management**: Update hospital details, services

### Payment Service
- **Multi-Provider**: Supports PayFast, Yoco, Paystack
- **Webhook Handling**: Secure payment verification
- **Subscription Management**: Recurring payments for promotions
- **Invoice Generation**: PDF invoices for promotions

### Verification Service
- **Admin Dashboard**: Review queue for claims and verifications
- **Document Validation**: Check uploaded documents
- **Approval Workflow**: Approve/reject with notes
- **Audit Logging**: All actions logged

## Security Architecture

- **Authentication**: JWT tokens with refresh mechanism
- **Authorization**: Role-based access (patient, doctor, hospital_admin, admin)
- **Data Encryption**: AES-256 at rest, TLS 1.3 in transit
- **POPIA Compliance**: Data minimization, retention policies, user rights
- **Rate Limiting**: Redis-backed rate limiting per user/IP
- **Audit Trail**: Complete audit log of all actions

## Scalability

- **Horizontal Scaling**: Multiple FastAPI instances behind load balancer
- **Database**: Read replicas for search queries
- **Caching**: Redis for frequently accessed data
- **CDN**: Static assets and images via CDN
- **Queue System**: Background jobs for email/SMS (optional: Celery + RabbitMQ)

