/**
 * SEO Utility Functions
 */

/**
 * Converts a title to a URL-friendly slug
 * "Attack on Titan" -> "attack-on-titan"
 */
export const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim()
    .substring(0, 50); // Limit length
};

/**
 * Creates a SEO-friendly URL path
 * Format: /anime/attack-on-titan-16498
 */
export const createSeoUrl = (type: 'anime' | 'manga', id: number, title: string): string => {
  const slug = generateSlug(title);
  return `/${type}/${slug}-${id}`;
};

/**
 * Extracts the ID from a SEO-friendly URL path
 * "/anime/attack-on-titan-16498" -> 16498
 * Also handles legacy format "/anime/16498" for backwards compatibility
 */
export const extractIdFromSlug = (slugWithId: string): number | null => {
  // Try to extract ID from the end (new format: slug-id)
  const match = slugWithId.match(/-(\d+)$/);
  if (match) {
    return parseInt(match[1], 10);
  }
  
  // Fallback: check if it's just a number (legacy format)
  const numericMatch = slugWithId.match(/^(\d+)$/);
  if (numericMatch) {
    return parseInt(numericMatch[1], 10);
  }
  
  return null;
};

/**
 * Generates JSON-LD structured data for an anime
 */
export const generateAnimeJsonLd = (anime: {
  title: string;
  title_english?: string;
  synopsis?: string;
  images: { webp: { large_image_url: string } };
  score?: number;
  scored_by?: number;
  genres?: { name: string }[];
  episodes?: number;
  status?: string;
  aired?: { from?: string; to?: string };
  studios?: { name: string }[];
  rating?: string;
}) => {
  return {
    "@context": "https://schema.org",
    "@type": "TVSeries",
    "name": anime.title_english || anime.title,
    "alternateName": anime.title,
    "description": anime.synopsis || "",
    "image": anime.images.webp.large_image_url,
    "genre": anime.genres?.map(g => g.name) || [],
    "numberOfEpisodes": anime.episodes || undefined,
    "productionCompany": anime.studios?.map(s => ({
      "@type": "Organization",
      "name": s.name
    })) || [],
    "aggregateRating": anime.score ? {
      "@type": "AggregateRating",
      "ratingValue": anime.score,
      "ratingCount": anime.scored_by || 0,
      "bestRating": 10,
      "worstRating": 1
    } : undefined,
    "datePublished": anime.aired?.from || undefined,
    "contentRating": anime.rating || undefined
  };
};

/**
 * Generates JSON-LD structured data for a manga
 */
export const generateMangaJsonLd = (manga: {
  title: string;
  title_english?: string;
  synopsis?: string;
  images: { webp: { large_image_url: string } };
  score?: number;
  scored_by?: number;
  genres?: { name: string }[];
  chapters?: number;
  volumes?: number;
  status?: string;
  published?: { from?: string; to?: string };
  authors?: { name: string }[];
}) => {
  return {
    "@context": "https://schema.org",
    "@type": "Book",
    "name": manga.title_english || manga.title,
    "alternateName": manga.title,
    "description": manga.synopsis || "",
    "image": manga.images.webp.large_image_url,
    "genre": manga.genres?.map(g => g.name) || [],
    "numberOfPages": manga.chapters || undefined,
    "author": manga.authors?.map(a => ({
      "@type": "Person",
      "name": a.name
    })) || [],
    "aggregateRating": manga.score ? {
      "@type": "AggregateRating",
      "ratingValue": manga.score,
      "ratingCount": manga.scored_by || 0,
      "bestRating": 10,
      "worstRating": 1
    } : undefined,
    "datePublished": manga.published?.from || undefined
  };
};

/**
 * Generates BreadcrumbList JSON-LD for navigation
 */
export const generateBreadcrumbJsonLd = (items: { name: string; url: string }[]) => {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  };
};

/**
 * Generates WebSite JSON-LD for the homepage
 */
export const generateWebsiteJsonLd = (baseUrl: string) => {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "AniFlow",
    "url": baseUrl,
    "description": "Discover your next favorite anime and manga on AniFlow. Browse top charts, seasonal releases, and find your next obsession.",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${baseUrl}/search?q={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  };
};
