import { IsIn, IsOptional, IsPositive, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class FindAllMoviesDto {
  /** Movie's title */
  @IsOptional()
  @IsString()
  @Transform(({ value }: { value: string }) => value.trim())
  title?: string;

  /** Movie's description */
  @IsOptional()
  @IsString()
  @Transform(({ value }: { value: string }) => value.trim())
  description?: string;

  /** Movie's genre */
  @IsOptional()
  @IsString()
  @Transform(({ value }: { value: string }) => value.trim())
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
