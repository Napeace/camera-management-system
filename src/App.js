import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import UserPage from './pages/UserPage';
import UserPageWrapper from './pages/UserPageWrapper';
import CCTVPage from './pages/CCTVPage'; // Import CCTVPage

const App = () => {
  return (
    <AuthProvider>
      <Router>
        {/* Tambahkan debug info untuk memastikan tidak ada CSS conflict */}
        <div className="app-container" style={{ minHeight: '100vh' }}>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            
            {/* Protected Routes */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              } 
            />
            
            {/* CCTV Management Routes */}
            <Route 
              path="/cctv/view" 
              element={
                <ProtectedRoute>
                  <CCTVPage />
                </ProtectedRoute>
              } 
            />
            {/* Nanti bisa ditambahkan route lain untuk CCTV */}
            <Route 
              path="/cctv/add" 
              element={
                <ProtectedRoute>
                  <div>Tambah CCTV Page (Coming Soon)</div>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/cctv/update" 
              element={
                <ProtectedRoute>
                  <div>Update CCTV Page (Coming Soon)</div>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/cctv/delete" 
              element={
                <ProtectedRoute>
                  <div>Delete CCTV Page (Coming Soon)</div>
                </ProtectedRoute>
              } 
            />
            
            {/* User Management Routes - Only for Super Admin */}
            <Route 
              path="/users" 
              element={
                <ProtectedRoute requiredRole="superadmin">
                  <UserPageWrapper />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/users/view" 
              element={
                <ProtectedRoute requiredRole="superadmin">
                  <UserPage />
                </ProtectedRoute>
              } 
            />
            
            {/* History Route */}
            <Route 
              path="/history" 
              element={
                <ProtectedRoute>
                  <div>History Page (Coming Soon)</div>
                </ProtectedRoute>
              } 
            />
            
            {/* Settings Routes */}
            <Route 
              path="/settings/export" 
              element={
                <ProtectedRoute>
                  <div>Export Data Page (Coming Soon)</div>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/settings/import" 
              element={
                <ProtectedRoute>
                  <div>Import Data Page (Coming Soon)</div>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/settings/backup" 
              element={
                <ProtectedRoute>
                  <div>Backup Data Page (Coming Soon)</div>
                </ProtectedRoute>
              } 
            />
            
            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            {/* Catch all - redirect to dashboard */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;