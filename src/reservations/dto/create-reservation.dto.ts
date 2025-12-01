import {
  IsArray,
  IsNotEmpty,
  IsUUID,
  ArrayNotEmpty,
  ArrayUnique,
  IsDefined,
  IsIn,
  IsNumber,
  IsPositive,
  Min,
} from 'class-validator';

import { ReservationStatus } from '@prisma/client';

export class CreateReservationDto {
  /**
   * Reservation's showtime ID
   * @example '123e4567-e89b-12d3-a456-426655440000'
   */
  @IsUUID()
  @IsNotEmpty()
  showtimeId: string;

  /**
   * Reservation's seat IDs
   * @example ['123e4567-e89b-12d3-a456-426655440000', '123e4567-e89b-12d3-a456-426655440001']
   */
  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  @IsUUID('all', { each: true })
  seatIds: string[];

  /**
   * Amount paid by the user (must be >= number of seats × showtime price)
   * @example 25.0
   */
  @IsNumber()
  @IsPositive()
  @Min(0)
  amountPaid: number;

  /**
   * Reservation's status
   * @example 'CONFIRMED'
   */
  @IsDefined()
  @IsIn(Object.values(ReservationStatus))
  status?: ReservationStatus;
}
