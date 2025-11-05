-- RateTheDoctor Database Schema
-- PostgreSQL 15+ with PostGIS extension

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- ============================================
-- USERS (Patients)
-- ============================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT UNIQUE NOT NULL,
  id_number TEXT, -- SA ID number if provided
  password_hash TEXT, -- if using own auth (bcrypt)
  role TEXT NOT NULL DEFAULT 'patient', -- 'patient','doctor','admin'
  verified BOOLEAN DEFAULT FALSE, -- patient verification (OTP+ID)
  verification_status TEXT DEFAULT 'pending', -- pending, verified, rejected
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_role ON users(role);

-- ============================================
-- DOCTORS
-- ============================================
CREATE TABLE doctors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  specialization TEXT NOT NULL,
  hpcsa_number TEXT UNIQUE,
  practice_name TEXT,
  practice_number TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  city TEXT,
  province TEXT,
  postal_code TEXT,
  location GEOGRAPHY(POINT, 4326), -- PostGIS for lat/lng
  accepts_medical_aid BOOLEAN DEFAULT FALSE,
  verified BOOLEAN DEFAULT FALSE, -- HPCSA verified + admin approved
  verification_status TEXT DEFAULT 'pending', -- pending, auto_failed, manual_review, verified, rejected
  rating_avg NUMERIC(3,2) DEFAULT 0,
  num_reviews INTEGER DEFAULT 0,
  subscription_plan TEXT DEFAULT 'free', -- free, standard, featured
  subscription_end_date DATE,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- PostGIS index for location queries
CREATE INDEX idx_doctors_location ON doctors USING GIST(location);
CREATE INDEX idx_doctors_city_specialization ON doctors(city, specialization);
CREATE INDEX idx_doctors_hpcsa ON doctors(hpcsa_number);
CREATE INDEX idx_doctors_verified ON doctors(verified);
CREATE INDEX idx_doctors_user_id ON doctors(user_id);

-- ============================================
-- CLINICS
-- ============================================
CREATE TABLE clinics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT,
  city TEXT,
  province TEXT,
  postal_code TEXT,
  location GEOGRAPHY(POINT, 4326),
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_clinics_location ON clinics USING GIST(location);

-- ============================================
-- DOCTOR-CLINIC RELATIONSHIP
-- ============================================
CREATE TABLE doctor_clinics (
  doctor_id UUID REFERENCES doctors(id) ON DELETE CASCADE,
  clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
  PRIMARY KEY (doctor_id, clinic_id)
);

-- ============================================
-- APPOINTMENTS
-- ============================================
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES doctors(id) ON DELETE CASCADE,
  clinic_id UUID REFERENCES clinics(id) ON DELETE SET NULL,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP,
  status TEXT DEFAULT 'booked', -- booked, confirmed, cancelled, completed, no_show
  booking_reference TEXT UNIQUE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  
  CONSTRAINT valid_time_range CHECK (end_time IS NULL OR end_time > start_time)
);

CREATE INDEX idx_appointments_user_id ON appointments(user_id);
CREATE INDEX idx_appointments_doctor_id ON appointments(doctor_id);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointments_start_time ON appointments(start_time);
CREATE INDEX idx_appointments_booking_ref ON appointments(booking_reference);

-- ============================================
-- REVIEWS
-- ============================================
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES doctors(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES appointments(id) ON DELETE CASCADE, -- ensures only patients with appointment can review
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  verified_visit BOOLEAN DEFAULT FALSE, -- true if appointment status was 'completed'
  sentiment TEXT, -- positive, negative, neutral (from AI)
  is_verified BOOLEAN DEFAULT FALSE, -- admin verified
  is_reported BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  
  -- Ensure one review per appointment
  UNIQUE(user_id, appointment_id)
);

CREATE INDEX idx_reviews_doctor_id ON reviews(doctor_id);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);
CREATE INDEX idx_reviews_appointment_id ON reviews(appointment_id);
CREATE INDEX idx_reviews_verified ON reviews(verified_visit);

-- ============================================
-- SUBSCRIPTIONS
-- ============================================
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID REFERENCES doctors(id) ON DELETE CASCADE,
  plan TEXT NOT NULL, -- free, standard, featured
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  payment_status TEXT DEFAULT 'pending', -- pending, paid, failed, cancelled
  provider TEXT, -- paystack, stripe
  provider_subscription_id TEXT,
  amount NUMERIC(10,2) NOT NULL,
  currency TEXT DEFAULT 'ZAR',
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_subscriptions_doctor_id ON subscriptions(doctor_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(payment_status);
CREATE INDEX idx_subscriptions_end_date ON subscriptions(end_date);

-- ============================================
-- VERIFICATION REQUESTS
-- ============================================
CREATE TABLE verification_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID REFERENCES doctors(id) ON DELETE CASCADE,
  documents JSONB, -- URLs to uploaded documents
  hpcsa_lookup JSONB, -- Response from HPCSA API
  admin_notes TEXT,
  status TEXT DEFAULT 'submitted', -- submitted, auto_verified, manual_review, approved, rejected
  reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_verification_requests_doctor_id ON verification_requests(doctor_id);
CREATE INDEX idx_verification_requests_status ON verification_requests(status);

-- ============================================
-- MEDICAL AIDS
-- ============================================
CREATE TABLE medical_aids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  code TEXT UNIQUE,
  created_at TIMESTAMP DEFAULT now()
);

-- ============================================
-- DOCTOR MEDICAL AIDS (Many-to-Many)
-- ============================================
CREATE TABLE doctor_medical_aids (
  doctor_id UUID REFERENCES doctors(id) ON DELETE CASCADE,
  medical_aid_id UUID REFERENCES medical_aids(id) ON DELETE CASCADE,
  PRIMARY KEY (doctor_id, medical_aid_id)
);

-- ============================================
-- OTP VERIFICATION (Patient Verification)
-- ============================================
CREATE TABLE otp_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  phone TEXT,
  email TEXT,
  otp_code TEXT NOT NULL,
  purpose TEXT NOT NULL, -- registration, login, password_reset
  verified BOOLEAN DEFAULT FALSE,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_otp_user_id ON otp_verifications(user_id);
CREATE INDEX idx_otp_code ON otp_verifications(otp_code);
CREATE INDEX idx_otp_expires ON otp_verifications(expires_at);

-- ============================================
-- TRIGGERS
-- ============================================

-- Trigger: Update doctor rating when review is inserted/updated/deleted
CREATE OR REPLACE FUNCTION update_doctor_rating() RETURNS TRIGGER AS $$
BEGIN
  UPDATE doctors
  SET 
    num_reviews = (
      SELECT COUNT(*) FROM reviews 
      WHERE doctor_id = COALESCE(NEW.doctor_id, OLD.doctor_id)
    ),
    rating_avg = (
      SELECT COALESCE(AVG(rating)::NUMERIC(3,2), 0) 
      FROM reviews 
      WHERE doctor_id = COALESCE(NEW.doctor_id, OLD.doctor_id)
    )
  WHERE id = COALESCE(NEW.doctor_id, OLD.doctor_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_rating 
AFTER INSERT OR UPDATE OR DELETE ON reviews
FOR EACH ROW EXECUTE FUNCTION update_doctor_rating();

-- Trigger: Set verified_visit flag when review is created
CREATE OR REPLACE FUNCTION set_verified_visit_flag() RETURNS TRIGGER AS $$
BEGIN
  -- Check if appointment exists and is completed
  IF EXISTS (
    SELECT 1 FROM appointments 
    WHERE id = NEW.appointment_id 
    AND status = 'completed'
    AND user_id = NEW.user_id
  ) THEN
    NEW.verified_visit := TRUE;
  ELSE
    NEW.verified_visit := FALSE;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_set_verified_visit
BEFORE INSERT ON reviews
FOR EACH ROW EXECUTE FUNCTION set_verified_visit_flag();

-- Trigger: Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_doctors_updated_at BEFORE UPDATE ON doctors
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_appointments_updated_at BEFORE UPDATE ON appointments
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_reviews_updated_at BEFORE UPDATE ON reviews
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_subscriptions_updated_at BEFORE UPDATE ON subscriptions
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_verification_requests_updated_at BEFORE UPDATE ON verification_requests
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SAMPLE DATA (Optional - for development)
-- ============================================

-- Insert sample medical aids
INSERT INTO medical_aids (name, code) VALUES
  ('Discovery Health', 'DISCOVERY'),
  ('Momentum Health', 'MOMENTUM'),
  ('Bonitas Medical Fund', 'BONITAS'),
  ('Fedhealth', 'FEDHEALTH'),
  ('GEMS', 'GEMS')
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- USEFUL QUERIES
-- ============================================

-- Find doctors within 10km radius
-- SELECT d.*, ST_Distance(d.location, ST_MakePoint(lng, lat)::geography) as distance
-- FROM doctors d
-- WHERE ST_DWithin(d.location, ST_MakePoint(lng, lat)::geography, 10000)
-- ORDER BY distance;

-- Get doctors with verified reviews
-- SELECT d.*, COUNT(r.id) as review_count
-- FROM doctors d
-- LEFT JOIN reviews r ON r.doctor_id = d.id AND r.verified_visit = TRUE
-- WHERE d.verified = TRUE
-- GROUP BY d.id
-- ORDER BY review_count DESC;

-- Get appointment statistics for doctor
-- SELECT 
--   COUNT(*) FILTER (WHERE status = 'completed') as completed,
--   COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled,
--   COUNT(*) FILTER (WHERE status = 'no_show') as no_show
-- FROM appointments
-- WHERE doctor_id = 'doctor-uuid-here';

