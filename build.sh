#!/bin/bash
echo "Current directory:"
pwd
echo "Directory contents:"
ls -la

echo "Installing frontend dependencies..."
if [ -d "frontend" ]; then
  cd frontend
  npm install
  echo "Building frontend..."
  npm run build
  cd ..
else
  echo "frontend directory NOT FOUND!"
fi

echo "Building backend..."
if [ -d "backend" ]; then
  cd backend
  python manage.py collectstatic --noinput
  python manage.py migrate
  cd ..
else
  echo "backend directory NOT FOUND!"
fi
