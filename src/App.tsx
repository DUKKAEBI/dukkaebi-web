import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ContestPage from './page/contests';
import ContestDetailPage from './page/contests/contestDetail';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/contests" element={<ContestPage />} />
        <Route path="/contests/:id" element={<ContestDetailPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
