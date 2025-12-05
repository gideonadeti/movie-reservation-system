# How to Run k6 Race Condition Tests

## Prerequisites

Before running the tests, you need to install the following tools:

- **k6** (Required) - Load testing tool. See [k6 installation guide](https://grafana.com/docs/k6/latest/set-up/install-k6/)
- **jq** (Optional but Recommended) - JSON processor. The `get-race-test-data.sh` script works without `jq`, but it's more reliable with it installed. See [jq downloads](https://jqlang.org/download/)

---

## Seat Race Condition Test

## Easy Way (Recommended)

1. **Make sure your server is running:**

   ```bash
   npm run start:dev
   ```

2. **Run the helper script:**

   ```bash
   ./k6-tests/get-race-test-data.sh
   ```

   You'll be prompted to enter your email and password (password input will be hidden for security).

   The script will automatically:
   - Sign in to get your JWT authentication token
   - Fetch an available showtime and its price
   - Get two seat IDs from the showtime's auditorium
   - Save all this data to `k6-tests/.env.test.local`

3. **Run the test:**

   ```bash
   ./k6-tests/run-race-test.sh
   ```

   This will run the k6 test using the data collected in step 2.

---

## Manual Way (If you prefer)

### Step 1: Get JWT Token

```bash
curl -X POST http://localhost:3000/api/v1/auth/sign-in \
  -H "Content-Type: application/json" \
  -d '{"email": "your-email@example.com", "password": "your-password"}'
```

Copy the `accessToken` from the response.

### Step 2: Get Showtime ID

```bash
curl http://localhost:3000/api/v1/showtimes
```

Copy one `id` and the `price` from the response.

### Step 3: Get Seat IDs

```bash
# First, get auditorium ID from the showtime response above
# Then get seats:
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:3000/api/v1/seats?auditoriumId=AUDITORIUM_ID"
```

Copy any 2 seat `id` values.

### Step 4: Run the Test

```bash
k6 run \
  --env BASE_URL=http://localhost:3000/api/v1 \
  --env AUTH_TOKEN="your-token-here" \
  --env SHOWTIME_ID="showtime-id-here" \
  --env SEAT_ID_1="first-seat-id" \
  --env SEAT_ID_2="second-seat-id" \
  --env PRICE_PER_SEAT=10.0 \
  k6-tests/seat-race-test.js
```

---

## What to Expect

- ✅ **1 user should succeed** (status 201) - Got the seats!
- ⚠️ **9 users should fail** (status 400) - "Seats already reserved"

**If more than 1 succeeds, your transactions aren't working correctly!**

---

## How It Works

This test verifies that your transaction implementation correctly prevents double-booking through:

1. **Unique Constraint**: The `@@unique([seatId, showtimeId])` constraint on `ReservedSeat` prevents the same seat from being reserved twice for the same showtime
2. **Transaction Isolation**: All validation and creation happens within a single transaction
3. **Error Handling**: When a unique constraint violation occurs (P2002), the application returns a user-friendly error message

The test simulates a real-world scenario where multiple users try to book the same popular seats simultaneously, ensuring only one succeeds.
