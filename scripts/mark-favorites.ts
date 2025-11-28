const API_BASE = 'https://api.themoviedb.org/3';

type MovieResult = {
  id: number;
  title: string;
  popularity?: number;
};

type TopRatedResponse = {
  results?: MovieResult[];
};

type FavoritesResponse = {
  page: number;
  total_pages: number;
  total_results: number;
  results?: MovieResult[];
};

const bearerToken = process.env.TMDB_BEARER_TOKEN;
const accountId = process.env.TMDB_ACCOUNT_ID ?? '22508994';

if (!bearerToken) {
  console.error(
    'Missing TMDB_BEARER_TOKEN. Please export it before running this script.',
  );

  process.exitCode = 1;
  process.exit();
}

const defaultHeaders = {
  accept: 'application/json',
  Authorization: `Bearer ${bearerToken}`,
};

async function fetchTopRated(page: number): Promise<MovieResult[]> {
  const response = await fetch(
    `${API_BASE}/movie/top_rated?language=en-US&page=${page}`,
    {
      method: 'GET',
      headers: defaultHeaders,
    },
  );

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `Failed to fetch page ${page}: ${response.status} ${response.statusText} -> ${body}`,
    );
  }

  const payload = (await response.json()) as TopRatedResponse;
  return payload.results ?? [];
}

async function fetchFavorites(page = 1): Promise<FavoritesResponse> {
  const response = await fetch(
    `${API_BASE}/account/${accountId}/favorite/movies?language=en-US&page=${page}&sort_by=created_at.asc`,
    {
      method: 'GET',
      headers: defaultHeaders,
    },
  );

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `Failed to fetch favorites page ${page}: ${response.status} ${response.statusText} -> ${body}`,
    );
  }

  return (await response.json()) as FavoritesResponse;
}

async function toggleFavorite(
  movie: MovieResult,
  favorite: boolean,
): Promise<void> {
  const response = await fetch(`${API_BASE}/account/${accountId}/favorite`, {
    method: 'POST',
    headers: {
      ...defaultHeaders,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      media_type: 'movie',
      media_id: movie.id,
      favorite,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `Failed to ${favorite ? 'favorite' : 'unfavorite'} movie ${movie.id} (${movie.title}): ${response.status} ${response.statusText} -> ${body}`,
    );
  }

  const data = (await response.json()) as { status_code: number };
  const symbol = favorite ? '✓ Added favorite' : '✗ Removed favorite';
  console.log(
    `${symbol} ${movie.title} (id: ${movie.id}) | status_code: ${data.status_code}`,
  );
}

async function getAllFavorites(): Promise<MovieResult[]> {
  const firstPage = await fetchFavorites(1);
  const pages = [firstPage];

  for (let page = 2; page <= firstPage.total_pages; page += 1) {
    pages.push(await fetchFavorites(page));
  }

  return pages.flatMap((page) => page.results ?? []);
}

async function collectTopRatedMovies(
  requiredCount: number,
  excludeIds: Set<number>,
): Promise<MovieResult[]> {
  const collected: MovieResult[] = [];
  let page = 1;

  while (collected.length < requiredCount) {
    const pageResults = await fetchTopRated(page);
    if (pageResults.length === 0) {
      break;
    }

    const newMovies = pageResults.filter((movie) => !excludeIds.has(movie.id));
    collected.push(...newMovies);
    page += 1;
  }

  return collected.slice(0, requiredCount);
}

async function run(): Promise<void> {
  try {
    const TARGET_COUNT = 88;
    const MOVIES_PER_PAGE = 20;
    console.log('Fetching current favorites list...');
    const favorites = await getAllFavorites();
    console.log(`Currently have ${favorites.length} favorite movies.`);

    if (favorites.length > TARGET_COUNT) {
      const toRemoveCount = favorites.length - TARGET_COUNT;
      console.log(
        `Trimming ${toRemoveCount} lowest-popularity favorites to reach ${TARGET_COUNT}.`,
      );

      const sortedByPopularity = [...favorites].sort((a, b) => {
        const popA = a.popularity ?? 0;
        const popB = b.popularity ?? 0;
        return popA - popB;
      });

      for (const movie of sortedByPopularity.slice(0, toRemoveCount)) {
        await toggleFavorite(movie, false);
      }
    }

    const updatedFavorites = await getAllFavorites();
    if (updatedFavorites.length === TARGET_COUNT) {
      console.log('Favorites already at desired count. Nothing to add.');
      return;
    }

    const remaining = TARGET_COUNT - updatedFavorites.length;
    const pagesNeeded = Math.ceil(remaining / MOVIES_PER_PAGE);
    console.log(
      `Need ${remaining} more favorites. Fetching top rated pages 1-${pagesNeeded} (skipping already-favorited movies)...`,
    );

    const existingIds = new Set(updatedFavorites.map((movie) => movie.id));
    const candidates = await collectTopRatedMovies(remaining, existingIds);

    for (const movie of candidates) {
      await toggleFavorite(movie, true);
    }

    console.log('Favorites list trimmed and refilled to the target count.');
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  }
}

void run();
