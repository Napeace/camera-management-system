import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';

const MainLayout = ({ 
  children, 
  user = { username: 'Admin', role: 'superadmin' }, 
  onLogout = () => {},
  Sidebar 
}) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();

  const handleSidebarToggle = (collapsed) => {
    setSidebarCollapsed(collapsed);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
      <div className="flex">        
        {Sidebar && (
          <Sidebar
            user={user}
            onLogout={onLogout}
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