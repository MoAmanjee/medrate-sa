#!/bin/bash

echo "🗺️ Google Maps API Setup Helper"
echo "================================"
echo ""

# Check if .env.local exists
if [ -f "frontend/.env.local" ]; then
    echo "✅ Found existing .env.local file"
    if grep -q "NEXT_PUBLIC_GOOGLE_MAPS_API_KEY" frontend/.env.local; then
        echo "✅ Google Maps API key already configured"
        echo ""
        echo "Current configuration:"
        grep "NEXT_PUBLIC_GOOGLE_MAPS_API_KEY" frontend/.env.local
    else
        echo "⚠️  Google Maps API key not found in .env.local"
        echo ""
        read -p "Enter your Google Maps API key: " api_key
        echo "NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=$api_key" >> frontend/.env.local
        echo "✅ API key added to .env.local"
    fi
else
    echo "📝 Creating new .env.local file"
    echo ""
    read -p "Enter your Google Maps API key: " api_key
    echo "NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=$api_key" > frontend/.env.local
    echo "✅ Created .env.local with API key"
fi

echo ""
echo "🚀 Next steps:"
echo "1. Restart your development server: npm run dev"
echo "2. Visit http://localhost:3001/hospitals/map"
echo "3. You should see the interactive map with all hospital locations!"
echo ""
echo "📚 For detailed setup instructions, see: GOOGLE_MAPS_SETUP.md"
