// App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import RootLayout from './layouts/RootLayout';
import Dashboard from './pages/Dashboard';
import Recordings from './pages/Recordings';
import Users from './pages/Users';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import Gudies from './pages/Guide';
import { ToastContainer } from 'react-toastify';
import AcceptInvitation from './pages/sidePages/AcceptInvitation';
import Profile from './pages/Profile';
import StreamView from './pages/StreamView';
import Home from './pages/Home';
import { ProtectedRoute, AdminRoute } from './components/ProtectedRoute';


function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
      <ToastContainer position="bottom-right" />
        <Routes>
          <Route element={<RootLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/privacy" element={<Home />} />
          </Route>
          <Route element={
            <ProtectedRoute>
              <RootLayout />
            </ProtectedRoute>}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/recordings" element={<Recordings />} />
            <Route path="/guides" element={<Gudies />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/projects/:id" element={<ProjectDetail />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/users" element={
              <AdminRoute>
                <Users />
              </AdminRoute>
            } />
          </Route>
          <Route path="/invitations/accept" element={
            <ProtectedRoute>
              <AcceptInvitation />
            </ProtectedRoute>
          } />
          <Route path="/stream" element={<StreamView />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;