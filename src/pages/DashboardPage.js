import React from 'react';
import { useNavigate } from 'react-router-dom';
import Dashboard from '../components/Dashboard';

function DashboardPage() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Redirect ke login
    navigate('/login', { replace: true });
  };

  // Get user data dari localStorage
  const userData = JSON.parse(localStorage.getItem('user') || '{}');

  return <Dashboard user={userData} onLogout={handleLogout} />;
}

export default DashboardPage;