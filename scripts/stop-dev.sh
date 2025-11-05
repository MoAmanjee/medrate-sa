#!/bin/bash

# Stop Development Services

echo "🛑 Stopping Rate The Doctor services..."

if [ -f .dev-pids ]; then
    PIDS=$(cat .dev-pids)
    kill $PIDS 2>/dev/null
    rm .dev-pids
    echo "✅ Services stopped"
else
    echo "⚠️  No running services found"
    # Try to kill by port
    lsof -ti:8000 | xargs kill -9 2>/dev/null
    lsof -ti:3000 | xargs kill -9 2>/dev/null
    echo "✅ Ports cleared"
fi

