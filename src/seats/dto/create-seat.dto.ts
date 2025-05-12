import { IsDefined, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateSeatDto {
  /**
   * Seat's label
   * @example 'A1'
   *
   */
  @IsNotEmpty()
  @IsString()
  label: string;

  /**
   * Seat's auditorium ID
   * @example '123e4567-e89b-12d3-a456-426655440000'
   */
  @IsDefined()
  @IsUUID()
  auditoriumId: string;
}
