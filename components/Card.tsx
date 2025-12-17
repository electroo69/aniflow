import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Star, Heart } from 'lucide-react';
import { Anime, Manga, Character } from '../types';
import { createSeoUrl } from '../utils/seo';

interface CardProps {
  item: Anime | Manga | Character;
  onClick?: (item: Anime | Manga | Character) => void;
  /** Set to true for above-the-fold images to disable lazy loading and prioritize fetching */
  priority?: boolean;
}

export const Card: React.FC<CardProps> = ({ item, onClick, priority = false }) => {
  const isCharacter = 'name' in item;
  const [isHighResLoaded, setIsHighResLoaded] = useState(false);
  const highResRef = useRef<HTMLImageElement>(null);

  let linkPath = '#';
  let title = '';

  // Progressive image loading: Start with small, upgrade to large
  const images = item.images;

  // Small image for fast initial load (~225x350px, ~20-30KB)
  const smallImageUrl =
    images.webp?.image_url ||
    images.jpg?.image_url;

  // Large image for high quality after initial load (~400x600px, ~50-60KB)
  const largeImageUrl =
    images.webp?.large_image_url ||
    images.jpg?.large_image_url ||
    smallImageUrl; // Fallback to small if no large available

  // Use small image initially, upgrade to large after small is visible
  const [currentSrc, setCurrentSrc] = useState(smallImageUrl);

  let subtitle = '';

  if (isCharacter) {
    const char = item as Character;
    linkPath = `/search?q=${encodeURIComponent(char.name)}`;
    title = char.name;
    subtitle = `Favorites: ${char.favorites ? char.favorites.toLocaleString() : 0}`;
  } else {
    const resource = item as Anime | Manga;
    const isMangaType = resource.type === 'Manga' || resource.type === 'Novel' || resource.type === 'Manhwa';
    const resourceTitle = resource.title_english || resource.title;
    linkPath = createSeoUrl(isMangaType ? 'manga' : 'anime', resource.mal_id, resourceTitle);
    title = resourceTitle;
    subtitle = `${resource.type} • ${resource.year || '?'}`;
  }

  // Progressive loading: After small image loads, start loading high-res in background
  useEffect(() => {
    if (smallImageUrl && largeImageUrl && smallImageUrl !== largeImageUrl) {
      const img = new Image();
      img.src = largeImageUrl;
      img.onload = () => {
        setCurrentSrc(largeImageUrl);
        setIsHighResLoaded(true);
      };
    }
  }, [smallImageUrl, largeImageUrl]);

  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      e.preventDefault();
      onClick(item);
    }
  };

  return (
    <Link to={linkPath} onClick={handleClick} className="group relative flex flex-col gap-2 w-full">
      <div className="relative aspect-[2/3] overflow-hidden rounded-xl bg-slate-800 shadow-md transition-all duration-300 group-hover:shadow-blue-500/20 group-hover:shadow-2xl">
        {/* Main image - starts with small, upgrades to large */}
        <img
          src={currentSrc}
          alt={title}
          className={`h-full w-full object-cover transition-all duration-500 group-hover:scale-110 ${isHighResLoaded ? 'opacity-100' : 'opacity-100'
            }`}
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "auto"}
          decoding={priority ? "sync" : "async"}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

        <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-2 group-hover:translate-y-0 transition-transform">
          {!isCharacter && (item as Anime).score && (
            <div className="flex items-center gap-1 text-yellow-400 text-xs font-bold mb-1">
              <Star size={12} fill="currentColor" />
              <span>{(item as Anime).score}</span>
            </div>
          )}

          {isCharacter && (
            <div className="flex items-center gap-1 text-red-400 text-xs font-bold mb-1">
              <Heart size={12} fill="currentColor" />
              <span>{(item as Character).favorites ? (item as Character).favorites.toLocaleString() : 0}</span>
            </div>
          )}

          {!isCharacter && (item as Anime).genres && (
            <div className="flex flex-wrap gap-1 mb-1">
              {(item as Anime).genres.slice(0, 2).map(g => (
                <span key={g.mal_id} className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-200 border border-blue-500/30 backdrop-blur-sm">
                  {g.name}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Rank Badge */}
        {!isCharacter && (item as Anime).rank && (item as Anime).rank <= 10 && (
          <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-yellow-500 text-black font-bold text-xs flex items-center justify-center shadow-lg">
            #{(item as Anime).rank}
          </div>
        )}
      </div>

      <div>
        <h3 className="font-semibold text-sm md:text-base leading-tight group-hover:text-blue-400 transition-colors line-clamp-2" title={title}>
          {title}
        </h3>
        <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
          {subtitle}
        </p>
      </div>
    </Link>
  );
};