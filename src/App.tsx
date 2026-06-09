import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import SortingPage from './pages/SortingPage';
import SearchingPage from './pages/SearchingPage';
import GraphPage from './pages/GraphPage';
import SegmentTreePage from './pages/SegmentTreePage';
import DPPage from './pages/DPPage';
import StringPage from './pages/StringPage';
import PuzzlePage from './pages/PuzzlePage';
import PathfindingPage from './pages/PathfindingPage';
import GeometryPage from './pages/GeometryPage';
import RacePage from './pages/RacePage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/sorting/:algorithm" element={<SortingPage />} />
        <Route path="/searching/:algorithm" element={<SearchingPage />} />
        <Route path="/graph/:algorithm" element={<GraphPage />} />
        <Route path="/tree/:algorithm" element={<SegmentTreePage />} />
        <Route path="/dp/:algorithm" element={<DPPage />} />
        <Route path="/strings/:algorithm" element={<StringPage />} />
        <Route path="/puzzles/:algorithm" element={<PuzzlePage />} />
        <Route path="/pathfinding/:algorithm" element={<PathfindingPage />} />
        <Route path="/geometry/:algorithm" element={<GeometryPage />} />
        <Route path="/race" element={<RacePage />} />
        <Route path="/" element={<Navigate to="/sorting/bubble" replace />} />
        <Route path="*" element={<Navigate to="/sorting/bubble" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
