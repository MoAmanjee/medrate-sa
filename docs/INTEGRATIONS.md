# RateTheDoctor - External Service Integrations

This document outlines all external service integrations required for the RateTheDoctor platform.

## Table of Contents

1. [Firebase Authentication](#firebase-authentication)
2. [Google Maps API](#google-maps-api)
3. [Payment Gateways](#payment-gateways)
4. [OpenAI API](#openai-api)
5. [Notification Services](#notification-services)
6. [Cloud Storage](#cloud-storage)
7. [Environment Variables](#environment-variables)

---

## Firebase Authentication

### Purpose
User authentication, role-based access control, and session management.

### Setup
1. Create Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication providers:
   - Email/Password
   - Google Sign-In
   - Phone Number (optional)
3. Configure OAuth redirect URLs
4. Set up Firebase Admin SDK for backend

### Configuration
```javascript
// Frontend (React)
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};
```

### Backend Integration
```python
# FastAPI example
from firebase_admin import auth, initialize_app, credentials

cred = credentials.Certificate("path/to/serviceAccountKey.json")
initialize_app(cred)

def verify_token(token: str):
    decoded_token = auth.verify_id_token(token)
    return decoded_token
```

### Features Used
- Email/Password authentication
- JWT token generation
- Custom claims for roles (PATIENT, DOCTOR, ADMIN)
- User profile management
- Password reset functionality

### Cost
- Free tier: 50,000 MAU (Monthly Active Users)
- Paid: $0.0055 per MAU after free tier

---

## Google Maps API

### Purpose
Location services, doctor location display, route directions, and geocoding.

### Required APIs
1. **Maps JavaScript API** - Interactive maps on web
2. **Places API** - Search for places, hospitals
3. **Directions API** - Route calculation
4. **Geocoding API** - Address to coordinates conversion
5. **Distance Matrix API** - Distance calculations

### Setup
1. Create project in [Google Cloud Console](https://console.cloud.google.com/)
2. Enable required APIs
3. Create API key with restrictions
4. Set up billing account

### Configuration
```javascript
// Frontend
const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

// Load Maps API
<script src={`https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`}></script>
```

### Backend Integration
```python
# FastAPI example
import googlemaps

gmaps = googlemaps.Client(key=os.getenv("GOOGLE_MAPS_API_KEY"))

def get_directions(origin, destination):
    directions = gmaps.directions(origin, destination)
    return directions

def geocode_address(address):
    geocode_result = gmaps.geocode(address)
    return geocode_result
```

### Usage Examples
- **Doctor Search**: Find doctors within radius
- **Route Calculation**: Get directions to doctor
- **Address Validation**: Verify practice addresses
- **Distance Filtering**: Filter doctors by distance

### Cost
- Maps JavaScript API: $7 per 1,000 requests
- Places API: $17 per 1,000 requests (search)
- Directions API: $5 per 1,000 requests
- Geocoding API: $5 per 1,000 requests
- **Free tier**: $200/month credit (first $200 free)

---

## Payment Gateways

### Paystack (Primary - Africa Focused)

#### Purpose
Payment processing for South African market, doctor subscriptions, and booking fees.

#### Setup
1. Sign up at [Paystack](https://paystack.com/)
2. Complete business verification
3. Get API keys (Test and Live)
4. Configure webhooks

#### Configuration
```python
# Backend
import paystack

paystack_secret_key = os.getenv("PAYSTACK_SECRET_KEY")
paystack_public_key = os.getenv("PAYSTACK_PUBLIC_KEY")

paystack_api = paystack.Paystack(secret_key=paystack_secret_key)
```

#### Features Used
- Card payments (Visa, Mastercard, Verve)
- Bank transfers
- Mobile money (if available)
- Recurring subscriptions
- Split payments (platform commission)

#### Webhook Events
- `charge.success` - Payment successful
- `charge.failed` - Payment failed
- `subscription.create` - Subscription created
- `subscription.disable` - Subscription cancelled

#### Cost
- Transaction fee: 1.5% + ₦100 (Nigerian Naira) per transaction
- International cards: 3.9% + ₦100
- No setup fees

### Stripe (Alternative - International)

#### Purpose
International payment processing, alternative payment method.

#### Setup
1. Sign up at [Stripe](https://stripe.com/)
2. Complete account setup
3. Get API keys
4. Configure webhooks

#### Configuration
```python
import stripe

stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
```

#### Features Used
- Card payments
- Recurring subscriptions
- Marketplace payments
- Refunds

#### Cost
- Transaction fee: 2.9% + $0.30 per transaction
- International cards: Additional 1% fee
- No monthly fees

---

## OpenAI API

### Purpose
AI-powered features: symptom checker, review sentiment analysis, auto-reply suggestions, doctor recommendations.

### Setup
1. Sign up at [OpenAI](https://platform.openai.com/)
2. Get API key
3. Set up billing
4. Choose model (GPT-4 or GPT-3.5-turbo)

### Configuration
```python
import openai

openai.api_key = os.getenv("OPENAI_API_KEY")

def analyze_sentiment(review_text: str):
    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": "You are a sentiment analyzer. Analyze the sentiment of medical reviews."},
            {"role": "user", "content": f"Analyze this review: {review_text}"}
        ]
    )
    return response.choices[0].message.content

def symptom_checker(symptoms: str):
    response = openai.ChatCompletion.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": "You are a medical assistant. Provide general health information based on symptoms. Always recommend consulting a doctor."},
            {"role": "user", "content": f"User reports these symptoms: {symptoms}"}
        ]
    )
    return response.choices[0].message.content
```

### Use Cases

#### 1. Symptom Checker
- Input: User describes symptoms
- Output: General health information, recommended doctor types
- Model: GPT-4 (for accuracy)

#### 2. Review Sentiment Analysis
- Input: Review text
- Output: Sentiment (positive, negative, neutral), key themes
- Model: GPT-3.5-turbo (cost-effective)

#### 3. Auto-Reply Suggestions
- Input: Patient inquiry
- Output: Suggested professional response
- Model: GPT-3.5-turbo

#### 4. Doctor Recommendations
- Input: Symptoms, location, preferences
- Output: Personalized doctor recommendations
- Model: GPT-4

### Cost
- GPT-4: $0.03 per 1K input tokens, $0.06 per 1K output tokens
- GPT-3.5-turbo: $0.0015 per 1K input tokens, $0.002 per 1K output tokens
- **Estimated monthly cost**: $200-500 (depending on usage)

---

## Notification Services

### Twilio (SMS & WhatsApp)

#### Purpose
SMS notifications for booking confirmations, reminders, and OTP verification.

#### Setup
1. Sign up at [Twilio](https://www.twilio.com/)
2. Get phone number
3. Verify phone number
4. Get Account SID and Auth Token

#### Configuration
```python
from twilio.rest import Client

account_sid = os.getenv("TWILIO_ACCOUNT_SID")
auth_token = os.getenv("TWILIO_AUTH_TOKEN")
twilio_phone = os.getenv("TWILIO_PHONE_NUMBER")

client = Client(account_sid, auth_token)

def send_sms(to: str, message: str):
    message = client.messages.create(
        body=message,
        from_=twilio_phone,
        to=to
    )
    return message.sid
```

#### Use Cases
- Booking confirmations
- Appointment reminders (24h before)
- OTP verification
- Password reset codes
- Payment confirmations

#### Cost
- SMS: ~$0.0075 per SMS (South Africa)
- WhatsApp: $0.005 per message
- Monthly fee: $0 (pay-as-you-go)

### Firebase Cloud Messaging (FCM)

#### Purpose
Push notifications for mobile apps and web browsers.

#### Setup
1. Enable Cloud Messaging in Firebase Console
2. Get server key / Service account
3. Configure FCM in mobile app

#### Configuration
```python
from firebase_admin import messaging

def send_push_notification(token: str, title: str, body: str, data: dict = None):
    message = messaging.Message(
        notification=messaging.Notification(
            title=title,
            body=body
        ),
        data=data,
        token=token
    )
    response = messaging.send(message)
    return response
```

#### Use Cases
- Appointment reminders
- New review notifications
- Booking status updates
- Promotional messages (opt-in)

#### Cost
- Free: Unlimited notifications

---

## Cloud Storage

### Google Cloud Storage / AWS S3

#### Purpose
Store doctor profile images, verification documents, medical documents, chat attachments.

#### Setup
1. Create bucket in Google Cloud Storage or AWS S3
2. Set up CORS configuration
3. Configure access policies
4. Get service account credentials

#### Configuration
```python
# Google Cloud Storage
from google.cloud import storage

storage_client = storage.Client()
bucket = storage_client.bucket(os.getenv("GCS_BUCKET_NAME"))

def upload_file(file_path: str, destination_path: str):
    blob = bucket.blob(destination_path)
    blob.upload_from_filename(file_path)
    return blob.public_url

# AWS S3
import boto3

s3_client = boto3.client('s3',
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY")
)

def upload_file(file_path: str, bucket_name: str, object_name: str):
    s3_client.upload_file(file_path, bucket_name, object_name)
    return f"https://{bucket_name}.s3.amazonaws.com/{object_name}"
```

#### File Types Stored
- Doctor profile pictures (JPG, PNG)
- Verification documents (PDF, JPG)
- Medical certificates (PDF)
- Practice licenses (PDF)
- Chat attachments (various)

#### Security
- Private buckets with signed URLs
- Encryption at rest
- Access control lists (ACLs)
- Virus scanning (optional)

#### Cost
- Storage: ~$0.023 per GB/month
- Data transfer: ~$0.12 per GB
- Operations: $0.005 per 1,000 operations

---

## Environment Variables

### Backend Environment Variables

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/ratethedoctor

# Firebase
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-client-email

# Google Maps
GOOGLE_MAPS_API_KEY=your-maps-api-key

# Payment Gateways
PAYSTACK_SECRET_KEY=your-paystack-secret-key
PAYSTACK_PUBLIC_KEY=your-paystack-public-key
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_PUBLIC_KEY=your-stripe-public-key

# OpenAI
OPENAI_API_KEY=your-openai-api-key

# Twilio
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=your-phone-number

# Cloud Storage
GCS_BUCKET_NAME=your-bucket-name
GCS_PROJECT_ID=your-project-id
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_S3_BUCKET_NAME=your-bucket-name

# Application
NODE_ENV=production
PORT=3000
API_VERSION=v1
JWT_SECRET=your-jwt-secret
CORS_ORIGIN=https://yourdomain.com

# Redis
REDIS_URL=redis://localhost:6379

# Monitoring
SENTRY_DSN=your-sentry-dsn
```

### Frontend Environment Variables

```bash
# Firebase
REACT_APP_FIREBASE_API_KEY=your-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-auth-domain
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-storage-bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
REACT_APP_FIREBASE_APP_ID=your-app-id

# API
REACT_APP_API_URL=https://api.ratethedoctor.co.za
REACT_APP_API_VERSION=v1

# Google Maps
REACT_APP_GOOGLE_MAPS_API_KEY=your-maps-api-key

# Payment
REACT_APP_PAYSTACK_PUBLIC_KEY=your-paystack-public-key
REACT_APP_STRIPE_PUBLIC_KEY=your-stripe-public-key
```

---

## Integration Testing

### Test Accounts

#### Paystack
- Use test API keys for development
- Test card: `4084084084084081`
- Test PIN: `0000`

#### Stripe
- Use test API keys
- Test card: `4242 4242 4242 4242`
- Test expiry: Any future date

#### Twilio
- Use trial account for testing
- Limited to verified numbers only

### Webhook Testing

Use tools like:
- **ngrok** for local webhook testing
- **Postman** for webhook simulation
- **Stripe CLI** for Stripe webhooks

---

## Security Best Practices

1. **API Keys**: Never commit API keys to version control
2. **Environment Variables**: Use `.env` files (not committed)
3. **Webhooks**: Verify webhook signatures
4. **Rate Limiting**: Implement rate limiting for API calls
5. **Error Handling**: Don't expose API keys in error messages
6. **HTTPS**: Always use HTTPS for API calls
7. **Key Rotation**: Regularly rotate API keys

---

## Monitoring & Alerts

### API Usage Monitoring
- Monitor API usage to prevent unexpected costs
- Set up billing alerts
- Track API call volumes
- Monitor error rates

### Cost Optimization
- Cache API responses where possible
- Batch API calls when feasible
- Use appropriate API tiers
- Monitor and optimize usage

---

## Support & Documentation

### Official Documentation
- [Firebase Auth](https://firebase.google.com/docs/auth)
- [Google Maps API](https://developers.google.com/maps/documentation)
- [Paystack API](https://paystack.com/docs/api/)
- [Stripe API](https://stripe.com/docs/api)
- [OpenAI API](https://platform.openai.com/docs)
- [Twilio API](https://www.twilio.com/docs)
- [FCM](https://firebase.google.com/docs/cloud-messaging)

