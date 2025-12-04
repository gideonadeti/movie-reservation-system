import { IsNumber, IsOptional, Min } from 'class-validator';

export class SeedShowtimesDto {
  /**
   * Number of showtimes to create. Defaults to 8.
   * @example 8
   */
  @IsOptional()
  @IsNumber()
  @Min(1)
  count?: number;
}
