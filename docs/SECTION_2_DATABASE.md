# Section 2: Database Schema

## Purpose
This section defines the complete PostgreSQL database schema with PostGIS support for geospatial queries, triggers, indexes, and sample queries.

## Database Setup

### Prerequisites
- PostgreSQL 15+
- PostGIS extension

### Installation
```bash
# Install PostgreSQL with PostGIS
# Ubuntu/Debian
sudo apt-get install postgresql-15 postgresql-15-postgis

# macOS
brew install postgresql@15 postgis

# Create database
createdb ratedoctor

# Connect and run schema
psql -d ratedoctor -f backend/database/schema.sql
```

## Schema Overview

### Core Tables

1. **users** - Patient and user accounts
2. **doctors** - Doctor profiles with location (PostGIS)
3. **clinics** - Clinic/hospital locations
4. **appointments** - Booking records
5. **reviews** - Patient reviews (linked to appointments)
6. **subscriptions** - Doctor subscription plans
7. **verification_requests** - Doctor verification workflow
8. **medical_aids** - Medical aid providers
9. **otp_verifications** - OTP codes for patient verification

### Key Features

#### PostGIS Integration
- `location GEOGRAPHY(POINT, 4326)` for lat/lng coordinates
- GIST index for fast spatial queries
- `ST_Distance()` for distance calculations
- `ST_DWithin()` for radius searches

#### Data Integrity
- Foreign key constraints
- Check constraints (rating 1-5)
- Unique constraints (email, phone, HPCSA number)
- Triggers for automatic rating updates

#### Indexes
- Primary keys (UUID)
- Foreign key indexes
- Composite indexes for common queries
- GIST index for location queries
- Full-text search indexes (if needed)

## ERD Description

### Relationships

```
users (1) ──< (1) doctors
users (1) ──< (*) appointments
doctors (1) ──< (*) appointments
doctors (1) ──< (*) reviews
users (1) ──< (*) reviews
appointments (1) ──< (1) reviews
doctors (1) ──< (*) subscriptions
doctors (1) ──< (*) verification_requests
doctors (*) ──< (*) medical_aids (via doctor_medical_aids)
doctors (*) ──< (*) clinics (via doctor_clinics)
```

### Key Constraints

1. **Review Verification**: `appointment_id` in reviews ensures only patients with appointments can review
2. **One Review Per Appointment**: `UNIQUE(user_id, appointment_id)` constraint
3. **Rating Update**: Trigger automatically updates doctor rating when review is added/updated/deleted

## Sample Queries

### 1. Find Doctors Within Radius

```sql
-- Find doctors within 10km of a point
SELECT 
  d.id,
  d.display_name,
  d.specialization,
  d.city,
  d.rating_avg,
  ST_Distance(
    d.location, 
    ST_MakePoint(28.0473, -26.2041)::geography  -- Johannesburg coordinates
  ) / 1000 as distance_km
FROM doctors d
WHERE 
  d.verified = TRUE
  AND ST_DWithin(
    d.location, 
    ST_MakePoint(28.0473, -26.2041)::geography, 
    10000  -- 10km in meters
  )
ORDER BY distance_km
LIMIT 20;
```

### 2. Get Doctor with Reviews

```sql
SELECT 
  d.*,
  COUNT(r.id) FILTER (WHERE r.verified_visit = TRUE) as verified_reviews,
  COUNT(r.id) as total_reviews,
  AVG(r.rating) FILTER (WHERE r.verified_visit = TRUE) as verified_rating_avg
FROM doctors d
LEFT JOIN reviews r ON r.doctor_id = d.id
WHERE d.id = 'doctor-uuid-here'
GROUP BY d.id;
```

### 3. Appointment Statistics

```sql
SELECT 
  d.id,
  d.display_name,
  COUNT(a.id) as total_appointments,
  COUNT(a.id) FILTER (WHERE a.status = 'completed') as completed,
  COUNT(a.id) FILTER (WHERE a.status = 'cancelled') as cancelled,
  COUNT(a.id) FILTER (WHERE a.status = 'no_show') as no_show
FROM doctors d
LEFT JOIN appointments a ON a.doctor_id = d.id
WHERE d.id = 'doctor-uuid-here'
GROUP BY d.id, d.display_name;
```

### 4. Search Doctors by Specialty and Location

```sql
SELECT 
  d.*,
  ST_Distance(
    d.location,
    ST_MakePoint(:lng, :lat)::geography
  ) / 1000 as distance_km
FROM doctors d
WHERE 
  d.specialization ILIKE '%' || :specialty || '%'
  AND d.city = :city
  AND d.verified = TRUE
  AND d.rating_avg >= :min_rating
ORDER BY 
  CASE WHEN d.subscription_plan = 'featured' THEN 1 ELSE 2 END,
  distance_km,
  d.rating_avg DESC
LIMIT :limit;
```

### 5. Get Upcoming Appointments

```sql
SELECT 
  a.*,
  u.full_name as patient_name,
  u.phone as patient_phone,
  d.display_name as doctor_name,
  c.name as clinic_name
FROM appointments a
JOIN users u ON u.id = a.user_id
JOIN doctors d ON d.id = a.doctor_id
LEFT JOIN clinics c ON c.id = a.clinic_id
WHERE 
  a.doctor_id = :doctor_id
  AND a.start_time >= NOW()
  AND a.status IN ('booked', 'confirmed')
ORDER BY a.start_time;
```

### 6. Get Reviews for Doctor

```sql
SELECT 
  r.*,
  u.full_name as patient_name,
  a.start_time as appointment_date,
  CASE 
    WHEN r.verified_visit THEN 'Verified Visit'
    ELSE 'Unverified'
  END as review_type
FROM reviews r
JOIN users u ON u.id = r.user_id
JOIN appointments a ON a.id = r.appointment_id
WHERE r.doctor_id = :doctor_id
ORDER BY r.created_at DESC;
```

## Prisma Schema (Alternative)

If using Prisma ORM, see `backend/prisma/schema.prisma` for the Prisma schema definition.

## Migration Strategy

### Using Prisma (Recommended)
```bash
# Initialize Prisma
npx prisma init

# Create migration
npx prisma migrate dev --name initial_schema

# Apply migrations
npx prisma migrate deploy
```

### Using Raw SQL
```bash
# Run schema file
psql -d ratedoctor -f backend/database/schema.sql

# For production, use migration files
psql -d ratedoctor -f backend/database/migrations/001_initial_schema.sql
```

## Database Maintenance

### Backup
```bash
# Create backup
pg_dump -d ratedoctor -F c -f backup_$(date +%Y%m%d).dump

# Restore
pg_restore -d ratedoctor backup_20240101.dump
```

### Vacuum and Analyze
```sql
-- Regular maintenance
VACUUM ANALYZE doctors;
VACUUM ANALYZE reviews;
VACUUM ANALYZE appointments;
```

### Performance Monitoring
```sql
-- Check slow queries
SELECT * FROM pg_stat_statements 
ORDER BY total_time DESC 
LIMIT 10;

-- Check index usage
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_scan;
```

