import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import MainLayout from '../components/layout/MainLayout';
import Sidebar from '../components/layout/Sidebar';
import UserPage from './UserPage';

const UserPageWrapper = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
      navigate('/login', { replace: true });
    }
  };

  const handlePageChange = (pageId, path) => {
    console.log(`Navigating to: ${pageId} (${path})`);
    
    switch (pageId) {
      case 'dashboard':
        navigate('/dashboard');
        break;
      case 'users':
        navigate('/users');
        break;
      default:
        console.log(`Navigation for ${pageId} not implemented yet`);
    }
  };

  return (
    <MainLayout 
      user={user} 
      onLogout={handleLogout}
      Sidebar={(props) => (
        <Sidebar 
          {...props}
          onPageChange={handlePageChange}
        />
      )}
    >
      <UserPage />
    </MainLayout>
  );
};

export default UserPageWrapper;