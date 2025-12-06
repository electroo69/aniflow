import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import { jikanApi } from '../services/api';
import { Anime, Manga, Character } from '../types';
import { Card } from '../components/Card';
import { Loading } from '../components/Loading';
import { Search as SearchIcon, ArrowDownUp } from 'lucide-react';
import { AdBanner } from '../components/AdBanner';
import { SEO } from '../components/SEO';

type SortOption = 'popularity' | 'score' | 'favorites' | 'title';

export const Search = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const query = searchParams.get('q') || '';
  const path = location.pathname;
  
  const [results, setResults] = useState<(Anime | Manga | Character)[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [sortBy, setSortBy] = useState<SortOption>('popularity');
  
  // Intersection Observer for Infinite Scroll
  const observer = useRef<IntersectionObserver | null>(null);
  const lastElementRef = useCallback((node: HTMLDivElement | null) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasNextPage) {
        setPage(prevPage => prevPage + 1);
      }
    });
    
    if (node) observer.current.observe(node);
  }, [loading, hasNextPage]);

  // Determine page configuration based on route
  const getConfig = useCallback(() => {
    const isBrowse = !query;

    if (path.includes('/top')) {
      return { 
        title: 'Top Ranking Anime', 
        fetch: (p: number) => jikanApi.getTopAnime(p)
      };
    }
    if (path.includes('/seasonal')) {
      return { 
        title: 'Seasonal Anime', 
        fetch: (p: number) => jikanApi.getSeasonNow(p)
      };
    }
    if (path.includes('/manga')) {
      return { 
        title: query ? `Manga Results for "${query}"` : 'Popular Manga', 
        fetch: (p: number) => jikanApi.searchManga(query, p, sortBy, 'desc')
      };
    }
    if (path.includes('/characters')) {
      return { 
        title: query ? `Character Results for "${query}"` : 'Top Characters', 
        fetch: (p: number) => query 
            ? jikanApi.searchCharacters(query, p, sortBy, 'desc') 
            : jikanApi.getTopCharacters(p)
      };
    }
    // Default /anime or /search
    return { 
      title: query ? `Results for "${query}"` : 'Explore Anime', 
      fetch: (p: number) => jikanApi.searchAnime(query, p, sortBy, 'desc')
    };
  }, [path, query, sortBy]);

  const config = getConfig();

  // Reset state when query or path changes
  useEffect(() => {
    setResults([]);
    setPage(1);
    setHasNextPage(true);
  }, [query, sortBy, path]);

  useEffect(() => {
    const fetchResults = async () => {
      // Avoid fetching if we already know there are no more pages (except page 1)
      if (!hasNextPage && page > 1) return;
      
      setLoading(true);
      
      try {
        const response = await config.fetch(page);
        
        setResults(prev => {
            // Deduplicate items based on mal_id
            const newItems = response.data || [];
            if (page === 1) return newItems;
            
            const existingIds = new Set(prev.map(item => item.mal_id));
            const uniqueNewItems = newItems.filter(item => !existingIds.has(item.mal_id));
            return [...prev, ...uniqueNewItems];
        });
        
        setHasNextPage(response.pagination?.has_next_page || false);
      } catch (error) {
        console.error("Fetch failed", error);
      } finally {
        setLoading(false);
      }
    };

    // Debounce initial search only if there is a query, otherwise instant load
    const timeout = setTimeout(() => {
        fetchResults();
    }, query ? 500 : 0);

    return () => clearTimeout(timeout);
  }, [page, query, sortBy, path]); 

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value as SortOption);
  };

  const showSort = !path.includes('/top') && !path.includes('/seasonal');

  // Helper to render grid items with injected ads
  const renderGridItems = () => {
    const nodes: React.ReactNode[] = [];
    
    results.forEach((item, index) => {
      const isLast = index === results.length - 1;
      
      // Push the card
      if (isLast) {
         nodes.push(
            <div ref={lastElementRef} key={`${item.mal_id}-${index}`}>
               <Card item={item} />
            </div>
         );
      } else {
         nodes.push(<Card key={`${item.mal_id}-${index}`} item={item} />);
      }

      // Inject Ad after every 5th item
      if ((index + 1) % 5 === 0) {
        nodes.push(
          <div key={`ad-${index}`} className="aspect-[2/3] flex items-center justify-center bg-slate-900 rounded-xl border border-slate-800 overflow-hidden relative">
             <div className="transform scale-[0.55] md:scale-[0.75] origin-center">
                <AdBanner width={300} height={250} dataKey="edcee0617b46e89591f39e8a7b1e13a9" />
             </div>
          </div>
        );
      }
    });
    
    return nodes;
  };

  return (
    <div className="space-y-6">
      <SEO title={config.title} description={`Browse ${config.title} on AniFlow. Find top rated, popular, and trending titles.`} />
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <h1 className="text-3xl font-bold text-white mb-2">
                {config.title}
            </h1>
            <p className="text-slate-400 text-sm">Find your next favorite</p>
        </div>
        
        {showSort && (
            <div className="flex items-center gap-3 bg-slate-800 p-2 rounded-lg border border-slate-700">
                 <ArrowDownUp size={16} className="text-slate-400 ml-2" />
                 <select 
                    value={sortBy}
                    onChange={handleSortChange}
                    className="bg-transparent text-sm font-medium text-white focus:outline-none cursor-pointer pr-4"
                 >
                    <option value="popularity">Popularity</option>
                    <option value="score">Score</option>
                    <option value="favorites">Favorites</option>
                    <option value="title">Title</option>
                 </select>
            </div>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 auto-rows-fr">
          {renderGridItems()}
      </div>

      {loading && (
        <Loading />
      )}

      {!loading && results.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500">
              <SearchIcon size={48} className="mb-4 opacity-50" />
              <p className="text-lg">No results found.</p>
          </div>
      )}
      
      {!loading && !hasNextPage && results.length > 0 && (
          <div className="text-center py-8 text-slate-600 text-sm">
              You've reached the end of the list.
          </div>
      )}
    </div>
  );
};