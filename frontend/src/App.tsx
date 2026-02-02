import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Pets } from './pages/Pets';
import { Schedules } from './pages/Schedules';
import { Logs } from './pages/Logs';
import { Journal } from './pages/Journal';
import { Login } from './pages/Login';
import { AuthProvider, useAuth } from './context/AuthContext';

const queryClient = new QueryClient();

const ProtectedRoute = () => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />

            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Layout />}>
                <Route index element={<Dashboard />} />
                <Route path="pets" element={<Pets />} />
                <Route path="schedules" element={<Schedules />} />
                <Route path="logs" element={<Logs />} />
                <Route path="journal" element={<Journal />} />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
