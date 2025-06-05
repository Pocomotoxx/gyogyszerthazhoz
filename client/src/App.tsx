import type { ReactElement } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './LoginPage';
import Dashboard from './Dashboard';
import NotificationCenter from './NotificationCenter';
import MedicationRequests from './MedicationRequests';
import Payments from './Payments';
import RoutePlanner from './RoutePlanner';
import AdminDashboard from './AdminDashboard';
import Chat from './Chat';
import { AuthProvider, useAuth } from './hooks/useAuth';

function RequireAuth({ children }: { children: ReactElement }) {
  const { user } = useAuth();
  return user ? children : <LoginPage />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<RequireAuth><Dashboard /></RequireAuth>} />
      <Route path="/notifications" element={<RequireAuth><NotificationCenter /></RequireAuth>} />
      <Route path="/medication-requests" element={<RequireAuth><MedicationRequests /></RequireAuth>} />
      <Route path="/payments" element={<RequireAuth><Payments /></RequireAuth>} />
      <Route path="/route-planner" element={<RequireAuth><RoutePlanner /></RequireAuth>} />
      <Route path="/admin" element={<RequireAuth><AdminDashboard /></RequireAuth>} />
      <Route path="/chat" element={<RequireAuth><Chat /></RequireAuth>} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
