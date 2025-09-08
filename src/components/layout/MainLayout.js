import React, { useState, useEffect } from 'react';
import Navbar from './Navbar'; // Import komponen Navbar dari file terpisah

// Default Dashboard Content Component
const DefaultDashboard = () => (
  <div className="space-y-6">
    <div className="bg-blue-600 text-white p-6 rounded-lg">
      <h2 className="text-2xl font-bold mb-2">Welcome to CCTV Management System</h2>
      <p>Monitor and manage your hospital security infrastructure</p>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-2xl font-bold">24</h3>
            <p className="text-gray-600 text-sm">Total Cameras</p>
          </div>
          <div className="text-2xl">📹</div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-2xl font-bold">22</h3>
            <p className="text-gray-600 text-sm">Online</p>
          </div>
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-2xl font-bold">2</h3>
            <p className="text-gray-600 text-sm">Offline</p>
          </div>
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
        </div>
      </div>
    </div>

    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold">Recent Activity</h3>
      </div>
      <div className="p-6 space-y-4">
        {[...Array(20)].map((_, i) => (
          <div key={i} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
            <div>
              <p className="font-medium">Camera added</p>
              <p className="text-sm text-gray-600">ICU Room {205 + i}</p>
            </div>
            <p className="text-sm text-gray-500">{10 + i * 5} minutes ago</p>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const MainLayout = ({ 
  children, 
  user = { username: 'Admin', role: 'superadmin' }, 
  onLogout = () => {},
  Sidebar 
}) => {
  // FORCE collapsed state to TRUE with debugging
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

  // Debug log untuk memastikan state
  useEffect(() => {
    console.log('🔍 MainLayout: Initial sidebar state:', { sidebarCollapsed });
  }, []);

  const handleSidebarToggle = (collapsed) => {
    console.log('🔍 MainLayout: Sidebar toggle received:', { 
      from: sidebarCollapsed, 
      to: collapsed,
      timestamp: new Date().toISOString()
    });
    setSidebarCollapsed(collapsed);
  };

  // Debug log ketika state berubah
  useEffect(() => {
    console.log('🔍 MainLayout: Sidebar state changed to:', sidebarCollapsed);
  }, [sidebarCollapsed]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">        
        {/* Sidebar - menggunakan komponen yang diteruskan sebagai prop */}
        {Sidebar && (
          <Sidebar
            user={user}
            onLogout={onLogout}
            onToggle={handleSidebarToggle}
            isCollapsed={sidebarCollapsed} 
          />
        )}
        
        {/* Main Content Area dengan margin responsive - FORCE dengan style inline juga */}
        <div 
          className={`flex-1 min-h-screen transition-all duration-300 ${
            sidebarCollapsed ? 'ml-16' : 'ml-64'
          }`}
          style={{
            marginLeft: sidebarCollapsed ? '64px' : '256px', // Force dengan inline style
            minHeight: '100vh'
          }}
        >
          {/* Menggunakan komponen Navbar dari file terpisah */}
          <Navbar user={user} />
          
          {/* Page Content */}
          <main className="p-6">
            {children || <DefaultDashboard />}
          </main>
        </div>
      </div>
    </div>
  );
};

export default MainLayout;