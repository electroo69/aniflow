export interface JikanImage {
  jpg: {
    image_url: string;
    small_image_url: string;
    large_image_url: string;
  };
  webp: {
    image_url: string;
    small_image_url: string;
    large_image_url: string;
  };
}

export interface JikanResource {
  mal_id: number;
  url: string;
  images: JikanImage;
  title: string;
  title_english?: string;
  title_japanese?: string;
  type: string;
  score: number;
  scored_by: number;
  rank: number;
  popularity: number;
  members: number;
  favorites: number;
  synopsis: string;
  background?: string;
  season?: string;
  year?: number;
  genres: { mal_id: number; type: string; name: string; url: string }[];
  explicit_genres: { mal_id: number; type: string; name: string; url: string }[];
  themes: { mal_id: number; type: string; name: string; url: string }[];
  demographics: { mal_id: number; type: string; name: string; url: string }[];
}

export interface Anime extends JikanResource {
  episodes: number;
  status: string;
  airing: boolean;
  aired: {
    from: string;
    to: string;
    string: string;
  };
  duration: string;
  rating: string;
  studios: { mal_id: number; type: string; name: string; url: string }[];
  trailer: {
    youtube_id: string;
    url: string;
    embed_url: string;
  };
}

export interface Manga extends JikanResource {
  chapters: number;
  volumes: number;
  status: string;
  publishing: boolean;
  published: {
    from: string;
    to: string;
    string: string;
  };
  authors: { mal_id: number; type: string; name: string; url: string }[];
}

export interface Character {
  mal_id: number;
  url: string;
  images: JikanImage;
  name: string;
  name_kanji: string;
  nicknames: string[];
  favorites: number;
  about: string;
}

export interface Pagination {
  last_visible_page: number;
  has_next_page: boolean;
  current_page: number;
  items: {
    count: number;
    total: number;
    per_page: number;
  };
}

export interface ApiResponse<T> {
  data: T;
  pagination?: Pagination;
}
