# Quick Start Guide

## Prerequisites

1. **Python 3.11+**
   ```bash
   python3 --version
   ```

2. **Node.js 18+**
   ```bash
   node --version
   ```

3. **PostgreSQL 15+** (with PostGIS)
   ```bash
   # macOS
   brew install postgresql@15 postgis
   
   # Ubuntu/Debian
   sudo apt-get install postgresql-15 postgresql-15-postgis
   ```

4. **Redis** (optional, for caching)
   ```bash
   # macOS
   brew install redis
   
   # Ubuntu/Debian
   sudo apt-get install redis-server
   ```

## Quick Start (Automated)

```bash
# Make scripts executable
chmod +x scripts/*.sh

# Start all services
./scripts/start-dev.sh

# Stop all services
./scripts/stop-dev.sh
```

## Manual Setup

### 1. Database Setup

```bash
# Create database
createdb ratedoctor

# Enable PostGIS
psql -d ratedoctor -c "CREATE EXTENSION IF NOT EXISTS postgis;"

# Run schema
psql -d ratedoctor -f backend/database/schema.sql
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Edit .env with your configuration

# Run migrations (if using Alembic)
alembic upgrade head

# Start server
uvicorn app.main:app --reload
```

Backend will run on: http://localhost:8000
API docs: http://localhost:8000/docs

### 3. Frontend Setup

```bash
cd web-frontend

# Install dependencies
npm install

# Create .env.local
cp .env.example .env.local
# Edit .env.local

# Start development server
npm run dev
```

Frontend will run on: http://localhost:3000

### 4. Mobile App Setup

```bash
cd mobile-app

# Install Flutter dependencies
flutter pub get

# Run on iOS simulator
flutter run -d ios

# Run on Android emulator
flutter run -d android
```

## Environment Variables

### Backend (.env)

```bash
DATABASE_URL=postgresql://user:pass@localhost:5432/ratedoctor
JWT_SECRET=your-secret-key
REDIS_URL=redis://localhost:6379

# Mock modes (set to true for development)
HPCSA_MOCK_MODE=true
GOOGLE_MAPS_MOCK_MODE=true
PAYMENT_MOCK_MODE=true
OPENAI_MOCK_MODE=true
```

### Frontend (.env.local)

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-key
```

## Docker Setup (Alternative)

If you have Docker installed:

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## Troubleshooting

### Backend won't start
- Check if PostgreSQL is running: `pg_isready`
- Verify DATABASE_URL in .env
- Check port 8000 is available: `lsof -i:8000`

### Frontend won't start
- Check Node.js version: `node --version`
- Delete node_modules and reinstall: `rm -rf node_modules && npm install`
- Check port 3000 is available: `lsof -i:3000`

### Database connection errors
- Ensure PostgreSQL is running
- Check database exists: `psql -l | grep ratedoctor`
- Verify PostGIS extension: `psql -d ratedoctor -c "SELECT PostGIS_version();"`

## Next Steps

1. **Review Documentation**: Check `docs/` folder
2. **Configure APIs**: Set up real API keys when ready
3. **Run Tests**: `cd backend && pytest`
4. **Deploy**: Follow deployment guide in `docs/DEPLOYMENT.md`

---

**Need Help?** Check the documentation in `/docs` or see `IMPLEMENTATION_GUIDE.md`

