# RateTheDoctor - AI-Powered Doctor Locator & Booking Platform

A production-grade, full-stack healthcare platform for South Africa that enables patients to find, rate, and book appointments with verified doctors. Built with modern technologies and designed for scalability, security, and POPIA compliance.

## 🏗️ System Architecture

RateTheDoctor is built using a microservices architecture with the following components:

- **Frontend**: React (Web) + Flutter (Mobile)
- **Backend**: FastAPI (Python) or Node.js (Express)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Firebase Auth with role-based access
- **Hosting**: Vercel (Frontend) + Google Cloud Run/AWS Lambda (Backend)
- **Payments**: Paystack/Stripe for subscriptions
- **Maps**: Google Maps API for locations and directions
- **AI**: OpenAI API for symptom checker and sentiment analysis
- **Notifications**: Twilio/FCM for SMS and push notifications

## 📚 Documentation

Comprehensive documentation is available in the `/docs` directory:

1. **[System Architecture](./docs/SYSTEM_ARCHITECTURE.md)** - Complete system architecture overview
2. **[ERD (Entity Relationship Diagram)](./docs/ERD.md)** - Database schema and relationships
3. **[System Design Summary](./docs/SYSTEM_DESIGN_SUMMARY.md)** - Detailed system design documentation
4. **[Architecture Diagrams](./docs/ARCHITECTURE_DIAGRAMS.md)** - Visual architecture diagrams
5. **[Integrations](./docs/INTEGRATIONS.md)** - External service integration guide

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ or Python 3.11+
- PostgreSQL 15+
- Redis 7+
- Firebase project
- Google Cloud / AWS account

### Installation

#### Frontend (React)
```bash
cd fraud-frontend
npm install
cp env.example .env
# Configure environment variables
npm run dev
```

#### Backend
```bash
cd backend
npm install  # or pip install -r requirements.txt
cp .env.example .env
# Configure environment variables
npx prisma generate
npx prisma migrate dev
npm run dev
```

#### Database Setup
```bash
# Create PostgreSQL database
createdb ratethedoctor

# Run migrations
cd backend
npx prisma migrate dev
```

## 📁 Project Structure

```
medrate-sa/
├── docs/                    # Documentation
│   ├── SYSTEM_ARCHITECTURE.md
│   ├── ERD.md
│   ├── SYSTEM_DESIGN_SUMMARY.md
│   ├── ARCHITECTURE_DIAGRAMS.md
│   └── INTEGRATIONS.md
├── fraud-frontend/          # React Web Application
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── contexts/
│   │   └── firebase/
│   └── package.json
├── backend/                 # Backend API
│   ├── prisma/
│   │   └── schema.prisma
│   └── README.md
├── api-gateway/            # API Gateway
└── README.md               # This file
```

## 🎯 Key Features

### For Patients
- 🔍 **Doctor Search**: Advanced search with filters (specialty, location, rating, price)
- 📍 **Location Services**: Google Maps integration with directions
- 📅 **Appointment Booking**: Real-time availability and booking system
- ⭐ **Reviews & Ratings**: Rate and review doctors after appointments
- 🤖 **AI Symptom Checker**: OpenAI-powered symptom analysis and doctor recommendations
- 📱 **Mobile App**: Native iOS and Android apps with Flutter

### For Doctors
- 👨‍⚕️ **Profile Management**: Comprehensive doctor profiles with verification
- 📊 **Analytics Dashboard**: Track profile views, bookings, revenue
- 💰 **Subscription Plans**: FREE, PRO, PREMIUM tiers with features
- 📅 **Appointment Management**: Manage bookings, availability, calendar
- 💬 **AI Auto-Reply**: AI-generated response suggestions
- 🏥 **Hospital Association**: Link to multiple hospitals

### For Hospitals
- 🏥 **Hospital Profiles**: Verified hospital listings
- 📊 **Analytics**: Hospital-level analytics and insights
- 👥 **Doctor Management**: Manage associated doctors
- 💳 **Subscriptions**: Hospital subscription plans

## 🔒 Security & Compliance

### POPIA Compliance
- ✅ Encrypted data storage (AES-256)
- ✅ TLS 1.3 for data in transit
- ✅ Data retention policies
- ✅ Right to access/deletion
- ✅ Consent management
- ✅ Audit logging

### Security Features
- Firebase Authentication with JWT
- Role-based access control (RBAC)
- Input validation and sanitization
- SQL injection prevention
- XSS/CSRF protection
- Rate limiting
- DDoS protection

## 🛠️ Technology Stack

### Frontend
- **Web**: React 18, TypeScript, Tailwind CSS, Vite
- **Mobile**: Flutter (Dart), iOS & Android
- **State Management**: React Context / Provider
- **Forms**: React Hook Form + Yup validation
- **Maps**: Google Maps JavaScript API

### Backend
- **API**: FastAPI (Python) or Express.js (Node.js)
- **ORM**: Prisma (TypeScript) or SQLAlchemy (Python)
- **Database**: PostgreSQL 15+
- **Cache**: Redis 7+
- **Authentication**: Firebase Admin SDK

### Infrastructure
- **Hosting**: Vercel (Frontend), Cloud Run/Lambda (Backend)
- **Database**: Cloud SQL (PostgreSQL) / RDS
- **Storage**: Google Cloud Storage / S3
- **CDN**: Cloudflare / Vercel Edge Network

### External Services
- **Firebase**: Authentication, Cloud Messaging
- **Google Maps**: Places, Directions, Geocoding
- **Paystack/Stripe**: Payment processing
- **OpenAI**: GPT-4/3.5 for AI features
- **Twilio**: SMS notifications

## 📊 Database Schema

The system uses PostgreSQL with Prisma ORM. Key models include:

- **User**: Base user model with roles (Patient, Doctor, Admin, Hospital)
- **Doctor**: Doctor profiles with verification, ratings, subscriptions
- **Hospital**: Hospital profiles with verification
- **Booking**: Appointment bookings with payment integration
- **Review**: Reviews and ratings for doctors/hospitals
- **Subscription**: Doctor/hospital subscription management
- **Analytics**: Analytics data for doctors, hospitals, companies

See [ERD.md](./docs/ERD.md) for complete schema documentation.

## 🔌 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/logout` - User logout
- `GET /api/v1/auth/me` - Get current user

### Doctors
- `GET /api/v1/doctors` - Search doctors
- `GET /api/v1/doctors/:id` - Get doctor details
- `POST /api/v1/doctors` - Create doctor profile
- `PUT /api/v1/doctors/:id` - Update doctor profile

### Bookings
- `GET /api/v1/bookings` - Get user bookings
- `POST /api/v1/bookings` - Create booking
- `PUT /api/v1/bookings/:id` - Update booking
- `DELETE /api/v1/bookings/:id` - Cancel booking

### Reviews
- `GET /api/v1/reviews` - Get reviews
- `POST /api/v1/reviews` - Create review
- `PUT /api/v1/reviews/:id` - Update review

### Payments
- `POST /api/v1/payments/initiate` - Initiate payment
- `POST /api/v1/payments/verify` - Verify payment
- `POST /api/v1/payments/subscriptions` - Create subscription

### AI Services
- `POST /api/v1/ai/symptom-checker` - Symptom checker
- `POST /api/v1/ai/analyze-sentiment` - Analyze sentiment
- `POST /api/v1/ai/recommend-doctors` - Get recommendations

See [Backend README](./backend/README.md) for complete API documentation.

## 🧪 Testing

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage

# E2E tests
npm run test:e2e
```

## 📦 Deployment

### Frontend (Vercel)
```bash
# Deploy to Vercel
vercel deploy --prod
```

### Backend (Cloud Run)
```bash
# Build and deploy
gcloud run deploy ratethedoctor-backend \
  --source . \
  --platform managed \
  --region us-central1
```

### Database Migrations
```bash
# Run migrations
npx prisma migrate deploy
```

## 📈 Monitoring & Analytics

- **APM**: Application Performance Monitoring (New Relic/Datadog)
- **Error Tracking**: Sentry
- **Logging**: CloudWatch/Stackdriver
- **Analytics**: Custom analytics dashboard for doctors and admins

## 🔮 Future Extensions

### Phase 2: Telemedicine
- Video consultation integration (Zoom, Agora)
- E-prescription system
- Virtual waiting room

### Phase 3: Pharmacy Delivery
- Pharmacy partner integration
- Prescription verification
- Delivery tracking

### Phase 4: Health Records
- Patient health records
- Medical history tracking
- Insurance integration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is proprietary. All rights reserved.

## 👥 Team

RateTheDoctor Development Team

## 📞 Support

For support, email support@ratethedoctor.co.za or open an issue in the repository.

## 🙏 Acknowledgments

- Firebase for authentication infrastructure
- Google Maps for location services
- OpenAI for AI capabilities
- Paystack for payment processing in Africa

---

**Built with ❤️ for South Africa**

