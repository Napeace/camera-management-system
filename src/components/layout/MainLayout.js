import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Navbar from './Navbar';

const MainLayout = ({ 
  children, 
  Sidebar 
}) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  
  // Gunakan AuthContext untuk mendapatkan user dan logout function
  const { user, logout: authLogout, isLoading } = useAuth();

  const handleSidebarToggle = (collapsed) => {
    setSidebarCollapsed(collapsed);
  };

  // Handle logout dengan navigation ke login page
  const handleLogout = async () => {
    try {
      console.log('MainLayout: Starting logout process');
      
      // Panggil logout dari AuthContext
      authLogout();
      
      console.log('MainLayout: Logout completed, navigating to login');
      
      // Navigate ke login page setelah logout
      navigate('/login', { replace: true });
      
    } catch (error) {
      console.error('MainLayout: Logout error:', error);
    }
  };

  // Show loading state if auth is still loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
      <div className="flex">        
        {Sidebar && (
          <Sidebar
            user={user}
            onLogout={handleLogout} // Pass the actual logout function
            onToggle={handleSidebarToggle}
            isCollapsed={sidebarCollapsed} 
          />
        )}
        
        <div 
          className={`flex-1 min-h-screen transition-all duration-500 ${
            sidebarCollapsed ? 'ml-20' : 'ml-72'
          }`}
        >
          <div className="p-4 pb-0">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-600/30 shadow-lg overflow-visible">
              <Navbar user={user} />
            </div>
          </div>
          
          <main key={location.pathname} className="p-6 animate-fade-in">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

export default MainLayout;