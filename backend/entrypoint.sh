#!/bin/bash
# entrypoint.sh

# Set the TZ environment variable to the value of the TIMEZONE environment variable
export TZ=${TIMEZONE:-UTC}

# Function to check if the database is ready
wait_for_postgres() {
  until pg_isready -h db -p 5432 -U user; do
    >&2 echo "Postgres is unavailable - sleeping"
    sleep 1
  done
  >&2 echo "Postgres is up - continuing"
}

# Function to check if migrations are needed
check_migrations() {
  echo "Checking if migrations are needed..."
  RESULT=$(psql -h db -U user -d task_scheduler -c "SELECT to_regclass('public.SequelizeMeta');")
  if [[ $RESULT == *"SequelizeMeta"* ]]; then
    echo "Migrations have already been run."
  else
    echo "Running migrations..."
    npx sequelize-cli db:migrate
  fi
}

# Wait for the PostgreSQL database to be ready
wait_for_postgres

# Check if migrations are needed and run them if necessary
check_migrations

# Start the application
npm run dev
