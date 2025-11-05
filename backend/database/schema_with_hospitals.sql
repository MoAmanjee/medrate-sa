-- Rate The Doctor & Hospital - Complete PostgreSQL Schema
-- Includes preloaded hospitals, claim workflow, and promotions

-- Enable PostGIS for geolocation
CREATE EXTENSION IF NOT EXISTS postgis;

-- Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    phone TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    password_hash TEXT,
    firebase_uid TEXT UNIQUE,
    role TEXT NOT NULL DEFAULT 'patient' CHECK (role IN ('patient', 'doctor', 'hospital_admin', 'admin')),
    verified BOOLEAN DEFAULT FALSE,
    verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected', 'in_progress')),
    id_number TEXT,
    id_document_url TEXT,
    profile_picture_url TEXT,
    city TEXT,
    province TEXT,
    preferred_language TEXT DEFAULT 'en',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    last_login TIMESTAMP
);

-- Doctors Table
CREATE TABLE doctors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    display_name TEXT NOT NULL,
    specialization TEXT NOT NULL,
    hpcsa_number TEXT UNIQUE,
    hpcsa_verified BOOLEAN DEFAULT FALSE,
    verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected', 'in_progress')),
    practice_name TEXT,
    practice_address TEXT,
    practice_city TEXT,
    practice_province TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    location GEOGRAPHY(POINT, 4326),
    phone TEXT,
    email TEXT,
    accepts_medical_aid BOOLEAN DEFAULT FALSE,
    telehealth_available BOOLEAN DEFAULT FALSE,
    subscription_plan TEXT DEFAULT 'free' CHECK (subscription_plan IN ('free', 'standard', 'premium')),
    rating_avg DECIMAL(3, 2) DEFAULT 0.00,
    total_reviews INTEGER DEFAULT 0,
    verified_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Hospitals Table (Preloaded + Claimable)
CREATE TABLE hospitals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('Public Hospital', 'Private Hospital', 'Clinic', 'GP Practice', 'Pharmacy')),
    
    -- Claim & Verification
    claimed BOOLEAN DEFAULT FALSE,
    claimed_by_user_id UUID REFERENCES users(id),
    claimed_at TIMESTAMP,
    verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected', 'in_progress')),
    verified_at TIMESTAMP,
    verified_by_admin_id UUID REFERENCES users(id),
    
    -- Location
    address TEXT,
    city TEXT NOT NULL,
    province TEXT NOT NULL,
    postal_code TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    location GEOGRAPHY(POINT, 4326),
    
    -- Contact
    phone TEXT,
    email TEXT,
    website TEXT,
    
    -- Profile
    logo_url TEXT,
    description TEXT,
    emergency_services BOOLEAN DEFAULT FALSE,
    
    -- Services
    departments JSONB DEFAULT '[]'::jsonb, -- Array of department names
    specialties JSONB DEFAULT '[]'::jsonb, -- Array of specialty names
    
    -- Ratings
    rating_avg DECIMAL(3, 2) DEFAULT 0.00,
    total_reviews INTEGER DEFAULT 0,
    
    -- Promotion
    is_featured BOOLEAN DEFAULT FALSE,
    featured_until TIMESTAMP,
    promotion_tier TEXT DEFAULT 'basic' CHECK (promotion_tier IN ('basic', 'standard', 'premium')),
    
    -- Metadata
    source TEXT DEFAULT 'preloaded', -- 'preloaded', 'claimed', 'manual'
    preload_data JSONB, -- Store original preload data
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Hospital Claims Table
CREATE TABLE hospital_claims (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hospital_id UUID REFERENCES hospitals(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    claim_token TEXT UNIQUE NOT NULL, -- For email verification
    claim_email TEXT NOT NULL,
    claim_status TEXT DEFAULT 'pending' CHECK (claim_status IN ('pending', 'approved', 'rejected', 'expired')),
    documents JSONB DEFAULT '{}'::jsonb, -- License, registration, ID
    admin_notes TEXT,
    submitted_at TIMESTAMP DEFAULT NOW(),
    reviewed_at TIMESTAMP,
    reviewed_by UUID REFERENCES users(id)
);

-- Hospital Promotions Table
CREATE TABLE hospital_promotions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hospital_id UUID REFERENCES hospitals(id) ON DELETE CASCADE,
    promotion_tier TEXT NOT NULL CHECK (promotion_tier IN ('standard', 'premium')),
    amount_paid DECIMAL(10, 2) NOT NULL,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    payment_provider TEXT, -- 'payfast', 'yoco', 'paystack'
    payment_transaction_id TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled')),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Appointments Table
CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES users(id) ON DELETE CASCADE,
    doctor_id UUID REFERENCES doctors(id),
    hospital_id UUID REFERENCES hospitals(id), -- Optional: appointment at hospital
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP,
    status TEXT DEFAULT 'booked' CHECK (status IN ('booked', 'confirmed', 'completed', 'cancelled', 'no_show')),
    booking_reference TEXT UNIQUE,
    checkin_otp TEXT,
    checkin_qr_code TEXT,
    checked_in BOOLEAN DEFAULT FALSE,
    checked_in_at TIMESTAMP,
    is_telehealth BOOLEAN DEFAULT FALSE,
    telehealth_link TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Reviews Table
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES users(id) ON DELETE CASCADE,
    doctor_id UUID REFERENCES doctors(id),
    hospital_id UUID REFERENCES hospitals(id),
    appointment_id UUID REFERENCES appointments(id),
    rating INTEGER CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    verified_visit BOOLEAN DEFAULT FALSE,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Subscriptions Table (Doctors)
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doctor_id UUID REFERENCES doctors(id),
    plan TEXT NOT NULL CHECK (plan IN ('free', 'standard', 'premium')),
    billing_cycle TEXT CHECK (billing_cycle IN ('monthly', 'yearly')),
    amount DECIMAL(10, 2),
    payment_provider TEXT,
    provider_subscription_id TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'cancelled', 'expired')),
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Verification Requests Table
CREATE TABLE verification_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doctor_id UUID REFERENCES doctors(id),
    hospital_id UUID REFERENCES hospitals(id),
    request_type TEXT NOT NULL CHECK (request_type IN ('doctor', 'hospital')),
    documents JSONB DEFAULT '{}'::jsonb,
    hpcsa_lookup JSONB,
    admin_notes TEXT,
    status TEXT DEFAULT 'submitted' CHECK (status IN ('submitted', 'approved', 'rejected', 'in_progress')),
    submitted_at TIMESTAMP DEFAULT NOW(),
    reviewed_at TIMESTAMP,
    reviewed_by UUID REFERENCES users(id)
);

-- Audit Log Table
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    action TEXT NOT NULL,
    entity_type TEXT, -- 'doctor', 'hospital', 'appointment', 'review'
    entity_id UUID,
    details JSONB,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_doctors_location ON doctors USING GIST(location);
CREATE INDEX idx_doctors_city ON doctors(practice_city);
CREATE INDEX idx_doctors_specialization ON doctors(specialization);
CREATE INDEX idx_doctors_subscription ON doctors(subscription_plan);
CREATE INDEX idx_hospitals_location ON hospitals USING GIST(location);
CREATE INDEX idx_hospitals_city ON hospitals(city);
CREATE INDEX idx_hospitals_type ON hospitals(type);
CREATE INDEX idx_hospitals_claimed ON hospitals(claimed);
CREATE INDEX idx_hospitals_verification ON hospitals(verification_status);
CREATE INDEX idx_hospitals_featured ON hospitals(is_featured, featured_until);
CREATE INDEX idx_hospital_claims_token ON hospital_claims(claim_token);
CREATE INDEX idx_hospital_claims_status ON hospital_claims(claim_status);
CREATE INDEX idx_appointments_patient ON appointments(patient_id);
CREATE INDEX idx_appointments_doctor ON appointments(doctor_id);
CREATE INDEX idx_appointments_hospital ON appointments(hospital_id);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_reviews_doctor ON reviews(doctor_id);
CREATE INDEX idx_reviews_hospital ON reviews(hospital_id);
CREATE INDEX idx_reviews_verified ON reviews(verified_visit);

-- Triggers for Rating Calculation
CREATE OR REPLACE FUNCTION update_doctor_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE doctors
    SET total_reviews = (
        SELECT COUNT(*) FROM reviews
        WHERE doctor_id = NEW.doctor_id
        AND verified_visit = TRUE
        AND is_verified = TRUE
    ),
    rating_avg = (
        SELECT COALESCE(AVG(rating)::DECIMAL(3,2), 0.00)
        FROM reviews
        WHERE doctor_id = NEW.doctor_id
        AND verified_visit = TRUE
        AND is_verified = TRUE
    )
    WHERE id = NEW.doctor_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_doctor_rating
AFTER INSERT OR UPDATE ON reviews
FOR EACH ROW
WHEN (NEW.doctor_id IS NOT NULL)
EXECUTE FUNCTION update_doctor_rating();

CREATE OR REPLACE FUNCTION update_hospital_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE hospitals
    SET total_reviews = (
        SELECT COUNT(*) FROM reviews
        WHERE hospital_id = NEW.hospital_id
        AND verified_visit = TRUE
        AND is_verified = TRUE
    ),
    rating_avg = (
        SELECT COALESCE(AVG(rating)::DECIMAL(3,2), 0.00)
        FROM reviews
        WHERE hospital_id = NEW.hospital_id
        AND verified_visit = TRUE
        AND is_verified = TRUE
    )
    WHERE id = NEW.hospital_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_hospital_rating
AFTER INSERT OR UPDATE ON reviews
FOR EACH ROW
WHEN (NEW.hospital_id IS NOT NULL)
EXECUTE FUNCTION update_hospital_rating();

-- Trigger for Hospital Featured Status
CREATE OR REPLACE FUNCTION update_hospital_featured_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if hospital has active promotion
    IF EXISTS (
        SELECT 1 FROM hospital_promotions
        WHERE hospital_id = NEW.hospital_id
        AND status = 'active'
        AND end_date > NOW()
    ) THEN
        UPDATE hospitals
        SET is_featured = TRUE,
            featured_until = (
                SELECT MAX(end_date) FROM hospital_promotions
                WHERE hospital_id = NEW.hospital_id
                AND status = 'active'
            ),
            promotion_tier = NEW.promotion_tier
        WHERE id = NEW.hospital_id;
    ELSE
        UPDATE hospitals
        SET is_featured = FALSE,
            featured_until = NULL,
            promotion_tier = 'basic'
        WHERE id = NEW.hospital_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_hospital_featured
AFTER INSERT OR UPDATE ON hospital_promotions
FOR EACH ROW
EXECUTE FUNCTION update_hospital_featured_status();

-- Preload Major Hospitals (South Africa)
-- This is a sample - in production, load from CSV or API

INSERT INTO hospitals (name, type, city, province, address, phone, email, claimed, verification_status, source, preload_data) VALUES
-- Johannesburg
('Chris Hani Baragwanath Hospital', 'Public Hospital', 'Johannesburg', 'Gauteng', '26 Chris Hani Rd, Diepkloof, Soweto, 1862', '+27 11 933 8000', 'info@baragwanath.co.za', FALSE, 'pending', 'preloaded', '{"original_id": "BARA001", "bed_count": 3200}'::jsonb),
('Netcare Sandton Hospital', 'Private Hospital', 'Johannesburg', 'Gauteng', '82 Rivonia Rd, Sandton, 2196', '+27 11 301 0000', 'info@sandton.netcare.co.za', FALSE, 'pending', 'preloaded', '{"original_id": "NETC001"}'::jsonb),
('Mediclinic Sandton', 'Private Hospital', 'Johannesburg', 'Gauteng', '100 Rivonia Rd, Sandton, 2196', '+27 11 709 2000', 'info@sandton.mediclinic.co.za', FALSE, 'pending', 'preloaded', '{}'::jsonb),
('Life Fourways Hospital', 'Private Hospital', 'Johannesburg', 'Gauteng', 'Cedar Rd & Main Rd, Fourways, 2055', '+27 11 875 1000', 'info@fourways.life.co.za', FALSE, 'pending', 'preloaded', '{}'::jsonb),
('Charlotte Maxeke Johannesburg Hospital', 'Public Hospital', 'Johannesburg', 'Gauteng', '17 Jubilee Rd, Parktown, 2193', '+27 11 488 4911', 'info@charlottemaxeke.gov.za', FALSE, 'pending', 'preloaded', '{}'::jsonb),

-- Cape Town
('Groote Schuur Hospital', 'Public Hospital', 'Cape Town', 'Western Cape', 'Main Rd, Observatory, 7925', '+27 21 404 9111', 'info@grooteschuur.co.za', FALSE, 'pending', 'preloaded', '{}'::jsonb),
('Mediclinic Cape Town', 'Private Hospital', 'Cape Town', 'Western Cape', '21 Hof St, Oranjezicht, 8001', '+27 21 464 5500', 'info@capetown.mediclinic.co.za', FALSE, 'pending', 'preloaded', '{}'::jsonb),
('Netcare Christiaan Barnard Memorial Hospital', 'Private Hospital', 'Cape Town', 'Western Cape', '181 Longmarket St, Cape Town, 8001', '+27 21 480 6111', 'info@cbmh.netcare.co.za', FALSE, 'pending', 'preloaded', '{}'::jsonb),
('Life Vincent Pallotti Hospital', 'Private Hospital', 'Cape Town', 'Western Cape', 'Alexandra Rd, Pinelands, 7405', '+27 21 506 9111', 'info@vincentpallotti.life.co.za', FALSE, 'pending', 'preloaded', '{}'::jsonb),

-- Durban
('Addington Hospital', 'Public Hospital', 'Durban', 'KwaZulu-Natal', '101 Erskine Terrace, South Beach, 4001', '+27 31 327 2000', 'info@addington.gov.za', FALSE, 'pending', 'preloaded', '{}'::jsonb),
('Netcare uMhlanga Hospital', 'Private Hospital', 'Durban', 'KwaZulu-Natal', '323 Umhlanga Rocks Dr, Umhlanga, 4320', '+27 31 560 5111', 'info@umhlanga.netcare.co.za', FALSE, 'pending', 'preloaded', '{}'::jsonb),
('Life Westville Hospital', 'Private Hospital', 'Durban', 'KwaZulu-Natal', '1 Jan Hofmeyr Rd, Westville, 3629', '+27 31 265 6000', 'info@westville.life.co.za', FALSE, 'pending', 'preloaded', '{}'::jsonb),

-- Pretoria
('Steve Biko Academic Hospital', 'Public Hospital', 'Pretoria', 'Gauteng', '1 Malan St, Prinshof, 0001', '+27 12 354 1000', 'info@stevebiko.gov.za', FALSE, 'pending', 'preloaded', '{}'::jsonb),
('Netcare Pretoria East Hospital', 'Private Hospital', 'Pretoria', 'Gauteng', 'Cnr Garsfontein & Netcare Blvd, Pretoria, 0081', '+27 12 422 4000', 'info@pretoriaeast.netcare.co.za', FALSE, 'pending', 'preloaded', '{}'::jsonb),
('Mediclinic Muelmed', 'Private Hospital', 'Pretoria', 'Gauteng', '1 Pretorius St, Arcadia, 0007', '+27 12 423 1000', 'info@muelmed.mediclinic.co.za', FALSE, 'pending', 'preloaded', '{}'::jsonb),

-- Port Elizabeth
('Livingstone Hospital', 'Public Hospital', 'Port Elizabeth', 'Eastern Cape', 'Lindsay Rd, Korsten, 6001', '+27 41 405 2111', 'info@livingstone.gov.za', FALSE, 'pending', 'preloaded', '{}'::jsonb),
('Netcare Greenacres Hospital', 'Private Hospital', 'Port Elizabeth', 'Eastern Cape', '1 Cape Rd, Greenacres, 6045', '+27 41 363 1000', 'info@greenacres.netcare.co.za', FALSE, 'pending', 'preloaded', '{}'::jsonb),

-- Bloemfontein
('Pelonomi Hospital', 'Public Hospital', 'Bloemfontein', 'Free State', '1 Bophelo Rd, Bloemfontein, 9301', '+27 51 405 2111', 'info@pelonomi.gov.za', FALSE, 'pending', 'preloaded', '{}'::jsonb),
('Mediclinic Bloemfontein', 'Private Hospital', 'Bloemfontein', 'Free State', '1 Muller St, Brandwag, 9301', '+27 51 404 6666', 'info@bloemfontein.mediclinic.co.za', FALSE, 'pending', 'preloaded', '{}'::jsonb);

-- Update locations with approximate coordinates (in production, geocode addresses)
UPDATE hospitals SET 
    latitude = CASE city
        WHEN 'Johannesburg' THEN -26.2041
        WHEN 'Cape Town' THEN -33.9249
        WHEN 'Durban' THEN -29.8587
        WHEN 'Pretoria' THEN -25.7479
        WHEN 'Port Elizabeth' THEN -33.9608
        WHEN 'Bloemfontein' THEN -29.0852
        ELSE -26.2041
    END,
    longitude = CASE city
        WHEN 'Johannesburg' THEN 28.0473
        WHEN 'Cape Town' THEN 18.4241
        WHEN 'Durban' THEN 31.0218
        WHEN 'Pretoria' THEN 28.2293
        WHEN 'Port Elizabeth' THEN 25.6022
        WHEN 'Bloemfontein' THEN 26.1596
        ELSE 28.0473
    END,
    location = ST_SetSRID(ST_MakePoint(
        CASE city
            WHEN 'Johannesburg' THEN 28.0473
            WHEN 'Cape Town' THEN 18.4241
            WHEN 'Durban' THEN 31.0218
            WHEN 'Pretoria' THEN 28.2293
            WHEN 'Port Elizabeth' THEN 25.6022
            WHEN 'Bloemfontein' THEN 26.1596
            ELSE 28.0473
        END,
        CASE city
            WHEN 'Johannesburg' THEN -26.2041
            WHEN 'Cape Town' THEN -33.9249
            WHEN 'Durban' THEN -29.8587
            WHEN 'Pretoria' THEN -25.7479
            WHEN 'Port Elizabeth' THEN -33.9608
            WHEN 'Bloemfontein' THEN -29.0852
            ELSE -26.2041
        END
    ), 4326)::geography;

