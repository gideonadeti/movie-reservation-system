import {
  IsIn,
  IsOptional,
  IsPositive,
  IsUUID,
  IsNumber,
  IsDate,
} from 'class-validator';

export class FindAllShowtimesDto {
  /** Start time after this */
  @IsOptional()
  @IsDate()
  startTimeFrom?: Date;

  /** Start time before this */
  @IsOptional()
  @IsDate()
  startTimeTo?: Date;

  /** End time after this */
  @IsOptional()
  @IsDate()
  endTimeFrom?: Date;

  /** End time before this */
  @IsOptional()
  @IsDate()
  endTimeTo?: Date;

  /** Minimum price */
  @IsOptional()
  @IsNumber()
  @IsPositive()
  minPrice?: number;

  /** Maximum price */
  @IsOptional()
  @IsNumber()
  @IsPositive()
  maxPrice?: number;

  /** Filter by movie ID */
  @IsOptional()
  @IsUUID()
  movieId?: string;

  /** Filter by auditorium ID */
  @IsOptional()
  @IsUUID()
  auditoriumId?: string;

  /** Sort by this field */
  @IsOptional()
  @IsIn(['startTime', 'endTime', 'price', 'createdAt', 'updatedAt'])
  sortBy?: 'startTime' | 'endTime' | 'price' | 'createdAt' | 'updatedAt';

  /** Sort order: ascending or descending */
  @IsOptional()
  @IsIn(['asc', 'desc'])
  order?: 'asc' | 'desc';

  /** Results per page */
  @IsOptional()
  @IsPositive()
  limit?: number;

  /** Page number */
  @IsOptional()
  @IsPositive()
  page?: number;
}
