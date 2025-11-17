import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ContestPage from './page/contests';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/contests" element={<ContestPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
