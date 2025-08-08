import { IsIn, IsInt, IsOptional, IsPositive, IsString } from 'class-validator';

import { Trim } from 'src/trim/trim.decorator';

export class FindAllAuditoriumsDto {
  /** Auditorium's name */
  @IsOptional()
  @IsString()
  @Trim()
  name?: string;

  /** Minimum capacity filter */
  @IsOptional()
  @IsInt()
  @IsPositive()
  minCapacity?: number;

  /** Maximum capacity filter */
  @IsOptional()
  @IsInt()
  @IsPositive()
  maxCapacity?: number;

  /** Sort by this field */
  @IsOptional()
  @IsIn(['name', 'capacity', 'createdAt', 'updatedAt'])
  sortBy?: 'name' | 'capacity' | 'createdAt' | 'updatedAt';

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
