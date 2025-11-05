#!/bin/bash

# Rate The Doctor - Development Startup Script

echo "🚀 Starting Rate The Doctor Development Environment..."

# Check prerequisites
echo "📋 Checking prerequisites..."

if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 not found. Please install Python 3.11+"
    exit 1
fi

if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 18+"
    exit 1
fi

if ! command -v psql &> /dev/null; then
    echo "⚠️  PostgreSQL client not found. Database setup required."
    echo "   Install PostgreSQL: brew install postgresql@15 (macOS) or apt-get install postgresql (Linux)"
fi

# Create .env files if they don't exist
echo "📝 Setting up environment files..."

if [ ! -f backend/.env ]; then
    echo "Creating backend/.env..."
    cat > backend/.env << EOF
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ratedoctor

# Authentication
JWT_SECRET=$(openssl rand -hex 32)
FIREBASE_PROJECT_ID=your-project-id

# External APIs (Mock modes for development)
HPCSA_MOCK_MODE=true
GOOGLE_MAPS_MOCK_MODE=true
PAYMENT_MOCK_MODE=true
OPENAI_MOCK_MODE=true
USER_VERIFICATION_MOCK_MODE=true

# Payment Providers
PAYMENT_PROVIDER=payfast
PAYFAST_MERCHANT_ID=your-merchant-id
PAYFAST_MERCHANT_KEY=your-merchant-key
PAYFAST_SANDBOX=true

# Redis
REDIS_URL=redis://localhost:6379

# Application
NODE_ENV=development
PORT=8000
API_VERSION=v1
EOF
    echo "✅ Created backend/.env"
fi

if [ ! -f web-frontend/.env.local ]; then
    echo "Creating web-frontend/.env.local..."
    cat > web-frontend/.env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-key
EOF
    echo "✅ Created web-frontend/.env.local"
fi

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi
source venv/bin/activate
pip install -q -r requirements.txt
echo "✅ Backend dependencies installed"

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd ../web-frontend
if [ ! -d "node_modules" ]; then
    npm install
fi
echo "✅ Frontend dependencies installed"

# Start services
echo ""
echo "🎯 Starting services..."
echo ""

# Start backend in background
echo "Starting backend API on http://localhost:8000..."
cd ../backend
source venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"

# Wait a bit for backend to start
sleep 3

# Start frontend
echo "Starting frontend on http://localhost:3000..."
cd ../web-frontend
npm run dev > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
echo "Frontend PID: $FRONTEND_PID"

# Create logs directory
mkdir -p ../logs

echo ""
echo "✅ Services started!"
echo ""
echo "📊 Service URLs:"
echo "   Backend API:  http://localhost:8000"
echo "   API Docs:     http://localhost:8000/docs"
echo "   Frontend:     http://localhost:3000"
echo ""
echo "📝 Logs:"
echo "   Backend:  tail -f logs/backend.log"
echo "   Frontend: tail -f logs/frontend.log"
echo ""
echo "🛑 To stop services:"
echo "   kill $BACKEND_PID $FRONTEND_PID"
echo ""
echo "   Or use: ./scripts/stop-dev.sh"
echo ""

# Save PIDs
echo "$BACKEND_PID $FRONTEND_PID" > .dev-pids

