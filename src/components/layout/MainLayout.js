import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
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
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  
  const { user, logout: authLogout, isLoading } = useAuth();
  const { isDarkMode } = useTheme();

  // 🔥 NEW: Detect mobile screen for overlay mode
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint for true mobile
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleSidebarToggle = (collapsed) => {
    setSidebarCollapsed(collapsed);
  };

  const handleLogout = async () => {
    try {
       authLogout();
       navigate('/login', { replace: true });
    } catch (error) {
      console.error('MainLayout: Logout error:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className={`animate-spin rounded-full h-8 w-8 border-b-2 mx-auto mb-4 ${
            isDarkMode ? 'border-white' : 'border-gray-800'
          }`}></div>
          <p className={isDarkMode ? 'text-white' : 'text-gray-800'}>Loading...</p>
        </div>
      </div>
    );
  }

  // 🔥 Responsive margin - no margin on mobile (overlay mode)
  const getContentMargin = () => {
    if (isMobile) {
      return 'ml-0'; // No margin on mobile - sidebar is overlay
    }
    
    // Tablet & Desktop: push content behavior
    if (sidebarCollapsed) {
      return 'ml-20'; // 80px - collapsed sidebar + 8px gap
    }
    return 'ml-72'; // 288px - expanded sidebar (256px + 32px gap)
  };

  // 🔥 Responsive max width - full width on mobile
  const getContentMaxWidth = () => {
    if (isMobile) {
      return 'max-w-full'; // Full width on mobile
    }
    
    // Tablet & Desktop: calculated width
    if (sidebarCollapsed) {
      return 'max-w-[calc(100vw-5rem)]'; // 100vw - 80px
    }
    return 'max-w-[calc(100vw-18rem)]'; // 100vw - 288px
  };

  return (
    <div className="min-h-screen w-full">
      <div className="flex min-h-screen w-full">        
        {Sidebar && (
          <Sidebar
            user={user}
            onLogout={handleLogout}
            onToggle={handleSidebarToggle}
            isCollapsed={sidebarCollapsed} 
          />
        )}
        
        {/* 🔥 UPDATED: Responsive content area - full width on mobile */}
        <div 
          className={`
            flex-1 min-h-screen w-full
            transition-all duration-500 ease-in-out
            ${getContentMargin()}
            ${getContentMaxWidth()}
          `}
        >
          <motion.div 
            key={`navbar-${location.pathname}`}
            className="p-4 pb-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ 
              duration: 0.2,
              ease: [0.4, 0, 0.2, 1]
            }}
          >
            <div className={`navbar-container backdrop-blur-sm rounded-xl border shadow-lg overflow-visible ${
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
          </motion.div>
          
          <main className="p-6 w-full">
            <div className="w-full">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default MainLayout;