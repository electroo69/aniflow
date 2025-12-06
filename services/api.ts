import { ApiResponse, Anime, Manga, Character } from '../types';

const BASE_URL = 'https://api.jikan.moe/v4';

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper to handle rate limiting and fetch errors with retry logic
async function fetchJikan<T>(endpoint: string, params: Record<string, string | number | boolean | undefined> = {}, retries = 3): Promise<T> {
  const url = new URL(`${BASE_URL}${endpoint}`);
  Object.keys(params).forEach(key => {
    if (params[key] !== undefined && params[key] !== '') {
      url.searchParams.append(key, String(params[key]));
    }
  });

  try {
    const response = await fetch(url.toString());

    if (!response.ok) {
      if (response.status === 429 && retries > 0) {
        // Exponential backoff: 1s, 2s, 4s
        const delay = 1000 * (4 - retries);
        await wait(delay);
        return fetchJikan<T>(endpoint, params, retries - 1);
      }
      throw new Error(`API Error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    if (retries > 0) {
       await wait(1000);
       return fetchJikan<T>(endpoint, params, retries - 1);
    }
    throw error;
  }
}

export const jikanApi = {
  getTopAnime: (page = 1) => fetchJikan<ApiResponse<Anime[]>>('/top/anime', { page, filter: 'bypopularity' }),
  getTopManga: (page = 1) => fetchJikan<ApiResponse<Manga[]>>('/top/manga', { page, filter: 'bypopularity' }),
  getTopCharacters: (page = 1) => fetchJikan<ApiResponse<Character[]>>('/top/characters', { page }),

  getSeasonNow: (page = 1) => fetchJikan<ApiResponse<Anime[]>>('/seasons/now', { page }),
  getUpcomingAnime: (page = 1) => fetchJikan<ApiResponse<Anime[]>>('/seasons/upcoming', { page }),
  
  searchAnime: (q: string, page = 1, orderBy?: string, sort?: string) => 
    fetchJikan<ApiResponse<Anime[]>>('/anime', { 
      q, 
      page, 
      sfw: true,
      order_by: orderBy,
      sort: sort 
    }),

  searchManga: (q: string, page = 1, orderBy?: string, sort?: string) => 
    fetchJikan<ApiResponse<Manga[]>>('/manga', { 
      q, 
      page, 
      sfw: true,
      order_by: orderBy,
      sort: sort
    }),

  searchCharacters: (q: string, page = 1, orderBy?: string, sort?: string) => 
    fetchJikan<ApiResponse<Character[]>>('/characters', { 
      q, 
      page,
      order_by: orderBy,
      sort: sort
    }),
  
  getAnimeById: (id: number) => fetchJikan<{ data: Anime }>(`/anime/${id}`),
  getMangaById: (id: number) => fetchJikan<{ data: Manga }>(`/manga/${id}`),
  
  getAnimeCharacters: (id: number) => fetchJikan<{ data: { character: Character, role: string }[] }>(`/anime/${id}/characters`),
  getMangaCharacters: (id: number) => fetchJikan<{ data: { character: Character, role: string }[] }>(`/manga/${id}/characters`),
  
  getAnimeRecommendations: (id: number) => fetchJikan<{ data: { entry: Anime }[] }>(`/anime/${id}/recommendations`),
  getMangaRecommendations: (id: number) => fetchJikan<{ data: { entry: Manga }[] }>(`/manga/${id}/recommendations`),
  
  getRandomAnime: () => fetchJikan<{ data: Anime }>('/random/anime'),
};