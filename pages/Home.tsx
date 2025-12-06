import React, { useEffect, useState } from 'react';
import { jikanApi } from '../services/api';
import { Anime, Manga } from '../types';
import { Card } from '../components/Card';
import { Loading } from '../components/Loading';
import { ChevronRight, Flame, Calendar, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AdBanner } from '../components/AdBanner';
import { SEO } from '../components/SEO';

const SectionHeader = ({ title, icon: Icon, link }: { title: string, icon: any, link: string }) => (
  <div className="flex items-center justify-between mb-6">
    <div className="flex items-center gap-3">
      <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
        <Icon size={24} />
      </div>
      <h2 className="text-2xl font-bold text-slate-100">{title}</h2>
    </div>
    <Link to={link} className="flex items-center gap-1 text-sm font-medium text-slate-400 hover:text-white transition-colors">
      View All <ChevronRight size={16} />
    </Link>
  </div>
);

const HorizontalScroll = ({ children }: { children?: React.ReactNode }) => (
  <div className="flex gap-4 overflow-x-auto pb-6 snap-x snap-mandatory -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide">
    {children}
  </div>
);

export const Home = () => {
  const [topAnime, setTopAnime] = useState<Anime[]>([]);
  const [seasonNow, setSeasonNow] = useState<Anime[]>([]);
  const [upcoming, setUpcoming] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Execute concurrently
        const [topRes, seasonRes, upcomingRes] = await Promise.all([
          jikanApi.getTopAnime(),
          jikanApi.getSeasonNow(),
          jikanApi.getUpcomingAnime(),
        ]);
        
        setTopAnime(topRes.data.slice(0, 10));
        setSeasonNow(seasonRes.data.slice(0, 10));
        setUpcoming(upcomingRes.data.slice(0, 10));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <Loading />;

  return (
    <div className="space-y-12">
      <SEO 
        title="AniFlow" 
        description="Your ultimate destination for discovering Anime and Manga. Browse top charts, seasonal releases, and find your next obsession." 
      />
      
      {/* Hero / Top Section */}
      <section>
        <SectionHeader title="Trending Now" icon={Flame} link="/top" />
        <HorizontalScroll>
          {topAnime.map((item, index) => (
            <React.Fragment key={item.mal_id}>
              <div className="min-w-[160px] md:min-w-[200px] snap-start">
                <Card item={item} />
              </div>
              {(index + 1) % 5 === 0 && (
                 <div className="min-w-[160px] md:min-w-[200px] aspect-[2/3] snap-start flex items-center justify-center bg-slate-900 rounded-xl overflow-hidden relative border border-slate-800">
                    <div className="transform scale-[0.55] md:scale-[0.75] origin-center">
                        <AdBanner width={300} height={250} dataKey="779520aa602be4ce8eca6a1d6012e88a" />
                    </div>
                 </div>
              )}
            </React.Fragment>
          ))}
        </HorizontalScroll>
      </section>

      {/* Ad: Responsive Leaderboard (728x90 Desktop / 320x50 Mobile) */}
      <div className="flex justify-center my-6">
        <div className="hidden md:block">
           <AdBanner 
             width={728} 
             height={90} 
             dataKey="c50bb328670da58a01a9ba5ef5827975"
           />
        </div>
        <div className="md:hidden block">
           <AdBanner 
             width={320} 
             height={50} 
             dataKey="d4bc816320110b1e33cd70cd98473339"
           />
        </div>
      </div>

      {/* Seasonal Section */}
      <section>
        <SectionHeader title="This Season" icon={Calendar} link="/seasonal" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 auto-rows-fr">
            {seasonNow.map((item, index) => (
                <React.Fragment key={item.mal_id}>
                  <Card item={item} />
                  {(index + 1) % 5 === 0 && (
                    <div className="aspect-[2/3] flex items-center justify-center bg-slate-900 rounded-xl border border-slate-800 overflow-hidden relative">
                       <div className="transform scale-[0.55] md:scale-[0.75] origin-center">
                          <AdBanner width={300} height={250} dataKey="779520aa602be4ce8eca6a1d6012e88a" />
                       </div>
                    </div>
                  )}
                </React.Fragment>
            ))}
        </div>
      </section>

       {/* Upcoming Section */}
       <section>
        <SectionHeader title="Upcoming Hype" icon={TrendingUp} link="/seasonal" />
        <HorizontalScroll>
          {upcoming.map((item, index) => (
            <React.Fragment key={item.mal_id}>
              <div className="min-w-[160px] md:min-w-[200px] snap-start">
                <Card item={item} />
              </div>
               {(index + 1) % 5 === 0 && (
                 <div className="min-w-[160px] md:min-w-[200px] aspect-[2/3] snap-start flex items-center justify-center bg-slate-900 rounded-xl overflow-hidden relative border border-slate-800">
                    <div className="transform scale-[0.55] md:scale-[0.75] origin-center">
                        <AdBanner width={300} height={250} dataKey="779520aa602be4ce8eca6a1d6012e88a" />
                    </div>
                 </div>
              )}
            </React.Fragment>
          ))}
        </HorizontalScroll>
      </section>
    </div>
  );
};