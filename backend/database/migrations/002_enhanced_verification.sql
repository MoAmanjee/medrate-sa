-- Migration: Enhanced Verification Features
-- Adds check-in, fraud detection, and enhanced verification fields

-- Add check-in fields to appointments
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS
  checkin_otp TEXT,
  checkin_qr_code TEXT,
  checked_in BOOLEAN DEFAULT FALSE,
  checked_in_at TIMESTAMP,
  doctor_confirmed BOOLEAN DEFAULT FALSE,
  doctor_confirmed_at TIMESTAMP;

CREATE INDEX IF NOT EXISTS idx_appointments_checked_in ON appointments(checked_in);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_confirmed ON appointments(doctor_confirmed);

-- Add fraud detection fields to verification_requests
ALTER TABLE verification_requests ADD COLUMN IF NOT EXISTS
  ai_risk_score INTEGER DEFAULT 0,
  ai_risk_level TEXT DEFAULT 'low',
  ai_flags JSONB,
  automated_checks JSONB,
  admin_notes TEXT,
  requested_documents JSONB,
  info_requested BOOLEAN DEFAULT FALSE,
  info_requested_at TIMESTAMP;

CREATE INDEX IF NOT EXISTS idx_verification_requests_risk_score ON verification_requests(ai_risk_score);
CREATE INDEX IF NOT EXISTS idx_verification_requests_risk_level ON verification_requests(ai_risk_level);

-- Add review flagging fields
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS
  is_flagged BOOLEAN DEFAULT FALSE,
  flag_reason TEXT;

CREATE INDEX IF NOT EXISTS idx_reviews_flagged ON reviews(is_flagged);

-- Add audit log table
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,  -- 'doctor', 'patient', 'appointment', etc.
  entity_id UUID NOT NULL,
  admin_id UUID REFERENCES users(id),
  user_id UUID REFERENCES users(id),
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_admin ON audit_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- Add document metadata table for fraud detection
CREATE TABLE IF NOT EXISTS document_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  verification_request_id UUID REFERENCES verification_requests(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL,  -- 'hpcsa_certificate', 'government_id', 'proof_of_practice'
  s3_url TEXT NOT NULL,
  file_size BIGINT,
  mime_type TEXT,
  uploaded_at TIMESTAMP DEFAULT now(),
  metadata JSONB  -- Store file metadata, checksums, etc.
);

CREATE INDEX IF NOT EXISTS idx_document_metadata_verification ON document_metadata(verification_request_id);

