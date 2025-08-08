import { IsIn, IsOptional, IsPositive, IsString } from 'class-validator';
import { Trim } from 'src/trim/trim.decorator';

export class FindAllMoviesDto {
  /** Movie's title */
  @IsOptional()
  @IsString()
  @Trim()
  title?: string;

  /** Movie's description */
  @IsOptional()
  @IsString()
  @Trim()
  description?: string;

  /** Movie's genre */
  @IsOptional()
  @IsString()
  @Trim()
  genre?: string;

  /** Sort by this field */
  @IsOptional()
  @IsIn(['title', 'description', 'genre', 'createdAt', 'updatedAt'])
  sortBy?: 'title' | 'description' | 'genre' | 'createdAt' | 'updatedAt';

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
