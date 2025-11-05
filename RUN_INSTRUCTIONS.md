# How to Run Rate The Doctor

## 🚀 Quick Start

### Option 1: Automated Script (Recommended)

```bash
# Make scripts executable (if not already)
chmod +x scripts/*.sh

# Start all services
./scripts/start-dev.sh
```

This will:
- ✅ Check prerequisites
- ✅ Create .env files
- ✅ Install dependencies
- ✅ Start backend (port 8000)
- ✅ Start frontend (port 3000)

### Option 2: Manual Setup

#### Step 1: Database Setup
```bash
# Install PostgreSQL with PostGIS (if not installed)
# macOS:
brew install postgresql@15 postgis

# Create database
createdb ratedoctor

# Enable PostGIS
psql -d ratedoctor -c "CREATE EXTENSION IF NOT EXISTS postgis;"

# Run schema
psql -d ratedoctor -f backend/database/schema.sql
```

#### Step 2: Backend Setup
```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Edit .env with your settings (use mock modes for development)

# Start backend
uvicorn app.main:app --reload
```

Backend runs on: **http://localhost:8000**
API Docs: **http://localhost:8000/docs**

#### Step 3: Frontend Setup
```bash
cd web-frontend

# Install dependencies
npm install

# Create .env.local
cp .env.example .env.local
# Edit .env.local

# Start frontend
npm run dev
```

Frontend runs on: **http://localhost:3000**

#### Step 4: Mobile App (Optional)
```bash
cd mobile-app

# Install Flutter dependencies
flutter pub get

# Run on iOS
flutter run -d ios

# Run on Android
flutter run -d android
```

## 📋 Environment Setup

### Backend (.env)
All mock modes are enabled by default for development:
```bash
HPCSA_MOCK_MODE=true
GOOGLE_MAPS_MOCK_MODE=true
PAYMENT_MOCK_MODE=true
OPENAI_MOCK_MODE=true
```

### Frontend (.env.local)
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 🐳 Docker Alternative

If you have Docker installed:

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## ✅ Verification

Once services are running:

1. **Backend**: http://localhost:8000/health
2. **API Docs**: http://localhost:8000/docs
3. **Frontend**: http://localhost:3000

## 🛠️ Troubleshooting

### Backend won't start
- Check PostgreSQL is running: `pg_isready`
- Verify DATABASE_URL in `.env`
- Check port 8000: `lsof -i:8000`

### Frontend won't start
- Check Node version: `node --version` (needs 18+)
- Reinstall: `rm -rf node_modules && npm install`
- Check port 3000: `lsof -i:3000`

### Database errors
- Ensure PostgreSQL is running
- Check database exists: `psql -l | grep ratedoctor`
- Verify PostGIS: `psql -d ratedoctor -c "SELECT PostGIS_version();"`

## 📚 Next Steps

1. **Review API**: Visit http://localhost:8000/docs
2. **Test Endpoints**: Use the interactive API docs
3. **Browse Frontend**: Visit http://localhost:3000
4. **Check Logs**: `tail -f logs/backend.log` or `logs/frontend.log`

## 🎯 Current Status

✅ **All code is ready**
✅ **All adapters have mock modes**
✅ **Database schema complete**
✅ **Frontend and mobile scaffolds ready**

**Ready to implement and deploy!**

