import React, { useState, useEffect } from 'react';
import { jikanApi } from '../services/api';
import { Anime, Manga } from '../types';
import { Card } from '../components/Card';
import { Loading } from '../components/Loading';
import { Search, ThumbsUp, ArrowLeft } from 'lucide-react';
import { AdBanner } from '../components/AdBanner';
import { SEO } from '../components/SEO';

export const Recommendations = () => {
    const [activeTab, setActiveTab] = useState<'anime' | 'manga'>('anime');
    
    // Step 1: Search Query for Source
    const [query, setQuery] = useState('');
    const [sourceResults, setSourceResults] = useState<(Anime | Manga)[]>([]);
    const [isSearchingSource, setIsSearchingSource] = useState(false);

    // Step 2: Selected Item & Recs
    const [selectedItem, setSelectedItem] = useState<Anime | Manga | null>(null);
    const [recommendations, setRecommendations] = useState<(Anime | Manga)[]>([]);
    const [isLoadingRecs, setIsLoadingRecs] = useState(false);

    // Debounced search for the source items
    useEffect(() => {
        const timeoutId = setTimeout(async () => {
            if (!query.trim()) {
                setSourceResults([]);
                return;
            }
            setIsSearchingSource(true);
            try {
                const res = activeTab === 'anime' 
                    ? await jikanApi.searchAnime(query, 1)
                    : await jikanApi.searchManga(query, 1);
                setSourceResults(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setIsSearchingSource(false);
            }
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [query, activeTab]);

    const handleSelectSource = async (item: Anime | Manga) => {
        setSelectedItem(item);
        setIsLoadingRecs(true);
        // Clear previous search to focus on recs
        setSourceResults([]);
        
        try {
            const res = activeTab === 'manga'
                ? await jikanApi.getMangaRecommendations(item.mal_id)
                : await jikanApi.getAnimeRecommendations(item.mal_id);
            
            // Map the simple recommendation entry to a format Card can handle
            const recs = res.data.map((r: any) => ({
                ...r.entry,
                type: activeTab === 'manga' ? 'Manga' : 'Anime', 
                score: null, 
                year: null 
            }));
            
            setRecommendations(recs);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoadingRecs(false);
        }
    };

    const handleBack = () => {
        setSelectedItem(null);
        setRecommendations([]);
        if (query) {
             setIsSearchingSource(true);
             const fetchAgain = async () => {
                 const res = activeTab === 'anime' 
                     ? await jikanApi.searchAnime(query, 1)
                     : await jikanApi.searchManga(query, 1);
                 setSourceResults(res.data);
                 setIsSearchingSource(false);
             }
             fetchAgain();
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 min-h-[60vh]">
             <SEO 
                title="Anime & Manga Recommendations" 
                description="Find new anime and manga based on titles you already love. Use our smart recommendation engine to discover your next favorite series." 
             />
             
             {!selectedItem ? (
                 /* STEP 1: SEARCH SOURCE */
                 <div className="space-y-8 animate-fadeIn">
                     <div className="text-center space-y-4 pt-8">
                        <h1 className="text-4xl font-black text-white flex items-center justify-center gap-3">
                            <ThumbsUp className="text-blue-500" size={36} />
                            <span>Recommendation Engine</span>
                        </h1>
                        <p className="text-slate-400 max-w-xl mx-auto">
                            Search for an anime or manga you love, and we'll show you what to watch next.
                        </p>
                     </div>

                     <div className="max-w-2xl mx-auto">
                        <div className="flex justify-center gap-4 mb-6">
                            <button 
                                onClick={() => { setActiveTab('anime'); setQuery(''); setSourceResults([]); }}
                                className={`px-6 py-2 rounded-full font-medium transition-all ${activeTab === 'anime' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                            >
                                Anime
                            </button>
                            <button 
                                onClick={() => { setActiveTab('manga'); setQuery(''); setSourceResults([]); }}
                                className={`px-6 py-2 rounded-full font-medium transition-all ${activeTab === 'manga' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                            >
                                Manga
                            </button>
                        </div>

                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                            <input 
                                type="text"
                                placeholder={`Search for ${activeTab}...`}
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                autoFocus
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl py-4 pl-12 pr-4 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xl placeholder:text-slate-600"
                            />
                        </div>
                     </div>

                     {/* Source Results Grid */}
                     <div className="space-y-4">
                        {isSearchingSource && <Loading />}
                        
                        {!isSearchingSource && sourceResults.length > 0 && (
                            <>
                                <h3 className="text-xl font-bold text-slate-300">Select a Title:</h3>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 auto-rows-fr">
                                    {sourceResults.map((item, index) => (
                                        <React.Fragment key={item.mal_id}>
                                            <div className="cursor-pointer ring-offset-4 ring-offset-slate-950 hover:ring-2 ring-blue-500 rounded-xl transition-all">
                                                <Card item={item} onClick={handleSelectSource} />
                                            </div>
                                            {(index + 1) % 5 === 0 && (
                                                <div className="aspect-[2/3] flex items-center justify-center bg-slate-900 rounded-xl border border-slate-800 overflow-hidden relative">
                                                    <div className="transform scale-[0.55] md:scale-[0.75] origin-center">
                                                       <AdBanner width={300} height={250} dataKey="edcee0617b46e89591f39e8a7b1e13a9" />
                                                    </div>
                                                </div>
                                            )}
                                        </React.Fragment>
                                    ))}
                                </div>
                            </>
                        )}
                        
                        {!isSearchingSource && query && sourceResults.length === 0 && (
                            <div className="text-center py-10 text-slate-500">
                                No results found for "{query}"
                            </div>
                        )}
                     </div>
                 </div>
             ) : (
                 /* STEP 2: VIEW RECOMMENDATIONS */
                 <div className="space-y-8 animate-fadeIn">
                     <button 
                        onClick={handleBack}
                        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
                     >
                         <ArrowLeft size={20} /> Back to Search
                     </button>

                     <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row gap-8 items-center md:items-start shadow-2xl">
                        <img 
                            src={selectedItem.images.webp.large_image_url} 
                            alt={selectedItem.title} 
                            className="w-32 md:w-48 rounded-lg shadow-lg"
                        />
                        <div className="text-center md:text-left space-y-2 flex-1">
                            <h2 className="text-3xl font-black text-white">Because you liked...</h2>
                            <h3 className="text-2xl text-blue-400 font-bold">{selectedItem.title}</h3>
                            <p className="text-slate-400 max-w-2xl">{selectedItem.synopsis?.slice(0, 150)}...</p>
                        </div>
                     </div>

                     {isLoadingRecs ? (
                         <Loading />
                     ) : (
                         <div className="space-y-6">
                            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                <ThumbsUp size={24} className="text-blue-500" /> Top Recommendations
                            </h2>
                            
                            {recommendations.length > 0 ? (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 auto-rows-fr">
                                    {recommendations.map((item, index) => (
                                        <React.Fragment key={item.mal_id}>
                                            <Card item={item} />
                                            {(index + 1) % 5 === 0 && (
                                                <div className="aspect-[2/3] flex items-center justify-center bg-slate-900 rounded-xl border border-slate-800 overflow-hidden relative">
                                                    <div className="transform scale-[0.55] md:scale-[0.75] origin-center">
                                                       <AdBanner width={300} height={250} dataKey="edcee0617b46e89591f39e8a7b1e13a9" />
                                                    </div>
                                                </div>
                                            )}
                                        </React.Fragment>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-20 text-center text-slate-500">
                                    <p className="text-lg">No specific recommendations found for this title.</p>
                                    <button onClick={handleBack} className="mt-4 text-blue-400 hover:underline">Try another title</button>
                                </div>
                            )}
                         </div>
                     )}
                 </div>
             )}
        </div>
    );
};