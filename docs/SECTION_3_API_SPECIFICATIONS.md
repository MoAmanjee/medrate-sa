# Section 3: API Specifications

## Purpose
Complete REST API specification with request/response examples, authentication, error handling, and endpoint documentation.

## Base URL
```
Production: https://api.ratethedoctor.co.za/v1
Staging: https://api-staging.ratethedoctor.co.za/v1
Local: http://localhost:3000/api/v1
```

## Authentication

### JWT Token Authentication
```http
Authorization: Bearer <jwt_token>
```

### Firebase Auth (Alternative)
```http
Authorization: Bearer <firebase_id_token>
```

## API Endpoints

### Authentication Endpoints

#### 1. Register User
```http
POST /api/v1/auth/register
```

**Request Body:**
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "phone": "+27123456789",
  "password": "SecurePassword123!",
  "role": "patient"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid-here",
      "email": "john@example.com",
      "phone": "+27123456789",
      "role": "patient",
      "verified": false
    },
    "token": "jwt-token-here",
    "otpSent": true
  }
}
```

#### 2. Login
```http
POST /api/v1/auth/login
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePassword123!"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid-here",
      "email": "john@example.com",
      "role": "patient",
      "verified": true
    },
    "token": "jwt-token-here",
    "refreshToken": "refresh-token-here"
  }
}
```

#### 3. Verify OTP
```http
POST /api/v1/auth/verify-otp
```

**Request Body:**
```json
{
  "userId": "uuid-here",
  "otpCode": "123456",
  "purpose": "registration"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "verified": true,
    "user": {
      "id": "uuid-here",
      "verified": true
    }
  }
}
```

### Doctor Endpoints

#### 4. Search Doctors
```http
GET /api/v1/doctors?specialty=Cardiologist&city=Johannesburg&lat=-26.2041&lng=28.0473&radius=10&minRating=4.0&page=1&limit=20
```

**Query Parameters:**
- `specialty` (optional): Doctor specialization
- `city` (optional): City name
- `province` (optional): Province name
- `lat` (optional): Latitude for radius search
- `lng` (optional): Longitude for radius search
- `radius` (optional): Radius in km (default: 10)
- `minRating` (optional): Minimum rating (1-5)
- `acceptsMedicalAid` (optional): Boolean
- `page` (optional): Page number (default: 1)
- `limit` (optional): Results per page (default: 20)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "doctors": [
      {
        "id": "uuid-here",
        "displayName": "Dr. Jane Smith",
        "specialization": "Cardiologist",
        "practiceName": "Heart Care Clinic",
        "city": "Johannesburg",
        "province": "Gauteng",
        "ratingAvg": 4.8,
        "numReviews": 45,
        "distanceKm": 2.5,
        "acceptsMedicalAid": true,
        "verified": true,
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

#### 5. Get Doctor Details
```http
GET /api/v1/doctors/:id
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "doctor": {
      "id": "uuid-here",
      "displayName": "Dr. Jane Smith",
      "specialization": "Cardiologist",
      "hpcsaNumber": "MP123456",
      "practiceName": "Heart Care Clinic",
      "address": "123 Main St",
      "city": "Johannesburg",
      "province": "Gauteng",
      "postalCode": "2000",
      "phone": "+27111234567",
      "email": "dr.smith@example.com",
      "location": {
        "lat": -26.2041,
        "lng": 28.0473
      },
      "ratingAvg": 4.8,
      "numReviews": 45,
      "acceptsMedicalAid": true,
      "verified": true,
      "subscriptionPlan": "featured",
      "subscriptionEndDate": "2024-12-31",
      "medicalAids": ["Discovery Health", "Momentum Health"],
      "reviews": [
        {
          "id": "review-uuid",
          "rating": 5,
          "comment": "Excellent doctor!",
          "verifiedVisit": true,
          "patientName": "John Doe",
          "createdAt": "2024-01-15T10:00:00Z"
        }
      ]
    }
  }
}
```

#### 6. Register as Doctor
```http
POST /api/v1/doctors
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "displayName": "Dr. Jane Smith",
  "specialization": "Cardiologist",
  "hpcsaNumber": "MP123456",
  "practiceName": "Heart Care Clinic",
  "practiceNumber": "PR123456",
  "phone": "+27111234567",
  "email": "dr.smith@example.com",
  "address": "123 Main St",
  "city": "Johannesburg",
  "province": "Gauteng",
  "postalCode": "2000",
  "location": {
    "lat": -26.2041,
    "lng": 28.0473
  },
  "acceptsMedicalAid": true,
  "medicalAidIds": ["uuid-1", "uuid-2"]
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "doctor": {
      "id": "uuid-here",
      "displayName": "Dr. Jane Smith",
      "verificationStatus": "pending",
      "message": "Verification request submitted. HPCSA verification in progress."
    }
  }
}
```

### Appointment Endpoints

#### 7. Create Appointment
```http
POST /api/v1/appointments
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "doctorId": "doctor-uuid",
  "clinicId": "clinic-uuid",
  "startTime": "2024-02-15T10:00:00Z",
  "endTime": "2024-02-15T10:30:00Z",
  "notes": "Follow-up appointment"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "appointment": {
      "id": "uuid-here",
      "doctorId": "doctor-uuid",
      "userId": "user-uuid",
      "startTime": "2024-02-15T10:00:00Z",
      "endTime": "2024-02-15T10:30:00Z",
      "status": "booked",
      "bookingReference": "APT-2024-001234",
      "createdAt": "2024-01-15T10:00:00Z"
    }
  }
}
```

#### 8. Get User Appointments
```http
GET /api/v1/appointments?status=booked&page=1&limit=10
Authorization: Bearer <token>
```

**Query Parameters:**
- `status` (optional): Filter by status (booked, confirmed, completed, cancelled)
- `doctorId` (optional): Filter by doctor
- `page` (optional): Page number
- `limit` (optional): Results per page

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "appointments": [
      {
        "id": "uuid-here",
        "doctor": {
          "id": "doctor-uuid",
          "displayName": "Dr. Jane Smith",
          "specialization": "Cardiologist"
        },
        "clinic": {
          "id": "clinic-uuid",
          "name": "Heart Care Clinic"
        },
        "startTime": "2024-02-15T10:00:00Z",
        "endTime": "2024-02-15T10:30:00Z",
        "status": "booked",
        "bookingReference": "APT-2024-001234"
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

#### 9. Update Appointment Status
```http
PATCH /api/v1/appointments/:id/status
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "status": "completed"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "appointment": {
      "id": "uuid-here",
      "status": "completed",
      "updatedAt": "2024-02-15T10:30:00Z"
    }
  }
}
```

### Review Endpoints

#### 10. Create Review
```http
POST /api/v1/reviews
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "doctorId": "doctor-uuid",
  "appointmentId": "appointment-uuid",
  "rating": 5,
  "comment": "Excellent doctor, very professional and knowledgeable."
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "review": {
      "id": "uuid-here",
      "doctorId": "doctor-uuid",
      "userId": "user-uuid",
      "appointmentId": "appointment-uuid",
      "rating": 5,
      "comment": "Excellent doctor, very professional and knowledgeable.",
      "verifiedVisit": true,
      "sentiment": "positive",
      "createdAt": "2024-02-15T11:00:00Z"
    }
  }
}
```

**Error Response (400 Bad Request):**
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

### Payment Endpoints

#### 11. Create Subscription
```http
POST /api/v1/subscriptions
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "doctorId": "doctor-uuid",
  "plan": "featured",
  "billingCycle": "monthly"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "subscription": {
      "id": "uuid-here",
      "plan": "featured",
      "amount": 299.00,
      "currency": "ZAR",
      "startDate": "2024-02-01",
      "endDate": "2024-03-01",
      "paymentUrl": "https://paystack.com/pay/xxx"
    }
  }
}
```

### AI Endpoints

#### 12. Symptom Checker
```http
POST /api/v1/ai/symptom-checker
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "symptoms": "I have been experiencing chest pain and shortness of breath for the past 3 days",
  "duration": "3 days",
  "severity": "moderate"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "analysis": {
      "possibleConditions": [
        {
          "condition": "Cardiac-related",
          "probability": "high",
          "recommendation": "Consult a cardiologist immediately"
        }
      ],
      "recommendedSpecialties": ["Cardiologist", "General Practitioner"],
      "urgency": "high",
      "suggestedActions": [
        "Seek immediate medical attention",
        "Consider visiting emergency room if symptoms worsen"
      ]
    },
    "recommendedDoctors": [
      {
        "id": "doctor-uuid",
        "displayName": "Dr. Jane Smith",
        "specialization": "Cardiologist",
        "distanceKm": 5.2
      }
    ]
  }
}
```

#### 13. Analyze Review Sentiment
```http
POST /api/v1/ai/analyze-sentiment
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "reviewId": "review-uuid",
  "text": "Excellent doctor, very professional and knowledgeable."
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "sentiment": "positive",
    "confidence": 0.95,
    "categories": ["professionalism", "knowledge", "satisfaction"],
    "summary": "Highly positive review emphasizing professionalism and expertise"
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
- `CONFLICT` (409): Resource conflict (e.g., duplicate booking)
- `INTERNAL_ERROR` (500): Server error

## Rate Limiting

- **General API**: 100 requests per minute per IP
- **Authentication**: 5 requests per minute per IP
- **Symptom Checker**: 10 requests per minute per user
- **Subscription Creation**: 5 requests per minute per user

## Pagination

All list endpoints support pagination:
```
?page=1&limit=20
```

Response includes pagination metadata:
```json
{
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8,
    "hasNext": true,
    "hasPrev": false
  }
}
```

