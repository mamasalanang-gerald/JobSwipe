#!/bin/bash

echo "Checking production PostgreSQL tables..."
# Set DATABASE_URL environment variable with your connection string from Render dashboard
# Example: export DATABASE_URL="postgresql://user:pass@host:5432/dbname"
# docker run -it --rm postgres:15-alpine psql "$DATABASE_URL" -c "\dt"
echo "Please set DATABASE_URL environment variable with your PostgreSQL connection string from Render dashboard"
