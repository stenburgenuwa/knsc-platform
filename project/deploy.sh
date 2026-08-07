#!/bin/bash
set -e

echo "Starting KNSCL Platform deployment..."

# Check environment variables
required_vars=(
  "DATABASE_URL"
  "JWT_SECRET"
  "NODE_ENV"
)

for var in "${required_vars[@]}"; do
  if [ -z "${!var}" ]; then
    echo "ERROR: Required environment variable $var is not set"
    exit 1
  fi
done

echo "Environment variables verified."

# Build application
echo "Building application..."
npm install
npm run build

# Run database migrations
echo "Running database migrations..."
npx prisma migrate deploy

# Seed database (if development/testing)
if [ "$NODE_ENV" != "production" ]; then
  echo "Seeding database..."
  npm run seed
fi

echo "Health check..."
npm run health-check

echo "Deployment complete!"
