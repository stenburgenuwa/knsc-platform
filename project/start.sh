#!/bin/bash

# KNSCL Platform - Development Server Startup

echo "🚀 Starting KNSCL Platform..."
echo ""
echo "Checking Node.js..."
node --version

echo ""
echo "Installing dependencies..."
npm install

echo ""
echo "Starting development server..."
npm run dev

echo ""
echo "✅ Server running at http://localhost:3000"
