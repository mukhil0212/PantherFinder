import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import HeaderTailwind from './components/Layout/HeaderTailwind';

// Public Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ItemsListPage from './pages/ItemsListPage';
import ItemDetailPage from './pages/ItemDetailPage';

// Protected Pages
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import SubmitItemPage from './pages/SubmitItemPage';
import MyItemsPage from './pages/MyItemsPage';
import MyClaimsPage from './pages/MyClaimsPage';
import NotificationsPage from './pages/NotificationsPage';

// Admin Pages
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminItemsPage from './pages/admin/AdminItemsPage';
import AdminLocationsPage from './pages/admin/AdminLocationsPage';
import AdminClaimsPage from './pages/admin/AdminClaimsPage';

// Protected Route Component
const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  const { loadUser } = useAuth();

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <HeaderTailwind />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="items" element={<ItemsListPage />} />
          <Route path="items/:itemId" element={<ItemDetailPage />} />

          {/* Protected Routes */}
          <Route path="dashboard" element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } />
          <Route path="profile" element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } />
          <Route path="submit-item" element={
            <ProtectedRoute>
              <SubmitItemPage />
            </ProtectedRoute>
          } />
          <Route path="my-items" element={
            <ProtectedRoute>
              <MyItemsPage />
            </ProtectedRoute>
          } />
          <Route path="my-claims" element={
            <ProtectedRoute>
              <MyClaimsPage />
            </ProtectedRoute>
          } />
          <Route path="notifications" element={
            <ProtectedRoute>
              <NotificationsPage />
            </ProtectedRoute>
          } />

          {/* Admin Routes */}
          <Route path="admin" element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboardPage />
            </ProtectedRoute>
          } />
          <Route path="admin/users" element={
            <ProtectedRoute requiredRole="admin">
              <AdminUsersPage />
            </ProtectedRoute>
          } />
          <Route path="admin/items" element={
            <ProtectedRoute requiredRole="admin">
              <AdminItemsPage />
            </ProtectedRoute>
          } />
          <Route path="admin/locations" element={
            <ProtectedRoute requiredRole="admin">
              <AdminLocationsPage />
            </ProtectedRoute>
          } />
          <Route path="admin/claims" element={
            <ProtectedRoute requiredRole="admin">
              <AdminClaimsPage />
            </ProtectedRoute>
          } />

          {/* Catch all - replace with 404 component if needed */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;