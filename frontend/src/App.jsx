import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';

// Layout components
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AvailableFoodPage from './pages/AvailableFoodPage';
import DonationDetailsPage from './pages/DonationDetailsPage';
import PostDonationPage from './pages/PostDonationPage';
import ProviderDashboard from './pages/ProviderDashboard';
import NgoDashboard from './pages/NgoDashboard';
import PickupDashboard from './pages/PickupDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ImpactPage from './pages/ImpactPage';
import ProfilePage from './pages/ProfilePage';
import NotificationsPage from './pages/NotificationsPage';
import HelpPage from './pages/HelpPage';

// Role-based Route Guard
function ProtectedRoute({ children, allowedRoles }) {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Navbar />
          <main style={{ flex: 1 }}>
            <Routes>
              {/* Public Pages */}
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/donations" element={<AvailableFoodPage />} />
              <Route path="/donations/:id" element={<DonationDetailsPage />} />
              <Route path="/impact" element={<ImpactPage />} />
              <Route path="/help" element={<HelpPage />} />

              {/* Role-Protected Pages */}
              <Route path="/donations/new" element={
                <ProtectedRoute allowedRoles={['FOOD_PROVIDER']}>
                  <PostDonationPage />
                </ProtectedRoute>
              } />

              <Route path="/provider/dashboard" element={
                <ProtectedRoute allowedRoles={['FOOD_PROVIDER']}>
                  <ProviderDashboard />
                </ProtectedRoute>
              } />

              <Route path="/ngo/dashboard" element={
                <ProtectedRoute allowedRoles={['NGO']}>
                  <NgoDashboard />
                </ProtectedRoute>
              } />

              <Route path="/volunteer/dashboard" element={
                <ProtectedRoute allowedRoles={['VOLUNTEER']}>
                  <PickupDashboard />
                </ProtectedRoute>
              } />

              <Route path="/admin/dashboard" element={
                <ProtectedRoute allowedRoles={['ADMINISTRATOR']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } />

              <Route path="/profile" element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              } />

              <Route path="/notifications" element={
                <ProtectedRoute>
                  <NotificationsPage />
                </ProtectedRoute>
              } />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}
