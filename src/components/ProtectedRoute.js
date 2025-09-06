import React from 'react';
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  
  // Kalau tidak ada token, redirect ke login
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  // Kalau ada token, tampilkan component yang diminta
  return children;
}

export default ProtectedRoute;