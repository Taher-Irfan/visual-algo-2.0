import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import SortingPage from './pages/SortingPage';
import SearchingPage from './pages/SearchingPage';
import GraphPage from './pages/GraphPage';
import SegmentTreePage from './pages/SegmentTreePage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/sorting/:algorithm" element={<SortingPage />} />
        <Route path="/searching/:algorithm" element={<SearchingPage />} />
        <Route path="/graph/:algorithm" element={<GraphPage />} />
        <Route path="/tree/:algorithm" element={<SegmentTreePage />} />
        <Route path="/" element={<Navigate to="/sorting/bubble" replace />} />
        <Route path="*" element={<Navigate to="/sorting/bubble" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
