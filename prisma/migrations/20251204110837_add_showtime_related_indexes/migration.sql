-- CreateIndex
CREATE INDEX "Reservation_showtimeId_status_idx" ON "Reservation"("showtimeId", "status");

-- CreateIndex
CREATE INDEX "ReservedSeat_reservationId_idx" ON "ReservedSeat"("reservationId");

-- CreateIndex
CREATE INDEX "Seat_auditoriumId_idx" ON "Seat"("auditoriumId");

-- CreateIndex
CREATE INDEX "Showtime_endTime_startTime_idx" ON "Showtime"("endTime", "startTime");
