#!/bin/bash
echo "Installing frontend dependencies..."
cd frontend
npm install
echo "Building frontend..."
npm run build
cd ..

echo "Building backend..."
cd backend
# Install python dependencies is handled by Vercel directly if requirements.txt is in root
python manage.py collectstatic --noinput
python manage.py migrate
cd ..
