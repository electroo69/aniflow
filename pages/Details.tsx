import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { jikanApi } from '../services/api';
import { Anime, Manga, Character } from '../types';
import { Loading } from '../components/Loading';
import { Card } from '../components/Card';
import { Star, Play, Heart, Users, ThumbsUp } from 'lucide-react';
import { AdBanner } from '../components/AdBanner';
import { SEO } from '../components/SEO';

export const Details = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const isManga = location.pathname.includes('/manga');

  const [item, setItem] = useState<Anime | Manga | null>(null);
  const [characters, setCharacters] = useState<{ character: Character, role: string }[]>([]);
  const [recommendations, setRecommendations] = useState<(Anime | Manga)[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const fetchDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        setRecommendations([]);
        
        if (isManga) {
            const [itemRes, charRes, recRes] = await Promise.all([
                jikanApi.getMangaById(Number(id)),
                jikanApi.getMangaCharacters(Number(id)),
                jikanApi.getMangaRecommendations(Number(id))
            ]);
            setItem(itemRes.data);
            setCharacters(charRes.data);
            setRecommendations(recRes.data.map((r: any) => ({ ...r.entry, type: 'Manga' })));
        } else {
            const [itemRes, charRes, recRes] = await Promise.all([
                jikanApi.getAnimeById(Number(id)),
                jikanApi.getAnimeCharacters(Number(id)),
                jikanApi.getAnimeRecommendations(Number(id))
            ]);
            setItem(itemRes.data);
            setCharacters(charRes.data);
            setRecommendations(recRes.data.map((r: any) => ({ ...r.entry, type: 'Anime' })));
        }

      } catch (err) {
        setError("Failed to load details. Likely rate limited or not found.");
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
    return () => { setItem(null); setCharacters([]); setRecommendations([]); }
  }, [id, isManga]);

  if (loading) return <Loading />;
  if (error || !item) return <div className="text-center text-red-400 py-20">{error || "Not found"}</div>;

  const trailerUrl = !isManga && (item as Anime).trailer?.embed_url;
  const displayTitle = item.title_english || item.title;
  const seoDescription = item.synopsis ? `${item.synopsis.substring(0, 160)}...` : `Details and streaming info for ${displayTitle}`;

  return (
    <div className="max-w-7xl mx-auto animate-fadeIn space-y-12">
      <SEO 
        title={displayTitle} 
        description={seoDescription} 
        image={item.images.webp.large_image_url}
        type="article"
      />

      {/* Banner / Header */}
      <div className="relative w-full h-[300px] md:h-[400px] rounded-2xl overflow-hidden shadow-2xl">
        {trailerUrl ? (
           <iframe 
            src={`${trailerUrl}?autoplay=0&mute=1&controls=0&showinfo=0&loop=1`}
            title="Trailer"
            className="w-full h-[150%] -mt-[10%] opacity-40 pointer-events-none scale-110 blur-sm"
           />
        ) : (
            <img 
            src={item.images.webp.large_image_url} 
            alt="Banner" 
            className="w-full h-full object-cover opacity-30 blur-sm"
            />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
        
        <div className="absolute bottom-0 left-0 w-full p-6 md:p-10 flex flex-col md:flex-row gap-8 items-end">
            <img 
              src={item.images.webp.large_image_url} 
              alt={item.title} 
              className="w-40 md:w-52 rounded-xl shadow-2xl border-4 border-slate-800 hidden md:block"
            />
            <div className="flex-1 mb-2">
                <div className="flex flex-wrap gap-2 mb-3">
                    <span className="bg-blue-600 text-white px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider">{item.type}</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider ${
                        (item as Anime).airing || (item as Manga).publishing 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-slate-700 text-slate-300'
                    }`}>
                        {item.status}
                    </span>
                </div>
                <h1 className="text-3xl md:text-5xl font-black text-white mb-2 leading-tight">
                    {item.title_english || item.title}
                </h1>
                <h2 className="text-lg text-slate-400 mb-4 font-medium">{item.title_japanese}</h2>
                
                <div className="flex flex-wrap items-center gap-6 text-sm font-medium text-slate-300">
                    <div className="flex items-center gap-2 text-yellow-400">
                        <Star fill="currentColor" size={20} />
                        <span className="text-xl font-bold">{item.score || "N/A"}</span>
                        <span className="text-slate-500 text-xs">({item.scored_by?.toLocaleString()} users)</span>
                    </div>
                    <div className="flex items-center gap-2">
                         <Heart size={18} className="text-red-400" />
                         <span>Rank #{item.rank}</span>
                    </div>
                    <div className="flex items-center gap-2">
                         <Users size={18} className="text-blue-400" />
                         <span>Popularity #{item.popularity}</span>
                    </div>
                </div>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Info */}
        <div className="space-y-6">
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
                <img 
                src={item.images.webp.large_image_url} 
                alt={item.title} 
                className="w-full rounded-lg mb-6 md:hidden"
                />
                <h3 className="text-lg font-bold text-white mb-4 border-b border-slate-700 pb-2">Information</h3>
                <div className="space-y-3 text-sm text-slate-300">
                    {!isManga && (
                        <>
                        <div className="flex justify-between"><span className="text-slate-500">Episodes</span> <span>{(item as Anime).episodes || "?"}</span></div>
                        <div className="flex justify-between"><span className="text-slate-500">Duration</span> <span>{(item as Anime).duration}</span></div>
                        <div className="flex justify-between"><span className="text-slate-500">Rating</span> <span>{(item as Anime).rating}</span></div>
                        <div className="flex justify-between"><span className="text-slate-500">Aired</span> <span className="text-right">{(item as Anime).aired?.string}</span></div>
                        <div className="flex justify-between"><span className="text-slate-500">Season</span> <span className="capitalize">{(item as Anime).season} {(item as Anime).year}</span></div>
                        <div className="flex justify-between"><span className="text-slate-500">Studio</span> <span>{(item as Anime).studios?.map(s => s.name).join(', ') || '-'}</span></div>
                        </>
                    )}
                    {isManga && (
                         <>
                         <div className="flex justify-between"><span className="text-slate-500">Chapters</span> <span>{(item as Manga).chapters || "?"}</span></div>
                         <div className="flex justify-between"><span className="text-slate-500">Volumes</span> <span>{(item as Manga).volumes || "?"}</span></div>
                         <div className="flex justify-between"><span className="text-slate-500">Published</span> <span className="text-right">{(item as Manga).published?.string}</span></div>
                         <div className="flex justify-between"><span className="text-slate-500">Authors</span> <span>{(item as Manga).authors?.map(a => a.name).join(', ') || '-'}</span></div>
                         </>
                    )}
                </div>
            </div>

            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
                 <h3 className="text-lg font-bold text-white mb-4 border-b border-slate-700 pb-2">Tags</h3>
                 <div className="flex flex-wrap gap-2">
                    {item.genres.map(genre => (
                        <span key={genre.mal_id} className="px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded-full text-xs text-slate-300 transition-colors cursor-default">
                            {genre.name}
                        </span>
                    ))}
                 </div>
            </div>

            {/* Ad: 300x250 Medium Rectangle - Sidebar */}
            <div className="flex justify-center">
                <AdBanner 
                  width={300} 
                  height={250} 
                  dataKey="779520aa602be4ce8eca6a1d6012e88a"
                  className="my-6"
                />
            </div>
        </div>

        {/* Right Column: Content */}
        <div className="lg:col-span-2 space-y-12">
            <div className="space-y-4">
                <h3 className="text-2xl font-bold text-white">Synopsis</h3>
                <p className="text-slate-300 leading-relaxed text-lg font-light">
                    {item.synopsis || "No synopsis available."}
                </p>
                {item.background && (
                    <div className="bg-slate-900/50 p-4 rounded-lg text-sm text-slate-400 italic">
                        {item.background}
                    </div>
                )}
            </div>

            {trailerUrl && (
                <div className="space-y-4">
                    <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Play size={24} className="text-red-500" /> Trailer
                    </h3>
                    <div className="aspect-video rounded-xl overflow-hidden shadow-lg bg-black">
                        <iframe 
                            src={trailerUrl}
                            title="Trailer"
                            className="w-full h-full"
                            allowFullScreen
                        />
                    </div>
                </div>
            )}

            <div className="space-y-4">
                <h3 className="text-2xl font-bold text-white">Characters</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 auto-rows-fr">
                    {characters.slice(0, 12).map((char, index) => (
                        <React.Fragment key={char.character.mal_id + char.role}>
                            <div className="bg-slate-900 rounded-lg overflow-hidden flex flex-col group hover:ring-2 hover:ring-blue-500 transition-all">
                                <div className="aspect-square overflow-hidden">
                                    <img 
                                        src={char.character.images.webp.image_url} 
                                        alt={char.character.name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                </div>
                                <div className="p-3">
                                    <div className="font-bold text-sm text-slate-200 truncate">{char.character.name}</div>
                                    <div className="text-xs text-slate-500">{char.role}</div>
                                </div>
                            </div>
                            {(index + 1) % 5 === 0 && (
                                <div className="aspect-[2/3] flex items-center justify-center bg-slate-900 rounded-lg border border-slate-800 overflow-hidden relative">
                                    <div className="transform scale-[0.55] md:scale-[0.75] origin-center">
                                       <AdBanner width={300} height={250} dataKey="779520aa602be4ce8eca6a1d6012e88a" />
                                    </div>
                                </div>
                            )}
                        </React.Fragment>
                    ))}
                    {characters.length === 0 && <p className="text-slate-500 text-sm">No character information available.</p>}
                </div>
            </div>
            
            {/* Recommendations Section */}
            {recommendations.length > 0 && (
                <div className="space-y-4">
                     <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                        <ThumbsUp size={24} className="text-blue-500" /> Recommendations
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 auto-rows-fr">
                        {recommendations.slice(0, 8).map((rec, index) => (
                            <React.Fragment key={rec.mal_id}>
                                <Card item={rec} />
                                {(index + 1) % 5 === 0 && (
                                    <div className="aspect-[2/3] flex items-center justify-center bg-slate-900 rounded-lg border border-slate-800 overflow-hidden relative">
                                        <div className="transform scale-[0.55] md:scale-[0.75] origin-center">
                                           <AdBanner width={300} height={250} dataKey="779520aa602be4ce8eca6a1d6012e88a" />
                                        </div>
                                    </div>
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};