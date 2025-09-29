import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import UserPage from './pages/UserPage';
import CCTVPage from './pages/CCTVPage';
import LiveMonitoringPage from './pages/LiveMonitoringPage';
import HistoryPage from './pages/HistoryPage';
import { ToastProvider } from './contexts/ToastContext';
import { ThemeProvider } from './contexts/ThemeContext';

const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <Router>
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
                
                {/* CCTV Management Routes - Now shows table/list like UserPage */}
                <Route 
                  path="/cctv" 
                  element={
                    <ProtectedRoute>
                      <CCTVPage />
                    </ProtectedRoute>
                  } 
                />
                
                {/* Live Monitoring Routes - New feature for viewing live cameras */}
                <Route 
                  path="/live-monitoring" 
                  element={
                    <ProtectedRoute>
                      <LiveMonitoringPage />
                    </ProtectedRoute>
                  } 
                />
                
                {/* User Management Routes - Only for Super Admin */}
                <Route 
                  path="/users" 
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
                      <HistoryPage />
                    </ProtectedRoute>
                  } 
                />
                
                {/* Settings Routes */}
                <Route 
                  path="/backup/export" 
                  element={
                    <ProtectedRoute>
                      <div>Export Data Page (Coming Soon)</div>
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/backup/import" 
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
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;