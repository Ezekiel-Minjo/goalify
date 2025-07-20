echo "🚀 Starting Smart Goal Planner..."
echo "📊 Starting JSON Server on port 3000..."
json-server --watch data/db.json --port 3000 &
echo "🌐 Starting Live Server on port 8080..."
live-server src --port=8080