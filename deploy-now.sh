#!/bin/bash

# COEP Document Portal - Instant Deployment Script
# Run this after creating your GitHub repository

echo "🚀 COEP Document Portal - Deployment Script"
echo "============================================="

# Check if repository URL is provided
if [ -z "$1" ]; then
    echo "❌ Error: Please provide your GitHub repository URL"
    echo ""
    echo "Usage: ./deploy-now.sh <your-github-repo-url>"
    echo "Example: ./deploy-now.sh https://github.com/yashp62/coep-document-portal.git"
    echo ""
    echo "Steps to get your repo URL:"
    echo "1. Go to https://github.com"
    echo "2. Click 'New repository'"
    echo "3. Name it: coep-document-portal"
    echo "4. Keep it public"
    echo "5. Don't initialize with README (we already have one)"
    echo "6. Copy the repository URL and run this script again"
    exit 1
fi

REPO_URL=$1

echo "📋 Repository URL: $REPO_URL"
echo ""

# Step 1: Add remote origin
echo "🔗 Step 1: Adding remote origin..."
git remote add origin $REPO_URL
if [ $? -eq 0 ]; then
    echo "✅ Remote origin added successfully"
else
    echo "⚠️  Remote origin might already exist, continuing..."
    git remote set-url origin $REPO_URL
fi

# Step 2: Push to GitHub
echo ""
echo "📤 Step 2: Pushing code to GitHub..."
git push -u origin main
if [ $? -eq 0 ]; then
    echo "✅ Code pushed to GitHub successfully!"
else
    echo "❌ Failed to push to GitHub. Please check your repository URL and try again."
    exit 1
fi

# Step 3: Display Render deployment instructions
echo ""
echo "🎉 GitHub Setup Complete!"
echo "========================="
echo ""
echo "🔥 Now deploy to Render:"
echo "1. Go to https://render.com"
echo "2. Click 'New +'  → 'Blueprint'"
echo "3. Connect your GitHub account"
echo "4. Select repository: coep-document-portal"
echo "5. Click 'Connect'"
echo ""
echo "🎯 Render will automatically:"
echo "   • Create PostgreSQL database"
echo "   • Deploy backend API"
echo "   • Deploy frontend app"
echo "   • Run database migrations"
echo "   • Seed initial data"
echo ""
echo "📱 Your app will be live at:"
echo "   Frontend: https://coep-frontend.onrender.com"
echo "   Backend:  https://coep-backend.onrender.com"
echo ""
echo "⚡ Deployment usually takes 5-10 minutes"
echo "💡 Check deployment status in Render dashboard"
echo ""
echo "🔐 Default login credentials:"
echo "   Email: admin@coep.ac.in"
echo "   Password: admin123"
echo ""
echo "🎊 Your COEP Document Portal will be live for demo!"