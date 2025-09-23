import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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

  // Check if mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // ✅ Updated: Get current active page from real location
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

  // ✅ Updated: Auto expand backup menu if on backup pages
  useEffect(() => {
    const pathname = location.pathname;
    if (pathname.startsWith('/backup/')) {
      setExpandedMenus(prev => ({ ...prev, backup: true }));
    }
  }, [location.pathname]);

  // Toggle menu functions
  const toggleMenu = (menuKey) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuKey]: !prev[menuKey]
    }));
  };

  const toggleSidebar = () => {
    onToggle(!isCollapsed);
  };

  // Menu configuration dengan Heroicons
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
      hasSubmenu: true,
      submenu: [
        { id: 'export-data', label: 'Export Data', icon: ArrowDownTrayIcon, path: '/backup/export' },
        { id: 'import-data', label: 'Import Data', icon: ArrowUpTrayIcon, path: '/backup/import' }
      ]
    }
  ];

  // Filter menu items based on user role
  const filteredMenuItems = menuItems.filter(item => 
    !item.roleRequired || user.role === item.roleRequired
  );

  // State untuk tracking hover pada menu items
  const [hoveredItem, setHoveredItem] = useState(null);
  const [hoveredSubItem, setHoveredSubItem] = useState(null);

  // ✅ Updated: Handle menu clicks with real navigation
  const handleMenuClick = (item) => {
    console.log('Menu clicked:', item);

    if (isCollapsed && !isMobile) {
      onToggle(false); 
    }

    if (item.hasSubmenu) {
      toggleMenu(item.id);
    } else {
      console.log('Navigating to:', item.path);
      navigate(item.path); // ✅ Real navigation
      onPageChange(item.id, item.path);
      
      // Auto close sidebar on mobile after navigation
      if (isMobile && !isCollapsed) {
        onToggle(true);
      }
    }
  };

  // ✅ Updated: Handle submenu clicks with real navigation
  const handleSubmenuClick = (parentId, subItem) => {
    console.log('Submenu clicked:', subItem);
    navigate(subItem.path); // ✅ Real navigation
    onPageChange(subItem.id, subItem.path);
    
    // Auto close sidebar on mobile after navigation
    if (isMobile && !isCollapsed) {
      onToggle(true);
    }
  };

  // Components
  const DefaultAvatar = ({ size = 'w-8 h-8' }) => (
    <div className={`${size} rounded-full bg-gray-500 flex items-center justify-center flex-shrink-0`}>
      <svg 
        className={`${size === 'w-8 h-8' ? 'w-5 h-5' : 'w-4 h-4'} text-gray-200`} 
        fill="currentColor" 
        viewBox="0 0 20 20"
      >
        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
      </svg>
    </div>
  );

  // Heroicons Component - much simpler!
  const IconComponent = ({ IconComponent: Icon, className = "w-5 h-5", isActive = false, isHovered = false }) => {
    // Determine color class based on state
    const getColorClass = () => {
      if (isActive) return 'text-blue-600';
      if (isHovered) return 'text-black';
      return 'text-white'; // default white
    };

    return (
      <Icon 
        className={`${className} transition-all duration-200 ${getColorClass()}`}
      />
    );
  };

  // Dynamic width calculation for floating sidebar
  const sidebarWidth = () => {
    if (isMobile) {
      return isCollapsed ? 'w-0' : 'w-sidebar-expanded';
    }
    return isCollapsed ? 'w-sidebar-collapsed' : 'w-sidebar-expanded';
  };

  return (
    <>
      {/* Mobile overlay */}
      {isMobile && !isCollapsed && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-sidebar-overlay md:hidden"
          onClick={() => onToggle(true)}
        />
      )}

      {/* Floating Sidebar */}
      <div className={`
        fixed left-2 top-2 bottom-2 z-sidebar
        transition-all duration-500 ease-in-out flex flex-col
        bg-slate-800 text-white rounded-xl shadow-floating
        ${sidebarWidth()}
        ${isMobile && isCollapsed ? '-translate-x-full' : 'translate-x-0'}
        border border-slate-600/30
      `}>

        {/* Header Section */}
        <header className="flex items-center justify-center p-6 relative border-b border-slate-600/30">
          <div className="flex-1 flex justify-center">
            <img
              src={isCollapsed ? '/icons/logo-collapsed.svg' : '/icons/logo.svg'}
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

          {/* Toggle Button - positioned outside sidebar */}
          {!isMobile && (
            <button
              onClick={toggleSidebar}
              className="
                absolute -right-4 top-1/2 transform -translate-y-1/2 
                w-6 h-6 bg-slate-700 hover:bg-slate-600
                rounded-full flex items-center justify-center 
                transition-all duration-300 shadow-lg border border-slate-500/50
                hover:scale-110
              "
              aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isCollapsed ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
                )}
              </svg>
            </button>
          )}
        </header>

        {/* Navigation Menu */}
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
                      ? 'bg-white text-blue-600 shadow-lg transform scale-[0.98]' // Active state: background putih, text biru
                      : 'text-gray-300 hover:bg-white/50 hover:text-black hover:transform hover:scale-[0.98]' // Hover: background putih transparan, text hitam
                    }
                  `}
                  title={isCollapsed ? item.label : ''}
                >
                  {/* Icon container - tetap di kiri */}
                  <div className="flex items-center flex-shrink-0">
                    <IconComponent 
                      IconComponent={item.icon}
                      className="w-5 h-5 flex-shrink-0"
                      isActive={currentActivePage === item.id}
                      isHovered={hoveredItem === item.id && currentActivePage !== item.id}
                    />
                  </div>

                  {/* Text dan arrow container */}
                  <div className={`
                    flex items-center justify-between flex-1 overflow-hidden
                    transition-all duration-200 ease-in-out
                    ${isCollapsed ? 'w-0 opacity-0 ml-0' : 'w-auto opacity-100 ml-3'}
                  `}>
                    <span className="text-sm font-medium whitespace-nowrap">
                      {item.label}
                    </span>
                    
                    {/* Arrow untuk submenu */}
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

                {/* Submenu - hanya muncul jika tidak collapsed */}
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
                            ? 'bg-white text-blue-600' // Active submenu: background putih, text biru
                            : 'text-gray-400 hover:bg-white/50 hover:text-black' // Hover submenu: background putih transparan, text hitam
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

        {/* Footer Section */}
        <footer className="p-4 space-y-4">
          {/* Logout Button */}
          <button
            onClick={onLogout}
            className={`
              w-full flex items-center rounded-xl
              hover:bg-red-600/20 text-red-400 hover:text-red-300 
              transition-all duration-200 group hover:transform hover:scale-[0.98]
              ${isCollapsed ? 'px-3 py-3 justify-center' : 'px-4 py-3'}
            `}
            title={isCollapsed ? 'Logout' : ''}
          >
            {/* Icon container - animasi dari kiri ke tengah */}
            <div className={`flex items-center flex-shrink-0 transition-all duration-200 ease-in-out`}>
              <ArrowRightOnRectangleIcon className="w-5 h-5 flex-shrink-0 text-red-400" />
            </div>

            {/* Text container dengan animasi smooth */}
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

          {/* User Profile */}
          <div className={`border-t border-slate-600/30 pt-4 flex items-center
            ${isCollapsed ? 'justify-center' : 'px-2'}
          `}>
            <DefaultAvatar />
            <div className={`
              flex-1 min-w-0 overflow-hidden
              transition-all duration-200 ease-in-out
              ${isCollapsed ? 'w-0 opacity-0 ml-0' : 'w-auto opacity-100 ml-3'}
            `}>
              <p className="font-medium text-sm text-white truncate">
                {user.nama}
              </p>
              <p className="text-xs text-gray-400 capitalize truncate">
                {user.role === 'superadmin' ? 'Super Admin' : user.role}
              </p>
            </div>
          </div>
        </footer>
      </div>

      {/* Mobile toggle button */}
      {isMobile && isCollapsed && (
        <button
          onClick={() => onToggle(false)}
          className="
            fixed top-4 left-4 z-sidebar-toggle w-10 h-10 
            bg-slate-800 text-white rounded-xl 
            flex items-center justify-center 
            shadow-lg border border-slate-500/50 md:hidden
          "
          aria-label="Open sidebar"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      )}
    </>
  );
};

export default Sidebar;