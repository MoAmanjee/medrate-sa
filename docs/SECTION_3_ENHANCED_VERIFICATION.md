# Section 3: Enhanced Verification Workflows

## Purpose
Comprehensive verification system with automated checks, AI fraud detection, and admin review workflows for both doctors and patients.

## Doctor Verification Flow (Complete)

### Registration/Claim Process

#### Step 1: Doctor Signs Up or Claims Profile
- User signs up with `role=doctor` OR claims existing doctor profile
- System creates user account and doctor record

#### Step 2: Required Documents Upload
Doctor must provide:

1. **HPCSA Number** (required)
   - Format validation: MP/DT/CH/etc. + 6 digits
   - Checksum validation

2. **HPCSA Certificate/Registration Document** (required)
   - PDF or image (JPG, PNG)
   - Uploaded to S3 with secure URL
   - Document type: `hpcsa_certificate`

3. **Government ID** (required)
   - SA ID book or passport
   - Uploaded to S3
   - Document type: `government_id`

4. **Proof of Practice** (required - one of):
   - Clinic letterhead
   - Payment stub (bank statement)
   - Practice certificate
   - Uploaded to S3
   - Document type: `proof_of_practice`

5. **Contact Verification**
   - Phone OTP verification
   - Email OTP verification

### Step 3: HPCSA Verification

#### Option A: HPCSA Public API (if available)
```python
# Call HPCSA API
response = requests.get(
    f"{HPCSA_API_URL}/verify",
    params={"hpcsa": hpcsa_number},
    headers={"Authorization": f"Bearer {HPCSA_API_KEY}"}
)
```

#### Option B: Web Scraping (if no API)
- Automated web scraping job/worker
- Rate-limited scraping (compliant)
- Parse HPCSA website for registration details
- Store results in database

#### Option C: Mock Adapter (Development)
- Returns mock success/failure for testing
- Configurable via `HPCSA_MOCK_MODE=true`

### Step 4: Automated Checks

#### 4.1 HPCSA Number Validation
```python
def validate_hpcsa_format(hpcsa_number: str) -> bool:
    """Validate HPCSA number format and checksum"""
    # Format: MP123456, DT123456, etc.
    pattern = r'^[A-Z]{2}\d{6}$'
    if not re.match(pattern, hpcsa_number):
        return False
    
    # Checksum validation (if applicable)
    # ... checksum logic
    
    return True
```

#### 4.2 Name Matching
```python
def fuzzy_match_names(provided_name: str, hpcsa_name: str) -> bool:
    """Fuzzy match names from HPCSA response"""
    from difflib import SequenceMatcher
    
    similarity = SequenceMatcher(
        None,
        provided_name.lower(),
        hpcsa_name.lower()
    ).ratio()
    
    return similarity >= 0.85  # 85% similarity threshold
```

#### 4.3 Duplicate Check
```python
def check_duplicate_hpcsa(hpcsa_number: str, doctor_id: str) -> bool:
    """Check if HPCSA number already exists (excluding current doctor)"""
    existing = db.query(Doctor).filter(
        Doctor.hpcsa_number == hpcsa_number,
        Doctor.id != doctor_id
    ).first()
    
    return existing is not None
```

#### 4.4 AI Fraud Detection
```python
def detect_fraud_with_ai(documents: Dict) -> Dict:
    """Use OpenAI + heuristics to detect suspicious documents"""
    # Analyze document metadata
    # Check for image manipulation
    # Verify document authenticity
    # Return risk score (0-100)
    
    risk_score = 0
    
    # Check document consistency
    if documents_are_inconsistent(documents):
        risk_score += 30
    
    # AI analysis of document images
    ai_analysis = openai_client.analyze_document(documents)
    if ai_analysis.get("suspicious"):
        risk_score += 40
    
    # Heuristic checks
    if unusual_patterns_detected(documents):
        risk_score += 30
    
    return {
        "risk_score": risk_score,
        "risk_level": "high" if risk_score > 70 else "medium" if risk_score > 40 else "low",
        "flags": ai_analysis.get("flags", [])
    }
```

### Step 5: Verification Status Decision

```python
def determine_verification_status(
    hpcsa_valid: bool,
    name_match: bool,
    duplicate_check: bool,
    fraud_risk: Dict
) -> str:
    """Determine verification status based on all checks"""
    
    if not hpcsa_valid:
        return "auto_failed"
    
    if duplicate_check:
        return "manual_review"  # Duplicate requires admin review
    
    if fraud_risk["risk_level"] == "high":
        return "manual_review"  # High risk requires admin review
    
    if hpcsa_valid and name_match and fraud_risk["risk_level"] == "low":
        return "auto_verified"
    
    return "manual_review"  # Default to manual review
```

### Step 6: Admin Review Queue

If status is `manual_review` or `auto_verified`:
- Add to admin verification queue
- Admin reviews:
  - HPCSA lookup results
  - Uploaded documents (preview)
  - AI risk score
  - Automated check results

### Step 7: Admin Actions

#### Approve
```python
POST /api/admin/verification_requests/{id}/approve
{
  "notes": "All documents verified. HPCSA number confirmed."
}
```

#### Reject
```python
POST /api/admin/verification_requests/{id}/reject
{
  "reason": "HPCSA number does not match provided name",
  "notes": "Please verify your HPCSA registration details"
}
```

#### Request More Info
```python
POST /api/admin/verification_requests/{id}/request-info
{
  "required_documents": ["updated_hpcsa_certificate"],
  "notes": "HPCSA certificate is expired. Please upload current certificate."
}
```

### Step 8: Verification Complete

On approval:
- `doctor.verified = true`
- `doctor.verification_status = 'verified'`
- Send notification to doctor
- Create audit log entry

## Patient Verification Flow

### Basic Verification

1. **Signup with Phone + Email**
   - User provides phone and email
   - System sends OTP to both
   - User verifies both OTPs
   - `user.verified = true`

2. **Optional: SA ID Verification**
   - User uploads SA ID number
   - Admin reviews ID
   - Enhanced verification status

### Review Verification (Enhanced)

#### Requirement Check
- Patient must be verified (`user.verified = true`)
- Appointment must exist and belong to patient
- Appointment status must be `completed`
- Review must be linked to appointment

#### Check-in Mechanism

**Option 1: OTP Check-in**
1. Patient receives OTP at appointment time
2. Doctor/clinic staff enters OTP
3. Appointment marked as `checked_in = true`

**Option 2: QR Code Check-in**
1. Patient receives QR code (via email/SMS/app)
2. Doctor/clinic scans QR code
3. Appointment marked as `checked_in = true`

**Option 3: Doctor Manual Confirmation**
1. Doctor marks appointment as completed
2. System sets `appointment.completed = true`
3. Patient can now leave verified review

### Review Creation Flow

```python
def create_review(
    user_id: str,
    doctor_id: str,
    appointment_id: str,
    rating: int,
    comment: str
):
    # 1. Check user is verified
    user = get_user(user_id)
    if not user.verified:
        raise ValidationError("User must be verified")
    
    # 2. Check appointment exists and belongs to user
    appointment = get_appointment(appointment_id)
    if not appointment or appointment.user_id != user_id:
        raise ValidationError("Appointment not found")
    
    # 3. Check appointment is completed
    if appointment.status != "completed":
        raise ValidationError("Appointment must be completed")
    
    # 4. Check if appointment was checked in or doctor confirmed
    if not appointment.checked_in and not appointment.doctor_confirmed:
        # Review is stored but flagged
        verified_visit = False
        is_flagged = True
    else:
        verified_visit = True
        is_flagged = False
    
    # 5. Create review
    review = Review(
        user_id=user_id,
        doctor_id=doctor_id,
        appointment_id=appointment_id,
        rating=rating,
        comment=comment,
        verified_visit=verified_visit,
        is_flagged=is_flagged
    )
    
    return review
```

## Admin Verification UI Requirements

### Verification Queue Dashboard

#### List View
- **Pending Verifications**
  - Doctor name
  - HPCSA number
  - Verification status
  - AI risk score (with color coding)
  - Submitted date
  - Quick actions

#### Detail View
- **Document Preview**
  - HPCSA certificate (viewer)
  - Government ID (viewer)
  - Proof of practice (viewer)
  - Download links

- **HPCSA API Results**
  - Name from HPCSA
  - Registration status
  - Valid until date
  - Specialties

- **Automated Check Results**
  - HPCSA format validation: ✓/✗
  - Name match: ✓/✗ (with similarity score)
  - Duplicate check: ✓/✗
  - AI fraud detection: Risk score, flags

- **Quick Actions**
  - Approve button
  - Reject button (with reason required)
  - Request More Info button
  - Add Notes

### Audit Logs

Every action is logged:
```json
{
  "action": "verification_approved",
  "admin_id": "uuid",
  "doctor_id": "uuid",
  "verification_request_id": "uuid",
  "timestamp": "2024-01-15T10:00:00Z",
  "notes": "All documents verified",
  "ip_address": "192.168.1.1"
}
```

## Database Schema Updates

### Enhanced Verification Request

```sql
ALTER TABLE verification_requests ADD COLUMN IF NOT EXISTS
  ai_risk_score INTEGER DEFAULT 0,
  ai_risk_level TEXT DEFAULT 'low',
  ai_flags JSONB,
  automated_checks JSONB,
  admin_notes TEXT,
  requested_documents JSONB;
```

### Appointment Check-in

```sql
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS
  checkin_otp TEXT,
  checkin_qr_code TEXT,
  checked_in BOOLEAN DEFAULT FALSE,
  checked_in_at TIMESTAMP,
  doctor_confirmed BOOLEAN DEFAULT FALSE,
  doctor_confirmed_at TIMESTAMP;
```

### Review Flags

```sql
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS
  is_flagged BOOLEAN DEFAULT FALSE,
  flag_reason TEXT;
```

## Fraud Detection Heuristics

### Document Analysis

1. **Image Analysis**
   - Check for manipulation signs
   - Verify metadata consistency
   - OCR text extraction and validation

2. **Document Consistency**
   - Names match across documents
   - Dates are logical
   - Signatures are consistent

3. **Pattern Detection**
   - Unusual upload patterns
   - Duplicate document detection
   - Suspicious metadata

### AI Integration

```python
def analyze_document_with_ai(document_url: str) -> Dict:
    """Use OpenAI Vision API to analyze document"""
    
    response = openai.ChatCompletion.create(
        model="gpt-4-vision-preview",
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": "Analyze this document for authenticity. Check for signs of manipulation, verify text consistency, and flag any suspicious elements."
                    },
                    {
                        "type": "image_url",
                        "image_url": {"url": document_url}
                    }
                ]
            }
        ]
    )
    
    return {
        "suspicious": response.choices[0].message.content.contains("suspicious"),
        "flags": extract_flags(response),
        "confidence": extract_confidence(response)
    }
```

## Rate Limiting for Web Scraping

If using web scraping for HPCSA verification:

```python
from ratelimit import limits, sleep_and_retry

@sleep_and_retry
@limits(calls=10, period=60)  # 10 calls per minute
def scrape_hpcsa_website(hpcsa_number: str):
    """Rate-limited HPCSA web scraping"""
    # Scraping logic here
    pass
```

## Security Considerations

1. **Document Storage**
   - Encrypted at rest (S3 encryption)
   - Signed URLs with expiration
   - Access logs for document views

2. **Audit Trail**
   - All verification actions logged
   - IP address tracking
   - Admin action history

3. **Data Privacy**
   - PII encryption
   - Document retention policies
   - Right to deletion

