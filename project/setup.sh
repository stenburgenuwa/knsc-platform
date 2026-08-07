#!/bin/bash

echo "🚀 Setting up KNSCL Platform with complete database and sample data..."
echo ""

# Step 1: Install dependencies
echo "📦 Installing dependencies..."
npm install

# Step 2: Generate Prisma Client
echo "🔧 Generating Prisma Client..."
npx prisma generate

# Step 3: Run migrations
echo "🗄️ Running database migrations..."
npx prisma migrate dev --name init

# Step 4: Seed database with sample data
echo "📝 Seeding database with sample data..."
npm run seed

# Step 5: Start development server
echo ""
echo "✅ Setup complete!"
echo ""
echo "🌐 Starting development server..."
echo ""
npm run dev

echo ""
echo "🎉 KNSCL Platform is running!"
echo "📍 Open: http://localhost:3000"
echo ""
echo "Pages available:"
echo "  - Home: http://localhost:3000"
echo "  - Fixtures: http://localhost:3000/fixtures"
echo "  - Results: http://localhost:3000/results"
echo "  - Standings: http://localhost:3000/standings"
echo "  - Clubs: http://localhost:3000/clubs"
echo "  - Players: http://localhost:3000/players"
echo "  - News: http://localhost:3000/news"
echo ""
