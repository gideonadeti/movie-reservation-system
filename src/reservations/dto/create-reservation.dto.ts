import {
  IsArray,
  IsNotEmpty,
  IsUUID,
  ArrayNotEmpty,
  ArrayUnique,
  IsDefined,
  IsIn,
} from 'class-validator';

import { ReservationStatus } from 'generated/prisma';

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
   * Reservation's status
   * @example 'CONFIRMED'
   */
  @IsDefined()
  @IsIn(Object.values(ReservationStatus))
  status?: ReservationStatus;
}
