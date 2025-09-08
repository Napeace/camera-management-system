import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import UserPage from './pages/UserPage';
import UserPageWrapper from './pages/UserPageWrapper';

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