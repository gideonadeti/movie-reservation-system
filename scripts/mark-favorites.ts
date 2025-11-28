const API_BASE = 'https://api.themoviedb.org/3';

type MovieResult = {
  id: number;
  title: string;
};

type TopRatedResponse = {
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

async function markFavorite(movie: MovieResult): Promise<void> {
  const response = await fetch(`${API_BASE}/account/${accountId}/favorite`, {
    method: 'POST',
    headers: {
      ...defaultHeaders,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      media_type: 'movie',
      media_id: movie.id,
      favorite: true,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `Failed to favorite movie ${movie.id} (${movie.title}): ${response.status} ${response.statusText} -> ${body}`,
    );
  }

  const data = (await response.json()) as { status_code: number };

  console.log(
    `✓ Favorited ${movie.title} (id: ${movie.id}) | status_code: ${data.status_code}`,
  );
}

async function run(): Promise<void> {
  try {
    const TARGET_COUNT = 88;
    const MOVIES_PER_PAGE = 20;
    const pagesNeeded = Math.ceil(TARGET_COUNT / MOVIES_PER_PAGE);

    console.log(
      `Fetching top rated movies (pages 1 - ${pagesNeeded}) to reach ${TARGET_COUNT} titles...`,
    );
    const pages = await Promise.all(
      Array.from({ length: pagesNeeded }, (_, idx) => fetchTopRated(idx + 1)),
    );
    const movies = pages.flat().slice(0, TARGET_COUNT);

    console.log(`Retrieved ${movies.length} movies. Marking as favorites...`);
    for (const movie of movies) {
      await markFavorite(movie);
    }

    console.log(`${movies.length} movies have been marked as favorites.`);
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  }
}

void run();
