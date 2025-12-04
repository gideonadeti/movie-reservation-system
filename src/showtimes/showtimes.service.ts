import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { CreateShowtimeDto } from './dto/create-showtime.dto';
import { UpdateShowtimeDto } from './dto/update-showtime.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { FindAllShowtimesDto } from './dto/find-all-showtimes.dto';
import { Prisma, ReservationStatus } from '@prisma/client';

type MovieResult = {
  id: number;
  title: string;
};

type FavoritesResponse = {
  page: number;
  total_pages: number;
  total_results: number;
  results?: MovieResult[];
};

@Injectable()
export class ShowtimesService {
  constructor(
    private prismaService: PrismaService,
    private configService: ConfigService,
  ) {}

  private logger = new Logger(ShowtimesService.name);

  private handleError(error: any, action: string) {
    this.logger.error(`Failed to ${action}`, (error as Error).stack);

    if (error instanceof BadRequestException) {
      throw error;
    }

    throw new InternalServerErrorException(`Failed to ${action}`);
  }

  private getWhereConditions(query: FindAllShowtimesDto) {
    const {
      auditoriumId,
      endTimeFrom,
      endTimeTo,
      maxPrice,
      minPrice,
      tmdbMovieId,
      startTimeFrom,
      startTimeTo,
    } = query;
    const whereConditions: Prisma.ShowtimeWhereInput = {};

    if (auditoriumId) {
      whereConditions.auditoriumId = auditoriumId;
    }

    if (tmdbMovieId) {
      whereConditions.tmdbMovieId = tmdbMovieId;
    }

    if (startTimeFrom || startTimeTo) {
      whereConditions.startTime = {};

      if (startTimeFrom) whereConditions.startTime.gte = startTimeFrom;
      if (startTimeTo) whereConditions.startTime.lte = startTimeTo;
    }

    if (endTimeFrom || endTimeTo) {
      whereConditions.endTime = {};

      if (endTimeFrom) whereConditions.endTime.gte = endTimeFrom;
      if (endTimeTo) whereConditions.endTime.lte = endTimeTo;
    } else {
      // By default, exclude past showtimes (showtimes that have already ended)
      // Only apply this if endTimeTo is not explicitly provided
      whereConditions.endTime = {
        gte: new Date(),
      };
    }

    if (minPrice || maxPrice) {
      whereConditions.price = {};

      if (minPrice) whereConditions.price.gte = minPrice;
      if (maxPrice) whereConditions.price.lte = maxPrice;
    }

    return whereConditions;
  }

  private getRandomDateWithinNextTwoMonths(): Date {
    const now = new Date();
    const twoMonthsLater = new Date(now);
    twoMonthsLater.setMonth(twoMonthsLater.getMonth() + 2);

    const startMs = now.getTime();
    const endMs = twoMonthsLater.getTime();
    const randomMs = startMs + Math.random() * (endMs - startMs);

    return new Date(randomMs);
  }

  private getRandomDurationMinutes(): number {
    const min = 90;
    const max = 180;

    return Math.floor(min + Math.random() * (max - min + 1));
  }

  private getRandomPrice(): number {
    const min = 8;
    const max = 20;
    const raw = min + Math.random() * (max - min);

    return Math.round(raw * 2) / 2; // nearest 0.5
  }

  private async fetchTmdbFavorites(): Promise<number[]> {
    const apiBaseUrl = this.configService.get<string>('TMDB_API_BASE_URL');
    const bearerToken = this.configService.get<string>('TMDB_BEARER_TOKEN');
    const accountId = this.configService.get<string>('TMDB_ACCOUNT_ID');

    if (!apiBaseUrl || !bearerToken || !accountId) {
      throw new BadRequestException(
        'TMDB environment variables are not configured. Please set TMDB_API_BASE_URL, TMDB_BEARER_TOKEN, and TMDB_ACCOUNT_ID.',
      );
    }

    const headers = {
      accept: 'application/json',
      Authorization: `Bearer ${bearerToken}`,
    };

    const firstPageResponse = await fetch(
      `${apiBaseUrl}/account/${accountId}/favorite/movies?page=1`,
      {
        method: 'GET',
        headers,
      },
    );

    if (!firstPageResponse.ok) {
      const body = await firstPageResponse.text();
      throw new InternalServerErrorException(
        `Failed to fetch TMDB favorites: ${firstPageResponse.status} ${firstPageResponse.statusText} -> ${body}`,
      );
    }

    const firstPage = (await firstPageResponse.json()) as FavoritesResponse;
    const allMovies: MovieResult[] = [...(firstPage.results ?? [])];

    // Fetch remaining pages if any
    for (let page = 2; page <= firstPage.total_pages; page += 1) {
      const pageResponse = await fetch(
        `${apiBaseUrl}/account/${accountId}/favorite/movies?page=${page}`,
        {
          method: 'GET',
          headers,
        },
      );

      if (!pageResponse.ok) {
        const body = await pageResponse.text();
        throw new InternalServerErrorException(
          `Failed to fetch TMDB favorites page ${page}: ${pageResponse.status} ${pageResponse.statusText} -> ${body}`,
        );
      }

      const pageData = (await pageResponse.json()) as FavoritesResponse;
      allMovies.push(...(pageData.results ?? []));
    }

    return allMovies.map((movie) => movie.id);
  }

  private sampleUniqueIds(ids: number[], count: number): number[] {
    const unique = Array.from(new Set(ids));
    const n = Math.min(count, unique.length);
    const selected: number[] = [];

    while (selected.length < n) {
      const randomIndex = Math.floor(Math.random() * unique.length);
      const candidate = unique[randomIndex];
      if (!selected.includes(candidate)) {
        selected.push(candidate);
      }
    }

    return selected;
  }

  async create(createShowtimeDto: CreateShowtimeDto) {
    const { startTime, endTime, auditoriumId } = createShowtimeDto;

    if (startTime > endTime) {
      throw new BadRequestException('Start time must be before end time');
    }

    if (startTime < new Date()) {
      throw new BadRequestException('Start time must be in the future');
    }

    try {
      const overlap = await this.prismaService.showtime.findFirst({
        where: {
          auditoriumId: auditoriumId,
          startTime: {
            lt: endTime,
          },
          endTime: {
            gt: startTime,
          },
        },
      });

      if (overlap) {
        throw new BadRequestException(
          'The auditorium is unavailable during this period',
        );
      }

      return await this.prismaService.showtime.create({
        data: { ...createShowtimeDto },
      });
    } catch (error) {
      this.handleError(error, 'create showtime');
    }
  }

  async seed(count = 8) {
    try {
      this.logger.log('Fetching favorite movies from TMDB...');
      const allFavoriteIds = await this.fetchTmdbFavorites();

      if (allFavoriteIds.length === 0) {
        throw new BadRequestException(
          'No favorite movies found on TMDB account. Please add favorites to your TMDB account.',
        );
      }

      const movieIdsToUse = this.sampleUniqueIds(allFavoriteIds, count);

      this.logger.log(
        `Selected ${movieIdsToUse.length} random favorite movie IDs from TMDB`,
      );

      const auditoriums = await this.prismaService.auditorium.findMany();

      if (!auditoriums.length) {
        throw new BadRequestException(
          'Cannot seed showtimes because no auditoriums exist',
        );
      }

      const createdShowtimes: NonNullable<
        Awaited<ReturnType<ShowtimesService['create']>>
      >[] = [];

      for (const tmdbMovieId of movieIdsToUse) {
        const startTime = this.getRandomDateWithinNextTwoMonths();
        const durationMinutes = this.getRandomDurationMinutes();
        const endTime = new Date(
          startTime.getTime() + durationMinutes * 60 * 1000,
        );

        const price = this.getRandomPrice();
        const randomAuditorium =
          auditoriums[Math.floor(Math.random() * auditoriums.length)];

        const showtime = (await this.create({
          startTime,
          endTime,
          price,
          tmdbMovieId,
          auditoriumId: randomAuditorium.id,
        }))!;

        createdShowtimes.push(showtime);
      }

      return {
        showtimes: createdShowtimes,
      };
    } catch (error) {
      this.handleError(error, 'seed showtimes');
    }
  }

  async findAll(query: FindAllShowtimesDto) {
    const { sortBy, order, limit, page } = query;
    const whereConditions = this.getWhereConditions(query);

    try {
      if (!page && !limit) {
        return await this.prismaService.showtime.findMany({
          where: whereConditions,
          orderBy: { [sortBy || 'startTime']: order || 'asc' },
          include: {
            auditorium: {
              include: {
                seats: true,
              },
            },
            reservations: {
              where: { status: ReservationStatus.CONFIRMED },
              select: {
                id: true,
                showtimeId: true,
                userId: true,
                reservedSeats: {
                  select: {
                    id: true,
                    seatId: true,
                  },
                },
              },
            },
          },
        });
      }

      const numberPage = page || 1;
      const numberLimit = limit || 10;
      const total = await this.prismaService.showtime.count({
        where: whereConditions,
      });
      const lastPage = Math.ceil(total / numberLimit);
      const showtimes = await this.prismaService.showtime.findMany({
        where: whereConditions,
        orderBy: { [sortBy || 'startTime']: order || 'asc' },
        skip: (numberPage - 1) * numberLimit,
        take: numberLimit,
        include: {
          auditorium: {
            include: {
              seats: true,
            },
          },
          reservations: {
            where: { status: ReservationStatus.CONFIRMED },
            select: {
              id: true,
              showtimeId: true,
              userId: true,
              reservedSeats: {
                select: {
                  id: true,
                  seatId: true,
                },
              },
            },
          },
        },
      });

      return {
        showtimes,
        metadata: {
          total,
          lastPage,
          page: numberPage,
          limit: numberLimit,
          hasNextPage: numberPage < lastPage,
          hasPreviousPage: numberPage > 1,
        },
      };
    } catch (error) {
      this.handleError(error, 'fetch all showtimes');
    }
  }

  async findOne(id: string) {
    try {
      const showtime = await this.prismaService.showtime.findUnique({
        where: { id },
        include: {
          auditorium: true,
        },
      });

      if (!showtime) {
        throw new BadRequestException(`Showtime with id ${id} not found`);
      }

      return showtime;
    } catch (error) {
      this.handleError(error, `fetch showtime with id ${id}`);
    }
  }

  async findReports(id: string) {
    try {
      const showtime = await this.prismaService.showtime.findUnique({
        where: { id },
        include: {
          auditorium: true,
          reservations: {
            where: {
              status: ReservationStatus.CONFIRMED,
            },
          },
        },
      });

      if (!showtime) {
        throw new BadRequestException(
          `Failed to fetch reports for showtime with ID ${id}`,
        );
      }

      const numberOfReservations = showtime.reservations.length;
      const totalRevenue = showtime.reservations.reduce(
        (sum, reservation) => sum + reservation.amountCharged,
        0,
      );

      return {
        auditoriumName: showtime.auditorium.name,
        startTime: showtime.startTime,
        endTime: showtime.endTime,
        price: showtime.price.toFixed(2),
        numberOfReservations,
        totalRevenue: totalRevenue.toFixed(2),
      };
    } catch (error) {
      this.handleError(error, `fetch reports for showtime with id ${id}`);
    }
  }

  async update(id: string, updateShowtimeDto: UpdateShowtimeDto) {
    const { startTime, endTime, auditoriumId } = updateShowtimeDto;

    if (startTime && endTime && startTime > endTime) {
      throw new BadRequestException('Start time must be before end time');
    }

    if (startTime && startTime < new Date()) {
      throw new BadRequestException('Start time must be in the future');
    }

    try {
      if (startTime && endTime && auditoriumId) {
        const overlap = await this.prismaService.showtime.findFirst({
          where: {
            auditoriumId: auditoriumId,
            startTime: {
              lt: endTime,
            },
            endTime: {
              gt: startTime,
            },
            NOT: { id },
          },
        });

        if (overlap) {
          throw new BadRequestException(
            'The auditorium is unavailable during this period',
          );
        }
      }

      return await this.prismaService.showtime.update({
        where: {
          id,
        },
        data: updateShowtimeDto,
        include: {
          auditorium: true,
        },
      });
    } catch (error) {
      this.handleError(error, `update showtime with id ${id}`);
    }
  }

  async remove(id: string) {
    try {
      return await this.prismaService.showtime.delete({
        where: {
          id,
        },
      });
    } catch (error) {
      this.handleError(error, `delete showtime with id ${id}`);
    }
  }
}
