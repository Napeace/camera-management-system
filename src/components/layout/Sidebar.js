import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import ConfirmDialog from '../common/ConfirmDialog';
import ExportDataModal from '../../features/backup/export/ExportDataModal';
import {
  HomeIcon,
  ComputerDesktopIcon,
  VideoCameraIcon,
  UserGroupIcon,
  ChartBarIcon,
  CircleStackIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';

const Sidebar = ({ 
  user = { nama: 'Admin', role: 'superadmin' }, 
  onLogout = () => {}, 
  activePage = 'dashboard', 
  onPageChange = () => {}, 
  onToggle = () => {},
  isCollapsed = false
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [expandedMenus, setExpandedMenus] = useState({
    backup: false
  });
  const [isMobile, setIsMobile] = useState(false);
  
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const getCurrentActivePage = () => {
    const pathname = location.pathname;
    
    if (pathname === '/dashboard') return 'dashboard';
    if (pathname.startsWith('/cctv')) return 'cctv';
    if (pathname.startsWith('/live-monitoring')) return 'live-monitoring';
    if (pathname.startsWith('/users')) return 'users';
    if (pathname === '/history') return 'history';
    if (pathname === '/backup/export') return 'export-data';
    if (pathname === '/backup/import') return 'import-data';
    if (pathname.startsWith('/backup/')) return 'backup';
    
    return activePage;
  };

  const currentActivePage = getCurrentActivePage();

  useEffect(() => {
    const pathname = location.pathname;
    if (pathname.startsWith('/backup/')) {
      setExpandedMenus(prev => ({ ...prev, backup: true }));
    }
  }, [location.pathname]);

  const toggleMenu = (menuKey) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuKey]: !prev[menuKey]
    }));
  };

  const toggleSidebar = () => {
    onToggle(!isCollapsed);
  };

  const handleLogoutClick = () => {
    setShowLogoutDialog(true);
  };

  const handleConfirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      await onLogout();
      setShowLogoutDialog(false);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleCancelLogout = () => {
    setShowLogoutDialog(false);
  };

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: HomeIcon,
      path: '/dashboard'
    },
    {
      id: 'live-monitoring',
      label: 'Live Monitoring',
      icon: ComputerDesktopIcon,
      path: '/live-monitoring'
    },
    {
      id: 'cctv',
      label: 'Manajemen CCTV',
      icon: VideoCameraIcon,
      path: '/cctv'
    },
    {
      id: 'users',
      label: 'Manajemen Pengguna',
      icon: UserGroupIcon,
      roleRequired: 'superadmin',
      path: '/users'
    },
    {
      id: 'history',
      label: 'History',
      icon: ChartBarIcon,
      path: '/history'
    },
    {
      id: 'backup',
      label: 'Backup',
      icon: CircleStackIcon,
      roleRequired: 'superadmin',
      hasSubmenu: true,
      submenu: [
        { id: 'export-data', label: 'Export Data', icon: ArrowDownTrayIcon, path: '/backup/export' },
        { id: 'import-data', label: 'Import Data', icon: ArrowUpTrayIcon, path: '/backup/import' }
      ]
    }
  ];

  const filteredMenuItems = menuItems.filter(item => 
    !item.roleRequired || user.role === item.roleRequired
  );

  const [hoveredItem, setHoveredItem] = useState(null);
  const [hoveredSubItem, setHoveredSubItem] = useState(null);

  const handleMenuClick = (item) => {
    console.log('Menu clicked:', item);

    if (isCollapsed && !isMobile) {
      onToggle(false); 
    }

    if (item.hasSubmenu) {
      toggleMenu(item.id);
    } else {
      console.log('Navigating to:', item.path);
      navigate(item.path); 
      onPageChange(item.id, item.path);
      
      if (isMobile && !isCollapsed) {
        onToggle(true);
      }
    }
  };

  const handleSubmenuClick = (parentId, subItem) => {
    console.log('Submenu clicked:', subItem);
    
    // ← TAMBAHKAN KONDISI INI (baris 179-182)
    // Jika klik Export Data, buka modal
    if (subItem.id === 'export-data') {
      setShowExportModal(true);
      return;
    }
    
    navigate(subItem.path); 
    onPageChange(subItem.id, subItem.path);
    
    if (isMobile && !isCollapsed) {
      onToggle(true);
    }
  };

  const DefaultAvatar = ({ size = 'w-8 h-8' }) => (
    <div className={`${size} rounded-full bg-gray-400 dark:bg-gray-500 flex items-center justify-center flex-shrink-0`}>
      <svg 
        className={`${size === 'w-8 h-8' ? 'w-5 h-5' : 'w-4 h-4'} text-gray-100 dark:text-gray-200`} 
        fill="currentColor" 
        viewBox="0 0 20 20"
      >
        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
      </svg>
    </div>
  );

  const IconComponent = ({ IconComponent: Icon, className = "w-5 h-5", isActive = false, isHovered = false }) => {
    const getColorClass = () => {
      if (isActive) return 'text-blue-600';
      if (isHovered) return 'text-slate-800 dark:text-black';
      return 'text-slate-600 dark:text-white';
    };

    return (
      <Icon 
        className={`${className} transition-all duration-200 ${getColorClass()}`}
      />
    );
  };

  const sidebarWidth = () => {
    if (isMobile) {
      return isCollapsed ? 'w-0' : 'w-sidebar-expanded';
    }
    return isCollapsed ? 'w-sidebar-collapsed' : 'w-sidebar-expanded';
  };

  return (
    <>
      {isMobile && !isCollapsed && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-sidebar-overlay md:hidden"
          onClick={() => onToggle(true)}
        />
      )}

      <div className={`
        fixed left-2 top-2 bottom-2 z-sidebar
        transition-all duration-500 ease-in-out flex flex-col
        bg-white dark:bg-slate-900 text-slate-800 dark:text-white rounded-xl shadow-floating
        ${sidebarWidth()}
        ${isMobile && isCollapsed ? '-translate-x-full' : 'translate-x-0'}
        border border-slate-300/50 dark:border-slate-600/30
      `}>

        <header className="flex items-center justify-center p-6 relative border-b border-slate-300/50 dark:border-slate-600/30">
          <div className="flex-1 flex justify-center">
            <img
              src={isCollapsed ? '/icons/logo-collapsed.svg' : '/icons/logo-gif.gif'}
              alt="CCTV Logo"
              className={`
                object-contain transition-all duration-300
                ${isCollapsed ? 'w-10 h-10' : 'h-10'}
              `}
              style={{
                maxWidth: isCollapsed ? '40px' : '160px',
                height: '40px'
              }}
            />
          </div>

          {!isMobile && (
            <button
              onClick={toggleSidebar}
              className="
                absolute -right-4 top-1/2 transform -translate-y-1/2 
                w-6 h-6 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400 dark:hover:bg-slate-600
                rounded-full flex items-center justify-center 
                transition-all duration-300 shadow-lg border border-slate-400/50 dark:border-slate-500/50
                hover:scale-110
              "
              aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <svg className="w-3 h-3 text-slate-700 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isCollapsed ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
                )}
              </svg>
            </button>
          )}
        </header>

        <nav className="flex-1 overflow-y-auto py-4 sidebar-scrollbar">
          <div className="space-y-1">
            {filteredMenuItems.map((item) => (
              <div key={item.id} className={`${isCollapsed ? 'px-2' : 'px-4'}`}>
                <button
                  onClick={() => handleMenuClick(item)}
                  onMouseEnter={() => setHoveredItem(item.id)}
                  onMouseLeave={() => setHoveredItem(null)}
                  className={`
                    w-full flex items-center rounded-xl transition-all duration-200 group
                    ${isCollapsed ? 'px-3 py-3' : 'px-4 py-3'}
                    ${currentActivePage === item.id
                      ? 'bg-blue-100 dark:bg-white text-blue-600 shadow-lg transform scale-[0.98]'
                      : 'text-slate-600 dark:text-gray-300 hover:bg-slate-200/70 dark:hover:bg-white/50 hover:text-slate-800 dark:hover:text-black hover:transform hover:scale-[0.98]'
                    }
                  `}
                  title={isCollapsed ? item.label : ''}
                >
                  <div className="flex items-center flex-shrink-0">
                    <IconComponent 
                      IconComponent={item.icon}
                      className="w-5 h-5 flex-shrink-0"
                      isActive={currentActivePage === item.id}
                      isHovered={hoveredItem === item.id && currentActivePage !== item.id}
                    />
                  </div>

                  <div className={`
                    flex items-center justify-between flex-1 overflow-hidden
                    transition-all duration-200 ease-in-out
                    ${isCollapsed ? 'w-0 opacity-0 ml-0' : 'w-auto opacity-100 ml-3'}
                  `}>
                    <span className="text-sm font-medium whitespace-nowrap">
                      {item.label}
                    </span>
                    
                    {item.hasSubmenu && (
                      <svg 
                        className={`
                          w-4 h-4 transition-transform duration-200 flex-shrink-0
                          ${expandedMenus[item.id] ? 'rotate-90' : ''}
                        `}
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    )}
                  </div>
                </button>

                {!isCollapsed && item.hasSubmenu && expandedMenus[item.id] && (
                  <div className="mt-2 ml-8 space-y-1 animate-menu-expand">
                    {item.submenu.map((subItem) => (
                      <button
                        key={subItem.id}
                        onClick={() => handleSubmenuClick(item.id, subItem)}
                        onMouseEnter={() => setHoveredSubItem(subItem.id)}
                        onMouseLeave={() => setHoveredSubItem(null)}
                        className={`
                          w-full flex items-center px-4 py-2 rounded-lg 
                          text-sm transition-all duration-200 hover:transform hover:scale-[0.98]
                          ${currentActivePage === subItem.id
                            ? 'bg-blue-100 dark:bg-white text-blue-600'
                            : 'text-slate-500 dark:text-gray-400 hover:bg-slate-200/70 dark:hover:bg-white/50 hover:text-slate-800 dark:hover:text-black'
                          }
                        `}
                      >
                        <IconComponent 
                          IconComponent={subItem.icon}
                          className="w-4 h-4 flex-shrink-0" 
                          isActive={currentActivePage === subItem.id}
                          isHovered={hoveredSubItem === subItem.id && currentActivePage !== subItem.id}
                        />
                        <span className="whitespace-nowrap ml-3">{subItem.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </nav>

        <footer className="p-4 space-y-4">
          <button
            onClick={handleLogoutClick}
            className={`
              w-full flex items-center rounded-xl
              hover:bg-red-100 dark:hover:bg-red-600/20 text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 
              transition-all duration-200 group hover:transform hover:scale-[0.98]
              ${isCollapsed ? 'px-3 py-3 justify-center' : 'px-4 py-3'}
            `}
            title={isCollapsed ? 'Logout' : ''}
          >
            <div className={`flex items-center flex-shrink-0 transition-all duration-200 ease-in-out`}>
              <ArrowRightOnRectangleIcon className="w-5 h-5 flex-shrink-0" />
            </div>

            <div className={`
              flex items-center justify-between flex-1 overflow-hidden
              transition-all duration-200 ease-in-out
              ${isCollapsed ? 'w-0 opacity-0 ml-0' : 'w-auto opacity-100 ml-3'}
            `}>
              <span className="text-sm font-medium whitespace-nowrap">
                Logout
              </span>
            </div>
          </button>

          <div className={`border-t border-slate-300/50 dark:border-slate-600/30 pt-4 flex items-center
            ${isCollapsed ? 'justify-center' : 'px-2'}
          `}>
            <DefaultAvatar />
            <div className={`
              flex-1 min-w-0 overflow-hidden
              transition-all duration-200 ease-in-out
              ${isCollapsed ? 'w-0 opacity-0 ml-0' : 'w-auto opacity-100 ml-3'}
            `}>
              <p className="font-medium text-sm text-slate-800 dark:text-white truncate">
                {user.nama}
              </p>
              <p className="text-xs text-slate-500 dark:text-gray-400 capitalize truncate">
                {user.role === 'superadmin' ? 'Super Admin' : user.role}
              </p>
            </div>
          </div>
        </footer>
      </div>

      {isMobile && isCollapsed && (
        <button
          onClick={() => onToggle(false)}
          className="
            fixed top-4 left-4 z-sidebar-toggle w-10 h-10 
            bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-white rounded-xl 
            flex items-center justify-center 
            shadow-lg border border-slate-400/50 dark:border-slate-500/50 md:hidden
          "
          aria-label="Open sidebar"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      )}

      <ConfirmDialog
        isOpen={showLogoutDialog}
        onClose={handleCancelLogout}
        onConfirm={handleConfirmLogout}
        title="Konfirmasi Logout"
        message="Apakah Anda yakin untuk keluar ?"
        confirmText="Iya"
        cancelText="Tidak"
        type="warning"
        loading={isLoggingOut}
      />

      <ExportDataModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
      />
    </>
  );
};

export default Sidebar;