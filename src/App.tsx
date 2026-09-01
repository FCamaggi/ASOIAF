import { Navigate, Route, Routes } from 'react-router-dom';
import { usePlayer } from './store.ts';
import Welcome from './pages/Welcome.tsx';
import Vote from './pages/Vote.tsx';
import Waiting from './pages/Waiting.tsx';
import Results from './pages/Results.tsx';

export default function App() {
  const [player] = usePlayer();

  return (
    <Routes>
      <Route path="/" element={<Welcome />} />
      <Route
        path="/vote"
        element={player ? <Vote /> : <Navigate to="/" replace />}
      />
      <Route
        path="/waiting"
        element={player ? <Waiting /> : <Navigate to="/" replace />}
      />
      <Route path="/results" element={<Results />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
