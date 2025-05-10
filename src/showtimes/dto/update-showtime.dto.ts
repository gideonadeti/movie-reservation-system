import { PartialType } from '@nestjs/swagger';
import { CreateShowtimeDto } from './create-showtime.dto';

export class UpdateShowtimeDto extends PartialType(CreateShowtimeDto) {}
