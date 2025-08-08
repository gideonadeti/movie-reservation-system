import { IsIn, IsOptional, IsPositive, IsString } from 'class-validator';

import { Trim } from 'src/trim/trim.decorator';

export class FindAllSeatsDto {
  /** Seat's label */
  @IsOptional()
  @IsString()
  @Trim()
  label?: string;

  /** Sort by this field */
  @IsOptional()
  @IsIn(['label', 'createdAt', 'updatedAt'])
  sortBy?: 'label' | 'createdAt' | 'updatedAt';

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
