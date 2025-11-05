# RateTheDoctor - Architecture Diagrams

This document contains visual architecture diagrams for the RateTheDoctor system.

## System Overview Diagram

```mermaid
graph TB
    subgraph "Clients"
        WEB[Web App<br/>React + TypeScript<br/>Vercel]
        MOBILE[Mobile App<br/>Flutter<br/>iOS/Android]
    end

    subgraph "Edge Layer"
        CDN[CDN<br/>Static Assets]
        LB[Load Balancer]
    end

    subgraph "API Gateway"
        GATEWAY[API Gateway<br/>Express.js<br/>Rate Limiting<br/>CORS<br/>Auth]
    end

    subgraph "Authentication"
        FIREBASE[Firebase Auth<br/>JWT Tokens<br/>RBAC]
    end

    subgraph "Backend Services"
        API[Backend API<br/>FastAPI/Node.js<br/>Cloud Run/Lambda]
        
        AUTH[Auth Service]
        DOCTOR[Doctor Service]
        BOOKING[Booking Service]
        PAYMENT[Payment Service]
        AI[AI Service]
        NOTIFY[Notification Service]
        MAPS[Maps Service]
    end

    subgraph "Data Layer"
        POSTGRES[(PostgreSQL<br/>Primary DB<br/>Cloud SQL/RDS)]
        REDIS[(Redis<br/>Cache & Sessions<br/>Memorystore)]
        STORAGE[Cloud Storage<br/>Images & Documents<br/>GCS/S3]
    end

    subgraph "External Services"
        OPENAI[OpenAI API<br/>GPT-4/3.5]
        GMAPS[Google Maps<br/>Places, Directions]
        PAYSTACK[Paystack<br/>Payments]
        STRIPE[Stripe<br/>Payments]
        TWILIO[Twilio<br/>SMS]
        FCM[Firebase Cloud<br/>Messaging]
    end

    subgraph "Monitoring"
        MONITOR[APM<br/>New Relic/Datadog]
        LOGS[Logging<br/>CloudWatch/Stackdriver]
        SENTRY[Sentry<br/>Error Tracking]
    end

    WEB --> CDN
    MOBILE --> CDN
    CDN --> LB
    LB --> GATEWAY
    GATEWAY --> FIREBASE
    GATEWAY --> API
    
    API --> AUTH
    API --> DOCTOR
    API --> BOOKING
    API --> PAYMENT
    API --> AI
    API --> NOTIFY
    API --> MAPS
    
    AUTH --> FIREBASE
    AUTH --> POSTGRES
    DOCTOR --> POSTGRES
    DOCTOR --> STORAGE
    BOOKING --> POSTGRES
    BOOKING --> REDIS
    PAYMENT --> PAYSTACK
    PAYMENT --> STRIPE
    PAYMENT --> POSTGRES
    AI --> OPENAI
    AI --> POSTGRES
    NOTIFY --> TWILIO
    NOTIFY --> FCM
    NOTIFY --> POSTGRES
    MAPS --> GMAPS
    MAPS --> POSTGRES
    
    API --> REDIS
    API --> POSTGRES
    
    API --> MONITOR
    API --> LOGS
    API --> SENTRY
```

## Data Flow Diagram - Booking Creation

```mermaid
sequenceDiagram
    participant User
    participant WebApp
    participant Gateway
    participant BookingService
    participant PaymentService
    participant NotificationService
    participant Database
    participant Paystack

    User->>WebApp: Select doctor & time slot
    WebApp->>Gateway: POST /api/v1/bookings
    Gateway->>Gateway: Validate auth token
    Gateway->>BookingService: Create booking request
    
    BookingService->>Database: Check availability
    Database-->>BookingService: Availability confirmed
    
    BookingService->>Database: Create booking record
    Database-->>BookingService: Booking created
    
    BookingService->>PaymentService: Initiate payment
    PaymentService->>Paystack: Create payment intent
    Paystack-->>PaymentService: Payment intent created
    
    PaymentService-->>BookingService: Payment initiated
    BookingService-->>Gateway: Booking created (pending payment)
    Gateway-->>WebApp: Booking response
    WebApp-->>User: Show payment form
    
    User->>WebApp: Complete payment
    WebApp->>Paystack: Process payment
    Paystack-->>PaymentService: Webhook: payment.success
    PaymentService->>Database: Update booking status
    PaymentService->>NotificationService: Send confirmations
    NotificationService->>User: SMS & Email confirmation
    NotificationService->>Doctor: SMS & Email notification
```

## Data Flow Diagram - Doctor Search

```mermaid
sequenceDiagram
    participant User
    participant WebApp
    participant Gateway
    participant DoctorService
    participant MapsService
    participant AIService
    participant Database
    participant Redis
    participant GoogleMaps

    User->>WebApp: Search doctors with filters
    WebApp->>Gateway: GET /api/v1/doctors?specialty=cardiology&location=...
    Gateway->>Gateway: Validate auth
    Gateway->>DoctorService: Search request
    
    DoctorService->>Redis: Check cache
    alt Cache Hit
        Redis-->>DoctorService: Cached results
    else Cache Miss
        DoctorService->>Database: Query doctors
        Database-->>DoctorService: Doctor records
        DoctorService->>Redis: Cache results
    end
    
    DoctorService->>MapsService: Calculate distances
    MapsService->>GoogleMaps: Distance Matrix API
    GoogleMaps-->>MapsService: Distance data
    MapsService-->>DoctorService: Enriched results
    
    opt AI Recommendations Enabled
        DoctorService->>AIService: Get recommendations
        AIService->>AIService: Analyze user preferences
        AIService-->>DoctorService: Recommended doctors
    end
    
    DoctorService-->>Gateway: Doctor list with distances
    Gateway-->>WebApp: Response
    WebApp-->>User: Display results
```

## Component Interaction Diagram

```mermaid
graph LR
    subgraph "Frontend Layer"
        REACT[React Web App]
        FLUTTER[Flutter Mobile App]
    end

    subgraph "API Layer"
        GATEWAY[API Gateway]
    end

    subgraph "Service Layer"
        AUTH[Auth Service]
        DOCTOR[Doctor Service]
        BOOKING[Booking Service]
        PAYMENT[Payment Service]
        AI[AI Service]
        NOTIFY[Notification Service]
    end

    subgraph "Data Layer"
        POSTGRES[(PostgreSQL)]
        REDIS[(Redis)]
        STORAGE[Cloud Storage]
    end

    subgraph "External APIs"
        FIREBASE[Firebase Auth]
        OPENAI[OpenAI]
        PAYSTACK[Paystack]
        GMAPS[Google Maps]
        TWILIO[Twilio]
    end

    REACT --> GATEWAY
    FLUTTER --> GATEWAY
    
    GATEWAY --> AUTH
    GATEWAY --> DOCTOR
    GATEWAY --> BOOKING
    GATEWAY --> PAYMENT
    GATEWAY --> AI
    GATEWAY --> NOTIFY
    
    AUTH --> FIREBASE
    AUTH --> POSTGRES
    AUTH --> REDIS
    
    DOCTOR --> POSTGRES
    DOCTOR --> REDIS
    DOCTOR --> STORAGE
    DOCTOR --> GMAPS
    
    BOOKING --> POSTGRES
    BOOKING --> REDIS
    BOOKING --> NOTIFY
    
    PAYMENT --> PAYSTACK
    PAYMENT --> POSTGRES
    
    AI --> OPENAI
    AI --> POSTGRES
    
    NOTIFY --> TWILIO
    NOTIFY --> POSTGRES
```

## Security Architecture

```mermaid
graph TB
    subgraph "Client"
        BROWSER[Browser/App]
    end

    subgraph "Edge Security"
        WAF[Web Application Firewall]
        DDoS[DDoS Protection]
        CDN[CDN with HTTPS]
    end

    subgraph "API Security"
        GATEWAY[API Gateway<br/>Rate Limiting]
        AUTH[Authentication<br/>Firebase Auth]
        RBAC[Authorization<br/>Role-Based Access]
    end

    subgraph "Application Security"
        VALIDATION[Input Validation]
        ENCRYPTION[Data Encryption<br/>AES-256]
        SANITIZATION[XSS/CSRF Protection]
    end

    subgraph "Data Security"
        DB_ENCRYPT[Database Encryption<br/>At Rest]
        TLS[TLS 1.3<br/>In Transit]
        BACKUP[Encrypted Backups]
    end

    subgraph "Compliance"
        POPIA[POPIA Compliance<br/>Data Protection]
        AUDIT[Audit Logging]
        RETENTION[Data Retention<br/>Policies]
    end

    BROWSER --> WAF
    WAF --> DDoS
    DDoS --> CDN
    CDN --> GATEWAY
    GATEWAY --> AUTH
    AUTH --> RBAC
    RBAC --> VALIDATION
    VALIDATION --> ENCRYPTION
    ENCRYPTION --> SANITIZATION
    SANITIZATION --> DB_ENCRYPT
    DB_ENCRYPT --> TLS
    TLS --> BACKUP
    BACKUP --> POPIA
    POPIA --> AUDIT
    AUDIT --> RETENTION
```

## Deployment Architecture

```mermaid
graph TB
    subgraph "Development"
        DEV_GIT[Git Repository]
        DEV_CI[CI/CD Pipeline<br/>GitHub Actions]
        DEV_STAGING[Staging Environment]
    end

    subgraph "Production"
        PROD_GIT[Production Branch]
        PROD_CI[Production CI/CD]
        PROD_BUILD[Build & Test]
        PROD_DEPLOY[Deploy]
    end

    subgraph "Infrastructure"
        VERCEL[Vercel<br/>Frontend]
        CLOUD_RUN[Cloud Run<br/>Backend API]
        CLOUD_SQL[Cloud SQL<br/>PostgreSQL]
        MEMORYSTORE[Memorystore<br/>Redis]
        GCS[Cloud Storage<br/>Files]
    end

    subgraph "Monitoring"
        MONITOR[APM Monitoring]
        LOGS[Log Aggregation]
        ALERTS[Alerting System]
    end

    DEV_GIT --> DEV_CI
    DEV_CI --> DEV_STAGING
    
    PROD_GIT --> PROD_CI
    PROD_CI --> PROD_BUILD
    PROD_BUILD --> PROD_DEPLOY
    
    PROD_DEPLOY --> VERCEL
    PROD_DEPLOY --> CLOUD_RUN
    
    CLOUD_RUN --> CLOUD_SQL
    CLOUD_RUN --> MEMORYSTORE
    CLOUD_RUN --> GCS
    
    CLOUD_RUN --> MONITOR
    MONITOR --> LOGS
    LOGS --> ALERTS
```

## Scalability Diagram

```mermaid
graph TB
    subgraph "Client Layer"
        CLIENTS[Multiple Clients]
    end

    subgraph "Load Distribution"
        LB[Load Balancer<br/>Multi-Region]
    end

    subgraph "API Instances"
        API1[API Instance 1]
        API2[API Instance 2]
        API3[API Instance N]
    end

    subgraph "Database Layer"
        PRIMARY[(Primary DB<br/>Write)]
        REPLICA1[(Read Replica 1)]
        REPLICA2[(Read Replica 2)]
        REPLICA3[(Read Replica N)]
    end

    subgraph "Cache Layer"
        REDIS1[(Redis Cluster 1)]
        REDIS2[(Redis Cluster 2)]
    end

    CLIENTS --> LB
    LB --> API1
    LB --> API2
    LB --> API3
    
    API1 --> PRIMARY
    API1 --> REPLICA1
    API2 --> PRIMARY
    API2 --> REPLICA2
    API3 --> PRIMARY
    API3 --> REPLICA3
    
    API1 --> REDIS1
    API2 --> REDIS2
    API3 --> REDIS1
```

## Microservices Communication

```mermaid
graph TB
    subgraph "API Gateway"
        GATEWAY[Gateway]
    end

    subgraph "Sync Communication"
        AUTH[Auth Service]
        DOCTOR[Doctor Service]
        BOOKING[Booking Service]
        PAYMENT[Payment Service]
    end

    subgraph "Async Communication"
        QUEUE[Message Queue<br/>RabbitMQ/SQS]
        AI[AI Service]
        NOTIFY[Notification Service]
        ANALYTICS[Analytics Service]
    end

    subgraph "Event Bus"
        EVENTS[Event Bus<br/>Pub/Sub]
    end

    GATEWAY -->|HTTP/REST| AUTH
    GATEWAY -->|HTTP/REST| DOCTOR
    GATEWAY -->|HTTP/REST| BOOKING
    GATEWAY -->|HTTP/REST| PAYMENT
    
    BOOKING -->|Publish| EVENTS
    PAYMENT -->|Publish| EVENTS
    
    EVENTS -->|Subscribe| QUEUE
    QUEUE --> AI
    QUEUE --> NOTIFY
    QUEUE --> ANALYTICS
```

