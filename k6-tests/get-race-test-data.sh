#!/bin/bash

# Simple script to get test data for the seat race condition test

BASE_URL="http://localhost:3000/api/v1"

echo "🔍 Getting test data..."
echo ""

# Check if jq is installed
if ! command -v jq &> /dev/null; then
    echo "⚠️  jq is not installed. Using basic parsing (less reliable)."
    USE_JQ=false
else
    USE_JQ=true
fi

# Step 1: Get JWT Token
echo "Step 1: Sign in to get JWT token"
echo "Enter your email:"
read -r EMAIL
echo "Enter your password:"
read -rs PASSWORD
echo ""

echo "Signing in..."
SIGN_IN=$(curl -s -X POST "${BASE_URL}/auth/sign-in" \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"${EMAIL}\", \"password\": \"${PASSWORD}\"}")

# Extract token using jq if available
if [ "$USE_JQ" = true ]; then
    AUTH_TOKEN=$(echo "$SIGN_IN" | jq -r '.accessToken // empty')
else
    AUTH_TOKEN=$(echo "$SIGN_IN" | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)
fi

if [ -z "$AUTH_TOKEN" ] || [ "$AUTH_TOKEN" = "null" ] || [ "$AUTH_TOKEN" = "" ]; then
    echo "❌ Failed to sign in. Response:"
    echo "$SIGN_IN"
    exit 1
fi

echo "✅ Got token: ${AUTH_TOKEN:0:30}..."
echo ""

# Step 2: Get Showtime
echo "Step 2: Getting showtime..."
SHOWTIMES=$(curl -s "${BASE_URL}/showtimes")

if [ "$USE_JQ" = true ]; then
    SHOWTIME_ID=$(echo "$SHOWTIMES" | jq -r '.[0].id // empty')
    SHOWTIME_PRICE=$(echo "$SHOWTIMES" | jq -r '.[0].price // empty')
    AUDITORIUM_ID=$(echo "$SHOWTIMES" | jq -r '.[0].auditoriumId // empty')
else
    SHOWTIME_ID=$(echo "$SHOWTIMES" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
    SHOWTIME_PRICE=$(echo "$SHOWTIMES" | grep -o '"price":[0-9.]*' | head -1 | cut -d':' -f2)
    AUDITORIUM_ID=$(echo "$SHOWTIMES" | grep -o '"auditoriumId":"[^"]*' | head -1 | cut -d'"' -f4)
fi

if [ -z "$SHOWTIME_ID" ]; then
    echo "❌ No showtimes found. Make sure you have showtimes in your database."
    exit 1
fi

echo "✅ Showtime ID: $SHOWTIME_ID"
echo "✅ Price: $SHOWTIME_PRICE"
echo "✅ Auditorium ID: $AUDITORIUM_ID"
echo ""

# Step 3: Get Seats
echo "Step 3: Getting seats..."
SEATS=$(curl -s -H "Authorization: Bearer ${AUTH_TOKEN}" \
  "${BASE_URL}/seats?auditoriumId=${AUDITORIUM_ID}")

if [ "$USE_JQ" = true ]; then
    SEAT_ID_1=$(echo "$SEATS" | jq -r '.[0].id // empty')
    SEAT_ID_2=$(echo "$SEATS" | jq -r '.[1].id // empty')
else
    SEAT_ID_1=$(echo "$SEATS" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
    SEAT_ID_2=$(echo "$SEATS" | grep -o '"id":"[^"]*' | head -2 | tail -1 | cut -d'"' -f4)
fi

if [ -z "$SEAT_ID_1" ] || [ -z "$SEAT_ID_2" ]; then
    echo "❌ Not enough seats found. Need at least 2 seats."
    exit 1
fi

echo "✅ Seat 1: $SEAT_ID_1"
echo "✅ Seat 2: $SEAT_ID_2"
echo ""

# Step 4: Save to .env.test.local file
ENV_FILE="k6-tests/.env.test.local"
cat > "$ENV_FILE" << EOF
# Test data for k6 race condition tests
# Generated on $(date)

BASE_URL="${BASE_URL}"
AUTH_TOKEN="${AUTH_TOKEN}"
SHOWTIME_ID="${SHOWTIME_ID}"
SEAT_ID_1="${SEAT_ID_1}"
SEAT_ID_2="${SEAT_ID_2}"
PRICE_PER_SEAT="${SHOWTIME_PRICE}"
EOF

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ All data collected and saved to: $ENV_FILE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Run the tests with:"
echo "  ./k6-tests/run-race-test.sh     # Seat race condition test"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
