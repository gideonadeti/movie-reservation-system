export type MovieResult = {
  id: number;
  title: string;
  popularity?: number;
};

export type FavoritesResponse = {
  page: number;
  total_pages: number;
  total_results: number;
  results?: MovieResult[];
};

export const apiBaseUrl = process.env.TMDB_API_BASE_URL;
export const bearerToken = process.env.TMDB_BEARER_TOKEN;
export const accountId = process.env.TMDB_ACCOUNT_ID;

if (!bearerToken || !accountId || !apiBaseUrl) {
  console.error(bearerToken, accountId, apiBaseUrl);

  console.error(
    'Missing TMDB environment variables. Please export them before running this script.',
  );

  process.exitCode = 1;
  process.exit();
}

export const defaultHeaders = {
  accept: 'application/json',
  Authorization: `Bearer ${bearerToken}`,
};

export async function fetchFavorites(page = 1) {
  const response = await fetch(
    `${apiBaseUrl}/account/${accountId}/favorite/movies?page=${page}`,
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

export async function getAllFavorites() {
  const firstPage = await fetchFavorites(1);
  const pages = [firstPage];

  for (let page = 2; page <= firstPage.total_pages; page += 1) {
    pages.push(await fetchFavorites(page));
  }

  return pages.flatMap((page) => page.results ?? []);
}
