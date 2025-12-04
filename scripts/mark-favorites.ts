import {
  apiBaseUrl,
  MovieResult,
  defaultHeaders,
  getAllFavorites,
  accountId,
} from './tmdb-common';

type TopRatedResponse = {
  results?: MovieResult[];
};

async function fetchTopRated(page: number) {
  const response = await fetch(`${apiBaseUrl}/movie/top_rated?page=${page}`, {
    method: 'GET',
    headers: defaultHeaders,
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `Failed to fetch page ${page}: ${response.status} ${response.statusText} -> ${body}`,
    );
  }

  const payload = (await response.json()) as TopRatedResponse;
  return payload.results ?? [];
}

async function toggleFavorite(movie: MovieResult, favorite: boolean) {
  const response = await fetch(`${apiBaseUrl}/account/${accountId}/favorite`, {
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

async function collectTopRatedMovies(
  requiredCount: number,
  excludeIds: Set<number>,
) {
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

async function run() {
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
