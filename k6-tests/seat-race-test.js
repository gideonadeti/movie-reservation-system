/**
 * SIMPLE RACE CONDITION TEST - SAME SEATS
 *
 * What this tests:
 * - 10 people try to reserve the SAME 2 seats at the same time
 * - Only 1 should succeed (transaction prevents double-booking)
 * - 9 should fail with "already reserved" error
 */

import http from 'k6/http';
import { check } from 'k6';

// Configuration - set these when running the test
const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000/api/v1';
const AUTH_TOKEN = __ENV.AUTH_TOKEN || '';
const SHOWTIME_ID = __ENV.SHOWTIME_ID || '';
const SEAT_ID_1 = __ENV.SEAT_ID_1 || '';
const SEAT_ID_2 = __ENV.SEAT_ID_2 || '';
const PRICE_PER_SEAT = parseFloat(__ENV.PRICE_PER_SEAT || '10.0');

// Test setup: 10 users, all start at the same time
export const options = {
  scenarios: {
    race_test: {
      executor: 'shared-iterations',
      vus: 10, // 10 virtual users
      iterations: 10, // Each makes 1 request
      maxDuration: '60s',
    },
  },
};

// This runs for each of the 10 users
export default function () {
  // All users try to reserve the SAME seats
  const seatIds = [SEAT_ID_1, SEAT_ID_2];
  const amountPaid = seatIds.length * PRICE_PER_SEAT;

  const payload = JSON.stringify({
    showtimeId: SHOWTIME_ID,
    seatIds: seatIds,
    amountPaid: amountPaid,
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${AUTH_TOKEN}`,
    },
  };

  // Send the request
  const response = http.post(`${BASE_URL}/reservations`, payload, params);

  // Check what happened
  const success = check(response, {
    'status is 201 (success)': (r) => r.status === 201,
    'status is 400 (conflict)': (r) => r.status === 400,
  });

  // Log the result
  if (response.status === 201) {
    console.log(`✅ User ${__VU}: SUCCESS - Got the seats!`);
  } else if (response.status === 400) {
    const body = JSON.parse(response.body);
    console.log(`⚠️  User ${__VU}: FAILED - ${body.message}`);
  } else {
    console.log(`❌ User ${__VU}: ERROR - Status ${response.status}`);
  }
}
