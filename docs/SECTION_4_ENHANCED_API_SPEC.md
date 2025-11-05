# Section 4: Enhanced API Specifications

## Purpose
Complete REST API specification with all endpoints, request/response examples, rate limiting, and authentication.

## Base URL
```
Production: https://api.ratethedoctor.co.za/api
Staging: https://api-staging.ratethedoctor.co.za/api
Local: http://localhost:8000/api
```

## Authentication

### JWT Token
```http
Authorization: Bearer <jwt_token>
```

### Rate Limiting
- General endpoints: 100 requests/minute per IP
- Authentication endpoints: 5 requests/minute per IP
- AI endpoints: 10 requests/minute per user
- Admin endpoints: 50 requests/minute per admin

## API Endpoints

### Authentication Endpoints

#### POST /api/auth/register
Register new user (patient or doctor)

**Request:**
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "phone": "+27123456789",
  "password": "SecurePassword123!",
  "role": "patient"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "john@example.com",
      "phone": "+27123456789",
      "role": "patient",
      "verified": false
    },
    "otpSent": true,
    "message": "OTP sent to phone and email"
  }
}
```

#### POST /api/auth/login
User login

**Request:**
```json
{
  "email": "john@example.com",
  "password": "SecurePassword123!"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "john@example.com",
      "role": "patient",
      "verified": true
    },
    "token": "jwt-token",
    "refreshToken": "refresh-token"
  }
}
```

#### POST /api/auth/verify-otp
Verify OTP code

**Request:**
```json
{
  "userId": "uuid",
  "otpCode": "123456",
  "purpose": "registration"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "verified": true,
    "user": {
      "id": "uuid",
      "verified": true
    }
  }
}
```

### Doctor Endpoints

#### POST /api/doctors/claim
Doctor claims or creates profile

**Request:**
```json
{
  "userId": "uuid",
  "hpcsaNumber": "MP123456",
  "displayName": "Dr. Jane Smith",
  "specialization": "Cardiologist",
  "documents": {
    "hpcsa_certificate": "https://s3.../hpcsa-cert.pdf",
    "government_id": "https://s3.../id-front.jpg",
    "proof_of_practice": "https://s3.../practice-cert.pdf"
  },
  "practiceName": "Heart Care Clinic",
  "address": "123 Main St",
  "city": "Johannesburg",
  "province": "Gauteng",
  "location": {
    "lat": -26.2041,
    "lng": 28.0473
  }
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "doctor": {
      "id": "uuid",
      "hpcsaNumber": "MP123456",
      "verificationStatus": "pending",
      "verificationRequestId": "uuid"
    },
    "message": "Verification request submitted"
  }
}
```

#### GET /api/doctors
Search doctors with filters

**Query Parameters:**
- `specialization` (optional): Doctor specialty
- `city` (optional): City name
- `province` (optional): Province
- `lat` (optional): Latitude
- `lng` (optional): Longitude
- `radius_km` (optional): Search radius (default: 10)
- `minRating` (optional): Minimum rating (1-5)
- `acceptsMedicalAid` (optional): Boolean
- `verified` (optional): Only verified doctors (default: true)
- `sort` (optional): `rating`, `distance`, `name` (default: `rating`)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Results per page (default: 20)

**Request:**
```http
GET /api/doctors?specialization=gp&city=Johannesburg&lat=-26.2041&lng=28.0473&radius_km=10&sort=rating
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "doctors": [
      {
        "id": "uuid",
        "displayName": "Dr. Jane Doe",
        "specialization": "GP",
        "ratingAvg": 4.8,
        "numReviews": 45,
        "verified": true,
        "acceptsMedicalAid": true,
        "distanceKm": 1.2,
        "clinic": {
          "name": "Sandton Clinic",
          "address": "456 Clinic St",
          "location": {
            "lat": -26.2041,
            "lng": 28.0473
          }
        },
        "subscriptionPlan": "featured"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8
    }
  }
}
```

#### GET /api/doctors/:id
Get doctor details

**Response (200):**
```json
{
  "success": true,
  "data": {
    "doctor": {
      "id": "uuid",
      "displayName": "Dr. Jane Smith",
      "specialization": "Cardiologist",
      "hpcsaNumber": "MP123456",
      "practiceName": "Heart Care Clinic",
      "address": "123 Main St",
      "city": "Johannesburg",
      "province": "Gauteng",
      "location": {
        "lat": -26.2041,
        "lng": 28.0473
      },
      "ratingAvg": 4.8,
      "numReviews": 45,
      "verified": true,
      "acceptsMedicalAid": true,
      "medicalAids": ["Discovery Health", "Momentum Health"],
      "subscriptionPlan": "featured",
      "reviews": [
        {
          "id": "uuid",
          "rating": 5,
          "comment": "Excellent doctor!",
          "verifiedVisit": true,
          "createdAt": "2024-01-15T10:00:00Z"
        }
      ]
    }
  }
}
```

### Appointment Endpoints

#### POST /api/appointments
Create appointment

**Request:**
```json
{
  "userId": "uuid",
  "doctorId": "uuid",
  "clinicId": "uuid",
  "startTime": "2025-01-15T14:00:00Z"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "appointment": {
      "id": "uuid",
      "userId": "uuid",
      "doctorId": "uuid",
      "clinicId": "uuid",
      "startTime": "2025-01-15T14:00:00Z",
      "status": "booked",
      "bookingReference": "APT-2025-001234",
      "checkinCode": {
        "otpCode": "ABC123",
        "qrCodeData": "data:image/png;base64,...",
        "expiresAt": "2025-01-15T16:00:00Z"
      }
    },
    "message": "Appointment created. Check-in code sent via SMS/Email"
  }
}
```

#### GET /api/appointments
Get user appointments

**Query Parameters:**
- `status` (optional): Filter by status
- `doctorId` (optional): Filter by doctor
- `page`, `limit` (optional): Pagination

**Response (200):**
```json
{
  "success": true,
  "data": {
    "appointments": [
      {
        "id": "uuid",
        "doctor": {
          "id": "uuid",
          "displayName": "Dr. Jane Smith"
        },
        "startTime": "2025-01-15T14:00:00Z",
        "status": "booked",
        "bookingReference": "APT-2025-001234",
        "checkedIn": false
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 5
    }
  }
}
```

#### POST /api/appointments/:id/checkin
Verify check-in (OTP or QR)

**Request:**
```json
{
  "otpCode": "ABC123"
}
```

**OR with QR code:**
```json
{
  "qrData": {
    "appointment_id": "uuid",
    "otp_code": "ABC123"
  }
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "appointmentId": "uuid",
    "checkedIn": true,
    "checkedInAt": "2025-01-15T14:05:00Z"
  }
}
```

#### POST /api/appointments/:id/doctor-confirm
Doctor confirms appointment completion

**Request:**
```json
{
  "doctorId": "uuid",
  "notes": "Patient attended and consultation completed"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "appointmentId": "uuid",
    "doctorConfirmed": true,
    "status": "completed",
    "confirmedAt": "2025-01-15T14:30:00Z"
  }
}
```

### Review Endpoints

#### POST /api/reviews
Create review (requires completed appointment)

**Request:**
```json
{
  "userId": "uuid",
  "doctorId": "uuid",
  "appointmentId": "uuid",
  "rating": 5,
  "comment": "Excellent doctor, very professional and knowledgeable."
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "review": {
      "id": "uuid",
      "doctorId": "uuid",
      "appointmentId": "uuid",
      "rating": 5,
      "comment": "Excellent doctor, very professional and knowledgeable.",
      "verifiedVisit": true,
      "sentiment": "positive",
      "createdAt": "2025-01-15T15:00:00Z"
    }
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "error": {
    "code": "REVIEW_NOT_ALLOWED",
    "message": "Review can only be created for completed appointments",
    "details": {
      "appointmentStatus": "booked"
    }
  }
}
```

### Subscription Endpoints

#### POST /api/doctors/:id/subscribe
Create subscription payment session

**Request:**
```json
{
  "plan": "featured",
  "billingCycle": "monthly"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "subscription": {
      "id": "uuid",
      "plan": "featured",
      "amount": 299.00,
      "currency": "ZAR",
      "paymentUrl": "https://paystack.com/pay/xxx",
      "status": "pending"
    }
  }
}
```

#### POST /api/subscriptions/webhook
Payment provider webhook (Paystack/Stripe)

**Request:** (from payment provider)
```json
{
  "event": "charge.success",
  "data": {
    "reference": "payment-ref",
    "amount": 29900,
    "status": "success"
  }
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Webhook processed"
}
```

### Admin Endpoints

#### GET /api/admin/verification_requests
Get pending verification requests

**Query Parameters:**
- `status` (optional): Filter by status
- `page`, `limit` (optional): Pagination

**Response (200):**
```json
{
  "success": true,
  "data": {
    "verificationRequests": [
      {
        "id": "uuid",
        "doctorId": "uuid",
        "doctorName": "Dr. Jane Smith",
        "hpcsaNumber": "MP123456",
        "status": "manual_review",
        "aiRiskScore": 25,
        "aiRiskLevel": "low",
        "submittedAt": "2024-01-15T10:00:00Z",
        "documents": {
          "hpcsa_certificate": "https://s3.../cert.pdf",
          "government_id": "https://s3.../id.jpg",
          "proof_of_practice": "https://s3.../practice.pdf"
        },
        "hpcsaResult": {
          "verified": true,
          "nameMatch": true,
          "registrationStatus": "active"
        },
        "automatedChecks": {
          "formatValid": true,
          "nameMatch": true,
          "duplicateCheck": false
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 15
    }
  }
}
```

#### POST /api/admin/verification_requests/:id/approve
Approve verification request

**Request:**
```json
{
  "notes": "All documents verified. HPCSA number confirmed."
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "verificationRequestId": "uuid",
    "doctorId": "uuid",
    "status": "approved",
    "verified": true,
    "message": "Doctor verification approved"
  }
}
```

#### POST /api/admin/verification_requests/:id/reject
Reject verification request

**Request:**
```json
{
  "reason": "HPCSA number does not match provided name",
  "notes": "Please verify your HPCSA registration details"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "verificationRequestId": "uuid",
    "status": "rejected",
    "message": "Verification rejected"
  }
}
```

#### POST /api/admin/verification_requests/:id/request-info
Request additional information

**Request:**
```json
{
  "requiredDocuments": ["updated_hpcsa_certificate"],
  "notes": "HPCSA certificate is expired. Please upload current certificate."
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "verificationRequestId": "uuid",
    "status": "info_requested",
    "message": "Additional information requested"
  }
}
```

### HPCSA Adapter Endpoint

#### GET /api/adapters/hpcsa/lookup
Lookup HPCSA registration

**Query Parameters:**
- `hpcsa_number` (required): HPCSA registration number

**Request:**
```http
GET /api/adapters/hpcsa/lookup?hpcsa_number=MP123456
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "hpcsaNumber": "MP123456",
    "name": "Jane Smith",
    "status": "active",
    "specialties": "Medical Practitioner",
    "validUntil": "2025-12-31",
    "verified": true,
    "method": "api",
    "rawResult": {
      "registration_date": "2010-01-15",
      "expiry_date": "2025-12-31"
    }
  }
}
```

## Error Responses

### Standard Error Format
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {}
  }
}
```

### Common Error Codes
- `UNAUTHORIZED` (401): Invalid or missing token
- `FORBIDDEN` (403): Insufficient permissions
- `NOT_FOUND` (404): Resource not found
- `VALIDATION_ERROR` (400): Invalid input data
- `CONFLICT` (409): Resource conflict
- `RATE_LIMIT_EXCEEDED` (429): Too many requests
- `INTERNAL_ERROR` (500): Server error

## Rate Limiting Middleware

### Implementation (Python/FastAPI)
```python
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

@app.get("/api/doctors")
@limiter.limit("100/minute")
async def search_doctors(request: Request):
    # Endpoint logic
    pass
```

### Rate Limit Headers
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## Webhook Security

Payment provider webhooks should verify signatures:

### Paystack
```python
import hmac
import hashlib

def verify_paystack_signature(payload, signature, secret):
    hash = hmac.new(
        secret.encode('utf-8'),
        payload,
        hashlib.sha512
    ).hexdigest()
    return hash == signature
```

### Stripe
```python
import stripe

def verify_stripe_signature(payload, signature, secret):
    try:
        event = stripe.Webhook.construct_event(
            payload, signature, secret
        )
        return True
    except ValueError:
        return False
```

