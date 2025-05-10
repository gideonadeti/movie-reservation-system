import { IsIn, IsOptional, IsPositive, IsString } from 'class-validator';

export class FindAllMoviesDto {
  /**
   * Movie's title
   * @example Incept
   */
  @IsOptional()
  @IsString()
  title?: string;

  /**
   * Movie's description
   * @example "A skilled thief"
   */
  @IsOptional()
  @IsString()
  description?: string;

  /**
   * Movie's genre
   * @example sci
   */
  @IsOptional()
  @IsString()
  genre?: string;

  /** Sort by this field */
  @IsOptional()
  @IsIn(['title', 'description', 'genre', 'createdAt', 'updatedAt'])
  sortBy?: 'title' | 'description' | 'genre' | 'createdAt' | 'updatedAt' =
    'createdAt';

  /** Sort order: ascending or descending */
  @IsOptional()
  @IsIn(['asc', 'desc'])
  order?: 'asc' | 'desc' = 'desc';

  /** Results per page */
  @IsPositive()
  limit?: number = 10;

  /** Page number */
  @IsPositive()
  page?: number = 1;
}
