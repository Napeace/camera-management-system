import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import MainLayout from '../components/layout/MainLayout';
import Sidebar from '../components/layout/Sidebar';
import StatCard from '../components/common/StatCard';

// Komponen konten dashboard, tidak perlu diubah
const DashboardContent = () => {
  const stats = [
    { label: 'Total Cameras', value: '24', icon: '📹', color: 'blue' },
    { label: 'Online', value: '22', icon: '🟢', color: 'green' },
    { label: 'Offline', value: '2', icon: '🔴', color: 'red' },
  ];

  const recentActivity = [
    { action: 'Camera added', location: 'ICU Room 205', time: '10 minutes ago' },
    { action: 'User logged in', user: 'security_01', time: '15 minutes ago' },
    { action: 'Backup completed', status: 'Success', time: '1 hour ago' }
  ];

  const handleStatCardClick = (statData) => {
    console.log('Stat card clicked:', statData);
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Welcome to CCTV Management System</h2>
        <p className="text-blue-100">Monitor and manage your hospital security infrastructure</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatCard
            key={index}
            label={stat.label}
            value={stat.value}
            icon={stat.icon}
            color={stat.color}
            onClick={handleStatCardClick}
          />
        ))}
      </div>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Recent Activity</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-medium text-gray-800">{activity.action}</p>
                  <p className="text-xs text-gray-600">
                    {activity.location || activity.user || activity.status}
                  </p>
                </div>
                <span className="text-xs text-gray-500">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Komponen utama halaman dashboard
const DashboardPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // =======================================================
  // === FUNGSI LOGOUT DIPERBAIKI DI SINI ===
  // =======================================================
  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout(); // 1. Bersihkan state dan localStorage
      
      // 2. Paksa reload penuh ke halaman login untuk sesi yang bersih
      window.location.href = '/login'; 
    }
  };
  // =======================================================

  const handlePageChange = (pageId, path) => {
    console.log(`Navigating to: ${pageId} (${path})`);
    navigate(path); // Disederhanakan untuk langsung navigasi ke path yang diberikan
  };

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
      <DashboardContent />
    </MainLayout>
  );
};

export default DashboardPage;