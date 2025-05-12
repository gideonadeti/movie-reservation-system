import {
  IsDefined,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
} from 'class-validator';

export class CreateAuditoriumDto {
  /**
   * Auditorium's name
   * @example 'Auditorium 1'
   */
  @IsNotEmpty()
  @IsString()
  name: string;

  /**
   * Auditorium's capacity
   * @example 100
   */
  @IsDefined()
  @IsNumber()
  @IsPositive()
  capacity: number;
}
