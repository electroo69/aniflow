import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Heart } from 'lucide-react';
import { Anime, Manga, Character } from '../types';

interface CardProps {
  item: Anime | Manga | Character;
  onClick?: (item: Anime | Manga | Character) => void;
}

export const Card: React.FC<CardProps> = ({ item, onClick }) => {
  const isCharacter = 'name' in item;
  
  let linkPath = '#';
  let title = '';
  
  // Robust image fallback logic: Large WebP -> Large JPG -> WebP -> JPG
  const images = item.images;
  const imageUrl = 
    images.webp?.large_image_url || 
    images.jpg?.large_image_url || 
    images.webp?.image_url || 
    images.jpg?.image_url;

  let subtitle = '';

  if (isCharacter) {
      const char = item as Character;
      // Link to search for the character specifically or just keep them in the ecosystem
      linkPath = `/search?q=${encodeURIComponent(char.name)}`; 
      title = char.name;
      subtitle = `Favorites: ${char.favorites ? char.favorites.toLocaleString() : 0}`;
  } else {
      const resource = item as Anime | Manga;
      linkPath = `/${resource.type === 'Manga' || resource.type === 'Novel' || resource.type === 'Manhwa' ? 'manga' : 'anime'}/${resource.mal_id}`;
      title = resource.title_english || resource.title;
      subtitle = `${resource.type} • ${resource.year || '?'}`;
  }

  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      e.preventDefault();
      onClick(item);
    }
  };

  return (
    <Link to={linkPath} onClick={handleClick} className="group relative flex flex-col gap-2 w-full">
      <div className="relative aspect-[2/3] overflow-hidden rounded-xl bg-slate-800 shadow-md transition-all duration-300 group-hover:shadow-blue-500/20 group-hover:shadow-2xl">
        <img 
          src={imageUrl} 
          alt={title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
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
        <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
            {subtitle}
        </p>
      </div>
    </Link>
  );
};