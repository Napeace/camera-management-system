import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import DashboardPage from './features/dashboard/DashboardPage';
import UserPage from './features/user/UserPage';
import CCTVPage from './features/cctv/CCTVPage';
import LiveMonitoringPage from './features/live-monitoring/LiveMonitoringPage';
import HistoryPage from './features/history/HistoryPage';
import { ToastProvider } from './contexts/ToastContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { NavigationProvider } from './contexts/NavigationContext';

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        <Route path="/login" element={<LoginPage />} />
        
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/cctv" 
          element={
            <ProtectedRoute>
              <CCTVPage />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/live-monitoring" 
          element={
            <ProtectedRoute>
              <LiveMonitoringPage />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/users" 
          element={
            <ProtectedRoute requiredRole="superadmin">
              <UserPage />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/history" 
          element={
            <ProtectedRoute>
              <HistoryPage />
            </ProtectedRoute>
          } 
        />
        
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
        
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <NavigationProvider>
            <Router>
              <div className="app-container" style={{ minHeight: '100vh' }}>
                <AnimatedRoutes />
              </div>
            </Router>
          </NavigationProvider>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;