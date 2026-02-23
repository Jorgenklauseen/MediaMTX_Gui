// App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import RootLayout from './layouts/RootLayout';
import Dashboard from './pages/Dashboard';
import Recordings from './pages/Recordings';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="/recordings" element={<Recordings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;