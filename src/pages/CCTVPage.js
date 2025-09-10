import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import MainLayout from '../components/layout/MainLayout';
import Sidebar from '../components/layout/Sidebar';
import CCTVLiveMonitoring from '../components/cctv/CCTVLiveMonitoring'; // Ganti import ini

// Main CCTV Page Component - Following DashboardPage pattern
const CCTVPage = () => {
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
    
    // Handle actual navigation
    switch (pageId) {
      case 'dashboard':
        navigate('/dashboard');
        break;
      case 'users':
        navigate('/users');
        break;
      case 'view-cctv':
        navigate('/cctv/view');
        break;
      case 'add-cctv':
        navigate('/cctv/add');
        break;
      case 'update-cctv':
        navigate('/cctv/update');
        break;
      case 'delete-cctv':
        navigate('/cctv/delete');
        break;
      case 'history':
        navigate('/history');
        break;
      case 'export-data':
        navigate('/settings/export');
        break;
      case 'import-data':
        navigate('/settings/import');
        break;
      case 'backup-data':
        navigate('/settings/backup');
        break;
      default:
        console.log(`Navigation for ${pageId} not implemented yet`);
    }
  };

  // Buat komponen Sidebar dengan props yang sudah di-bind
  const SidebarComponent = (props) => (
    <Sidebar 
      {...props}
      onPageChange={handlePageChange}
    />
  );

  return (
    <MainLayout 
      user={user} 
      onLogout={handleLogout}
      Sidebar={SidebarComponent}
    >
      <CCTVLiveMonitoring />
    </MainLayout>
  );
};

export default CCTVPage;