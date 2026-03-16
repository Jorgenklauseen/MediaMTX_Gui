// App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import RootLayout from './layouts/RootLayout';
import Dashboard from './pages/Dashboard';
import Recordings from './pages/Recordings';
import Users from './pages/Users';
import Projects from './pages/Projects';
import { ToastContainer } from 'react-toastify';

import { ProtectedRoute, AdminRoute } from './components/ProtectedRoute';


function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
      <ToastContainer position="bottom-right" />
        <Routes>
          <Route path="/" element={
            <ProtectedRoute>
              <RootLayout />
            </ProtectedRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="/recordings" element={<Recordings />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/users" element={
              <AdminRoute>
                <Users />
              </AdminRoute>
            } />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;