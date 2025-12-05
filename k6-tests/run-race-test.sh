#!/bin/bash

# Simple wrapper to run the test using .env.test.local file

ENV_FILE="k6-tests/.env.test.local"

if [ ! -f "$ENV_FILE" ]; then
    echo "❌ Test data file not found: $ENV_FILE"
    echo "   Please run ./k6-tests/get-race-test-data.sh first"
    exit 1
fi

# Source the env file and export variables
set -a
source "$ENV_FILE"
set +a

# Run k6 with the environment variables
k6 run \
  --env BASE_URL="$BASE_URL" \
  --env AUTH_TOKEN="$AUTH_TOKEN" \
  --env SHOWTIME_ID="$SHOWTIME_ID" \
  --env SEAT_ID_1="$SEAT_ID_1" \
  --env SEAT_ID_2="$SEAT_ID_2" \
  --env PRICE_PER_SEAT="$PRICE_PER_SEAT" \
  k6-tests/seat-race-test.js

