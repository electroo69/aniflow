import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import {
  Tv, BookOpen, Users, Calendar, Trophy, Shuffle,
  Search, Menu, X, Home, ThumbsUp
} from 'lucide-react';
import { AdBanner } from './AdBanner';

const SidebarItem = ({ to, icon: Icon, label, onClick }: { to: string; icon: any; label: string; onClick?: () => void }) => (
  <NavLink
    to={to}
    onClick={onClick}
    className={({ isActive }) =>
      `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 ${isActive
        ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50'
        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
      }`
    }
  >
    <Icon size={20} />
    <span className="font-medium text-sm">{label}</span>
  </NavLink>
);

export const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();

  // Sync state with URL when on search page
  useEffect(() => {
    if (location.pathname === '/search') {
      const q = searchParams.get('q');
      if (q) setSearchQuery(q);
    }
  }, [location.pathname, searchParams]);

  // Debounced Search As You Type
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      // Only auto-navigate if the query is not empty and has changed
      // and prevent looping if we are already on the page with the same query
      const currentQ = new URLSearchParams(window.location.search).get('q') || '';

      if (searchQuery.trim() && searchQuery !== currentQ) {
        navigate(`/search?q=${encodeURIComponent(searchQuery)}`, { replace: true });
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, navigate]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setIsSidebarOpen(false);
    }
  };

  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-slate-900 border-b border-slate-800 z-50 sticky top-0">
        <div className="flex items-center gap-2 font-bold text-xl text-blue-500">
          <Tv size={24} />
          <span>AniFlow</span>
        </div>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 text-slate-300"
          aria-label={isSidebarOpen ? "Close navigation menu" : "Open navigation menu"}
        >
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:sticky top-0 left-0 h-full w-64 bg-slate-900 border-r border-slate-800 p-4 z-50
          transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0 md:h-screen overflow-y-auto
        `}
      >
        <div className="flex items-center gap-2 font-bold text-2xl text-blue-500 mb-8 px-2">
          <Tv size={28} />
          <span>AniFlow</span>
        </div>

        <nav className="space-y-1">
          <SidebarItem to="/" icon={Home} label="Home" onClick={closeSidebar} />
          <div className="pt-4 pb-2 px-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Discover</div>
          <SidebarItem to="/top" icon={Trophy} label="Top Ranking" onClick={closeSidebar} />
          <SidebarItem to="/seasonal" icon={Calendar} label="Seasonal" onClick={closeSidebar} />
          <SidebarItem to="/recommendations" icon={ThumbsUp} label="Recommendations" onClick={closeSidebar} />
          <SidebarItem to="/search" icon={Search} label="Advanced Search" onClick={closeSidebar} />

          <div className="pt-4 pb-2 px-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Categories</div>
          <SidebarItem to="/anime" icon={Tv} label="Anime" onClick={closeSidebar} />
          <SidebarItem to="/manga" icon={BookOpen} label="Manga" onClick={closeSidebar} />
          <SidebarItem to="/characters" icon={Users} label="Characters" onClick={closeSidebar} />

          <div className="pt-4 pb-2 px-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Fun</div>
          <SidebarItem to="/random" icon={Shuffle} label="Random" onClick={closeSidebar} />
        </nav>

        <div className="mt-8 p-4 bg-slate-800 rounded-xl">
          <p className="text-xs text-slate-400 text-center">Powered by Jikan API</p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 p-4 flex items-center gap-4">
          <div className="flex-1 max-w-2xl">
            <form onSubmit={handleSearch} className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={18} />
              <input
                type="text"
                placeholder="Search anime, manga, characters..."
                className="w-full bg-slate-900 border border-slate-800 rounded-full py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-slate-600 text-slate-200"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>
          </div>
          <div className="flex items-center gap-3">
            {/* Placeholder for user actions if auth existed */}
            <div className="w-8 h-8 rounded-full bg-blue-600/20 flex items-center justify-center text-blue-400 font-bold text-xs">
              A
            </div>
          </div>
        </header>

        <div className="p-4 md:p-8 flex-1 overflow-y-auto" id="scroll-container">
          {/* Content loads first for better LCP */}
          <Outlet />

          {/* Ads load after content */}
          <div className="hidden md:flex justify-center mt-6">
            <AdBanner
              width={728}
              height={90}
              dataKey="81578b19d83a4f1759aa884de44e3af4"
              className="my-6"
            />
          </div>

          <div className="md:hidden flex justify-center mt-6">
            <AdBanner
              width={320}
              height={50}
              dataKey="253051113717debd95173954d883edf4"
              className="my-6"
            />
          </div>
        </div>
      </main>
    </div>
  );
};