import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Details } from './pages/Details';
import { Search } from './pages/Search';
import { Random } from './pages/Random';
import { Recommendations } from './pages/Recommendations';

const App: React.FC = () => {
  return (
    <HashRouter>
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
    </HashRouter>
  );
};

export default App;