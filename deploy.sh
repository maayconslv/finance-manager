#!/bin/bash
set -e

echo "Running database migrations..."
npx prisma migrate deploy

echo "Starting application..."
npm start