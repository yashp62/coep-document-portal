#!/bin/bash

# Render Deployment Script
# This script runs after the application is built but before it starts

echo "🚀 Starting COEP Document Portal deployment setup..."

# Navigate to backend directory
cd backend

echo "📦 Installing dependencies..."
npm install

echo "🗄️ Setting up database..."
# Run migrations
echo "Running database migrations..."
npx sequelize-cli db:migrate

echo "🌱 Seeding demo data..."
# Run seeders
npx sequelize-cli db:seed:all

echo "✅ Database setup complete!"

echo "🎉 Deployment setup finished! Starting server..."