import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import Navbar from './Navbar';

const MainLayout = ({ 
  children, 
  Sidebar,
  navbarTitle,   
  navbarSubtitle 
}) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  
  // Gunakan AuthContext untuk mendapatkan user dan logout function
  const { user, logout: authLogout, isLoading } = useAuth();
  
  // Gunakan ThemeContext untuk mendapatkan tema
  const { isDarkMode } = useTheme();

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
      <div className="min-h-screen bg-gradient-to-b from-[#0a1628] via-blue-500 to-[#0a1628] flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  };

  return (
    <div className={`min-h-screen transition-all duration-300 ${
      isDarkMode 
        ? 'bg-gradient-to-b from-[#0a1628] via-blue-500 to-[#0a1628]' 
        : 'bg-gradient-to-b from-blue-50 via-blue-100 to-blue-200'
    }`}>
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
            <div className={`backdrop-blur-sm rounded-xl border shadow-lg overflow-visible transition-all duration-300 ${
              isDarkMode
                ? 'bg-slate-900/50 border-slate-600/30'
                : 'bg-white/60 border-gray-200/50'
            }`}>
              <Navbar 
                user={user} 
                title={navbarTitle}       
                subtitle={navbarSubtitle} 
              />
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