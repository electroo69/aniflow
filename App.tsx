import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Loading } from './components/Loading';

// Lazy load all page components for better performance
const Home = lazy(() => import('./pages/Home').then(module => ({ default: module.Home })));
const Details = lazy(() => import('./pages/Details').then(module => ({ default: module.Details })));
const Search = lazy(() => import('./pages/Search').then(module => ({ default: module.Search })));
const Random = lazy(() => import('./pages/Random').then(module => ({ default: module.Random })));
const Recommendations = lazy(() => import('./pages/Recommendations').then(module => ({ default: module.Recommendations })));

// Helper component to scroll to top on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />

            {/* Detail Routes */}
            <Route path="anime/:id" element={<Details />} />
            <Route path="manga/:id" element={<Details />} />

            {/* List Routes 
                Adding 'key' forces the component to remount when the route changes.
                This ensures state (page number, results list) is reset correctly between tabs.
            */}
            <Route path="search" element={<Search key="search" />} />
            <Route path="top" element={<Search key="top" />} />
            <Route path="seasonal" element={<Search key="seasonal" />} />
            <Route path="anime" element={<Search key="anime" />} />
            <Route path="manga" element={<Search key="manga" />} />
            <Route path="characters" element={<Search key="characters" />} />

            {/* Functional Routes */}
            <Route path="random" element={<Random />} />
            <Route path="recommendations" element={<Recommendations />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default App;