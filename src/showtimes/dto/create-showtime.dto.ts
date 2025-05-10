import {
  IsDate,
  IsDefined,
  IsNumber,
  IsPositive,
  IsUUID,
} from 'class-validator';

export class CreateShowtimeDto {
  /**
   * Showtime's start time (ISO 8601 format)
   * @example "2025-05-09T19:30:00Z"
   */
  @IsDefined()
  @IsDate()
  startTime: Date;

  /**
   * Showtime's price
   * @example 12.5
   */
  @IsDefined()
  @IsNumber()
  @IsPositive()
  price: number;

  /**
   * Showtime's movie ID
   * @example "b0b4a9c8-9a7e-4f88-91b9-7340ef2304af"
   */
  @IsDefined()
  @IsUUID()
  movieId: string;

  /**
   * Showtime's auditorium ID
   * @example "c3f7e6a1-5a77-4e2a-9483-f38d83a315c4"
   */
  @IsDefined()
  @IsUUID()
  auditoriumId: string;
}
