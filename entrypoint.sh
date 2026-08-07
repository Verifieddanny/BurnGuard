#!/bin/sh
set -e

echo "Running database migrations..."
if [ -n "$DATABASE_URL" ]; then
  migrate -path ./internal/migrations -database "$DATABASE_URL" up
  echo "Database migrations completed successfully!"
else
  echo "DATABASE_URL is not set, skipping migrations."
fi

echo "Starting Go API server..."
exec "$@"
