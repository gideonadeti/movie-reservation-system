import { IsString, IsNotEmpty } from 'class-validator';

export class CreateMovieDto {
  /**
   * Movie's title
   * @example Inception
   */
  @IsString()
  @IsNotEmpty()
  title: string;

  /**
   * Movie's description
   * @example "A skilled thief is given a chance at redemption if he can successfully perform inception."
   */
  @IsString()
  @IsNotEmpty()
  description: string;

  /**
   * Movie's poster image url
   * @example "https://example.com/inception.jpg"
   */
  @IsString()
  @IsNotEmpty()
  imageUrl: string;

  /**
   * Movie's genre
   * @example "Sci-Fi"
   */
  @IsString()
  @IsNotEmpty()
  genre: string;
}
