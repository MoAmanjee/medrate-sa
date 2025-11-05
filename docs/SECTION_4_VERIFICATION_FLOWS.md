# Section 4: Verification Flows

## Purpose
Detailed documentation of verification workflows for patients and doctors, including automated and manual processes.

## Patient Verification Flow

### Flow Diagram
```
User Registration
    ↓
Send OTP (SMS/Email)
    ↓
User Enters OTP
    ↓
OTP Verified?
    ├─ Yes → Mark as Verified
    └─ No → Show Error
    ↓
Optional: ID Document Upload
    ↓
Admin Reviews ID (if uploaded)
    ↓
Patient Fully Verified
```

### Implementation Steps

1. **Registration**
   - User provides email, phone, password
   - System creates user record with `verified = false`
   - OTP generated and sent via Twilio/SendGrid

2. **OTP Verification**
   - User enters OTP code
   - System validates OTP (checks expiry, correctness)
   - If valid: `user.verified = true`, `verification_status = 'verified'`

3. **Optional ID Verification**
   - User uploads ID document (SA ID, passport)
   - Document stored in S3
   - Admin reviews document
   - If approved: Enhanced verification status

### Code Example (FastAPI)

```python
@router.post("/auth/register")
async def register_user(user_data: UserRegister):
    # Create user
    user = User(
        email=user_data.email,
        phone=user_data.phone,
        password_hash=hash_password(user_data.password),
        verified=False
    )
    db.add(user)
    db.commit()
    
    # Generate and send OTP
    otp_code = generate_otp()
    otp_record = OTPVerification(
        user_id=user.id,
        phone=user_data.phone,
        otp_code=otp_code,
        purpose="registration",
        expires_at=datetime.utcnow() + timedelta(minutes=10)
    )
    db.add(otp_record)
    db.commit()
    
    # Send OTP via SMS
    sms_service.send_otp(user_data.phone, otp_code)
    
    return {"success": True, "user_id": user.id, "otp_sent": True}

@router.post("/auth/verify-otp")
async def verify_otp(otp_data: OTPVerify):
    otp_record = db.query(OTPVerification).filter(
        OTPVerification.user_id == otp_data.user_id,
        OTPVerification.otp_code == otp_data.otp_code,
        OTPVerification.verified == False,
        OTPVerification.expires_at > datetime.utcnow()
    ).first()
    
    if not otp_record:
        raise HTTPException(400, "Invalid or expired OTP")
    
    # Mark OTP as verified
    otp_record.verified = True
    
    # Mark user as verified
    user = db.query(User).filter(User.id == otp_data.user_id).first()
    user.verified = True
    user.verification_status = "verified"
    
    db.commit()
    
    return {"success": True, "verified": True}
```

## Doctor Verification Flow

### Flow Diagram
```
Doctor Registration
    ↓
HPCSA Number Provided
    ↓
Call HPCSA Adapter (Mock/Real)
    ↓
HPCSA Verification Result
    ├─ Auto Verified → Mark Doctor as Verified
    ├─ Auto Failed → Manual Review
    └─ Manual Review → Admin Dashboard
    ↓
Admin Reviews Documents
    ├─ Approve → Doctor Verified
    └─ Reject → Doctor Rejected
```

### Implementation Steps

1. **Doctor Registration**
   - Doctor provides HPCSA number, specialization, practice details
   - System creates doctor record with `verified = false`, `verification_status = 'pending'`

2. **HPCSA Verification**
   - System calls HPCSA adapter (mock or real)
   - Adapter returns verification result:
     - `auto_verified`: HPCSA number valid → doctor verified
     - `manual_review`: HPCSA verification failed → admin review required
     - `auto_failed`: Invalid format → rejected

3. **Admin Review (if manual_review)**
   - Verification request appears in admin dashboard
   - Admin reviews:
     - HPCSA lookup result
     - Uploaded documents (ID, qualifications, practice license)
   - Admin decision:
     - Approve → `doctor.verified = true`
     - Reject → `doctor.verified = false`, reason stored

### Code Example (FastAPI)

```python
@router.post("/doctors")
async def register_doctor(
    doctor_data: DoctorRegister,
    current_user: User = Depends(get_current_user),
    hpcsa_adapter: HPCSAAdapter = Depends(get_hpcsa_adapter)
):
    # Create doctor record
    doctor = Doctor(
        user_id=current_user.id,
        hpcsa_number=doctor_data.hpcsa_number,
        display_name=doctor_data.display_name,
        specialization=doctor_data.specialization,
        verified=False,
        verification_status="pending"
    )
    db.add(doctor)
    db.commit()
    
    # Verify with HPCSA
    hpcsa_result = hpcsa_adapter.verify_doctor(
        doctor_data.hpcsa_number,
        doctor_data.display_name
    )
    
    # Create verification request
    verification_request = VerificationRequest(
        doctor_id=doctor.id,
        documents=doctor_data.documents,
        hpcsa_lookup=hpcsa_result,
        status=hpcsa_result.get("status", "manual_review")
    )
    db.add(verification_request)
    
    # Update doctor based on result
    if hpcsa_result.get("status") == "auto_verified":
        doctor.verified = True
        doctor.verification_status = "verified"
    else:
        doctor.verification_status = "manual_review"
    
    db.commit()
    
    return {
        "success": True,
        "doctor_id": doctor.id,
        "verification_status": doctor.verification_status
    }

@router.post("/admin/verifications/{verification_id}/approve")
async def approve_verification(
    verification_id: str,
    current_user: User = Depends(get_admin_user)
):
    verification_request = db.query(VerificationRequest).filter(
        VerificationRequest.id == verification_id
    ).first()
    
    if not verification_request:
        raise HTTPException(404, "Verification request not found")
    
    doctor = db.query(Doctor).filter(
        Doctor.id == verification_request.doctor_id
    ).first()
    
    # Approve
    doctor.verified = True
    doctor.verification_status = "verified"
    verification_request.status = "approved"
    verification_request.reviewed_by = current_user.id
    verification_request.reviewed_at = datetime.utcnow()
    
    db.commit()
    
    # Notify doctor
    notification_service.send_notification(
        doctor.user_id,
        "Your doctor profile has been verified!"
    )
    
    return {"success": True, "message": "Doctor verified"}
```

## Review Verification Flow

### Flow Diagram
```
Patient Creates Review
    ↓
Validation Checks
    ├─ User Verified? → Yes
    ├─ Appointment Exists? → Yes
    ├─ Appointment Belongs to User? → Yes
    └─ Appointment Status = 'completed'? → Yes
    ↓
Create Review
    ↓
Set verified_visit = true (via trigger)
    ↓
Trigger Updates Doctor Rating
```

### Validation Rules

1. **User Must Be Verified**
   ```python
   if not user.verified:
       raise HTTPException(400, "Only verified patients can leave reviews")
   ```

2. **Appointment Must Exist and Belong to User**
   ```python
   appointment = db.query(Appointment).filter(
       Appointment.id == appointment_id,
       Appointment.user_id == user_id,
       Appointment.doctor_id == doctor_id
   ).first()
   
   if not appointment:
       raise HTTPException(400, "Appointment not found")
   ```

3. **Appointment Must Be Completed**
   ```python
   if appointment.status != "completed":
       raise HTTPException(400, "Review can only be created for completed appointments")
   ```

4. **One Review Per Appointment**
   ```python
   existing_review = db.query(Review).filter(
       Review.user_id == user_id,
       Review.appointment_id == appointment_id
   ).first()
   
   if existing_review:
       raise HTTPException(400, "Review already exists for this appointment")
   ```

### Database Trigger

The database trigger automatically sets `verified_visit = true` when:
- Review is created
- Appointment exists
- Appointment status is 'completed'
- Appointment belongs to the reviewing user

See `backend/database/schema.sql` for trigger implementation.

## Admin Dashboard Features

### Verification Queue
- List of pending verification requests
- Filter by type (doctor, patient)
- Filter by status (pending, manual_review)
- Quick actions: Approve, Reject, Request More Info

### Review Moderation
- List of reported reviews
- Review details with context
- Actions: Approve, Reject, Hide

### Analytics
- Verification success rate
- Average verification time
- Rejection reasons

## Environment Variables for Verification

```bash
# HPCSA Verification
HPCSA_API_URL=https://api.hpcsa.co.za/v1
HPCSA_API_KEY=your-key
HPCSA_MOCK_MODE=true  # Use mock for development

# OTP/SMS
TWILIO_SID=your-sid
TWILIO_AUTH=your-auth
TWILIO_PHONE=+1234567890

# Email
SENDGRID_API_KEY=your-key
```

## Testing Verification Flows

### Unit Tests
```python
def test_hpcsa_mock_verification():
    adapter = HPCSAAdapter()
    result = adapter.verify_doctor("MP123456", "Dr. Test")
    assert result["verified"] == True
    assert result["status"] == "auto_verified"

def test_review_validation():
    # Test that review requires completed appointment
    # Test that unverified user cannot review
    # Test that one review per appointment
```

### Integration Tests
```python
def test_doctor_verification_flow():
    # 1. Register doctor
    # 2. HPCSA verification (mock)
    # 3. Check verification status
    # 4. Admin approves
    # 5. Check doctor is verified
```

