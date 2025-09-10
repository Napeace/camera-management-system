import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom'; // Tambahkan useNavigate

// Icons (using simple emojis for now, could be replaced with react-icons later)
const icons = {
  dashboard: '📊',
  camera: '📹',
  users: '👥',
  history: '📚',
  settings: '⚙️',
  logout: '🚪',
  add: '➕',
  view: '👁️',
  edit: '✏️',
  delete: '🗑️',
  export: '📤',
  import: '📥',
  backup: '💾',
  menu: '☰',
  close: '✖️'
};

const Sidebar = ({ 
  user = { username: 'Admin', role: 'superadmin' }, 
  onLogout = () => {}, 
  activePage = 'dashboard', 
  onPageChange = () => {}, 
  onToggle = () => {},
  isCollapsed 
}) => {
  const location = useLocation();
  const navigate = useNavigate(); // Tambahkan useNavigate hook
  
  const [expandedMenus, setExpandedMenus] = useState({
    cctv: false,
    users: false,
    settings: false
  });

  const getCurrentActivePage = () => {
    const pathname = location.pathname;
    
    // Logika ini disederhanakan karena submenu user dihapus
    if (pathname === '/dashboard') return 'dashboard';
    if (pathname.startsWith('/users')) return 'users'; // <-- Tandai 'users' aktif jika path diawali /users
    if (pathname === '/cctv/view') return 'view-cctv';
    if (pathname === '/cctv/add') return 'add-cctv';
    if (pathname === '/cctv/update') return 'update-cctv';
    if (pathname === '/cctv/delete') return 'delete-cctv';
    if (pathname === '/history') return 'history';
    if (pathname === '/settings/export') return 'export-data';
    if (pathname === '/settings/import') return 'import-data';
    if (pathname === '/settings/backup') return 'backup-data';
    
    return activePage;
  };

  const currentActivePage = getCurrentActivePage();

  React.useEffect(() => {
    const pathname = location.pathname;
    // Hapus auto-expand untuk 'users' karena sudah tidak ada submenu
    if (pathname.startsWith('/cctv/')) {
      setExpandedMenus(prev => ({ ...prev, cctv: true }));
    } else if (pathname.startsWith('/settings/')) {
      setExpandedMenus(prev => ({ ...prev, settings: true }));
    }
  }, [location.pathname]);

  const shouldExpandMenu = (menuKey) => {
    return expandedMenus[menuKey];
  };

  const toggleMenu = (menuKey) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuKey]: !prev[menuKey]
    }));
  };

  const toggleSidebar = () => {
    onToggle(!isCollapsed);
  };

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: icons.dashboard,
      path: '/dashboard'
    },
    {
      id: 'cctv',
      label: 'Manajemen CCTV',
      icon: icons.camera,
      hasSubmenu: true,
      submenu: [
        { id: 'view-cctv', label: 'Lihat CCTV', icon: icons.view, path: '/cctv/view' },
        { id: 'add-cctv', label: 'Tambah CCTV', icon: icons.add, path: '/cctv/add' },
        { id: 'update-cctv', label: 'Update CCTV', icon: icons.edit, path: '/cctv/update' },
        { id: 'delete-cctv', label: 'Hapus CCTV', icon: icons.delete, path: '/cctv/delete' }
      ]
    },
    // #### PERUBAHAN DI SINI ####
    {
      id: 'users',
      label: 'Manajemen User',
      icon: icons.users,
      roleRequired: 'superadmin',
      path: '/users' // Tambahkan path agar jadi link langsung
      // Properti 'hasSubmenu' dan 'submenu' dihapus
    },
    // ###########################
    {
      id: 'history',
      label: 'History',
      icon: icons.history,
      path: '/history'
    },
    {
      id: 'settings',
      label: 'Setting',
      icon: icons.settings,
      hasSubmenu: true,
      submenu: [
        { id: 'export-data', label: 'Export Data', icon: icons.export, path: '/settings/export' },
        { id: 'import-data', label: 'Import Data', icon: icons.import, path: '/settings/import' },
        { id: 'backup-data', label: 'Backup Data', icon: icons.backup, path: '/settings/backup' }
      ]
    }
  ];

  const filteredMenuItems = menuItems.filter(item => {
    if (item.roleRequired && user.role !== item.roleRequired) {
      return false;
    }
    return true;
  });

  const handleMenuClick = (item) => {
    console.log('🔍 Sidebar: Menu clicked:', item); // Debug log

    if (isCollapsed) {
      onToggle(false); 
    }

    if (item.hasSubmenu) {
      toggleMenu(item.id);
    } else {
      // Gunakan navigate untuk routing langsung
      console.log('🔍 Sidebar: Navigating to:', item.path); // Debug log
      navigate(item.path);
      onPageChange(item.id, item.path); // Tetap panggil callback jika ada
    }
  };

  const handleSubmenuClick = (parentId, subItem) => {
    console.log('🔍 Sidebar: Submenu clicked:', subItem); // Debug log
    // Gunakan navigate untuk routing langsung
    navigate(subItem.path);
    onPageChange(subItem.id, subItem.path); // Tetap panggil callback jika ada
  };

  return (
    <div className={`bg-gray-800 text-white fixed left-0 top-0 h-screen transition-all duration-300 flex flex-col z-40 ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      {/* ... Sisa kode JSX di bawah ini tidak ada yang berubah ... */}
      <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} ${isCollapsed ? 'p-2' : 'p-4'} border-b border-gray-700 flex-shrink-0`}>
        {!isCollapsed && (
          <div className="flex items-center space-x-3 animate-fadeInFromLeft">
            <div className="bg-blue-600 w-8 h-8 rounded-lg flex items-center justify-center">
              <span className="text-lg">🏥</span>
            </div>
            <div>
              <h2 className="font-semibold text-sm">CCTV Management</h2>
              <p className="text-xs text-gray-400">Hospital Security</p>
            </div>
          </div>
        )}
        <button
          onClick={toggleSidebar}
          className={`${isCollapsed ? 'p-3' : 'p-2'} rounded-lg hover:bg-gray-700 transition-colors`}
        >
          <span className="text-lg">{isCollapsed ? icons.menu : icons.close}</span>
        </button>
      </div>

      {!isCollapsed && (
        <div className="p-4 border-b border-gray-700 flex-shrink-0 animate-fadeInFromLeft">
          <div className="flex items-center space-x-3">
            <div className="bg-green-600 w-10 h-10 rounded-full flex items-center justify-center">
              <span className="text-lg">👤</span>
            </div>
            <div>
              <p className="font-medium text-sm">{user.username}</p>
              <p className="text-xs text-gray-400">
                {user.role === 'superadmin' ? 'Super Admin' : 'Security'}
              </p>
            </div>
          </div>
        </div>
      )}

      <div 
        className="flex-1 overflow-y-auto"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: '#4B5563 #1F2937'
        }}
      >
        <style jsx>{`
          .flex-1.overflow-y-auto::-webkit-scrollbar {
            width: 6px;
          }
          .flex-1.overflow-y-auto::-webkit-scrollbar-track {
            background: #1F2937;
            border-radius: 3px;
          }
          .flex-1.overflow-y-auto::-webkit-scrollbar-thumb {
            background: #4B5563;
            border-radius: 3px;
          }
          .flex-1.overflow-y-auto::-webkit-scrollbar-thumb:hover {
            background: #6B7280;
          }

          @keyframes fadeInFromLeft {
            from {
              opacity: 0;
              transform: translateX(-20px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }

          @keyframes fadeOutToLeft {
            from {
              opacity: 1;
              transform: translateX(0);
            }
            to {
              opacity: 0;
              transform: translateX(-20px);
            }
          }

          .animate-fadeInFromLeft {
            animation: fadeInFromLeft 0.3s ease-out 0.2s both;
          }

          .animate-fadeOutToLeft {
            animation: fadeOutToLeft 0.2s ease-in both;
          }

          .expand-arrow {
            transition: transform 0.2s ease;
          }

          .expand-arrow.rotated {
            transform: rotate(90deg);
          }
        `}</style>
        <nav className={`${isCollapsed ? 'p-2' : 'p-4'} space-y-2`}>
          {filteredMenuItems.map((item) => (
            <div key={item.id}>
              <button
                onClick={() => handleMenuClick(item)}
                className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} ${isCollapsed ? 'p-2' : 'p-3'} rounded-lg transition-colors group relative ${
                  currentActivePage === item.id
                    ? 'bg-blue-600 text-white'
                    : 'hover:bg-gray-700 text-gray-300'
                }`}
                title={isCollapsed ? item.label : ''}
              >
                <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'}`}>
                  <span className="text-lg">{item.icon}</span>
                  {!isCollapsed && (
                    <span className="text-sm font-medium animate-fadeInFromLeft">{item.label}</span>
                  )}
                </div>
                
                {!isCollapsed && item.hasSubmenu && (
                  <span className={`text-sm text-gray-400 expand-arrow ${shouldExpandMenu(item.id) ? 'rotated' : ''}`}>
                    &gt;
                  </span>
                )}
              </button>

              {!isCollapsed && item.hasSubmenu && shouldExpandMenu(item.id) && (
                <div className="ml-4 mt-2 space-y-1 animate-fadeInFromLeft">
                  {item.submenu.map((subItem, index) => (
                    <button
                      key={subItem.id}
                      onClick={() => handleSubmenuClick(item.id, subItem)}
                      className={`w-full flex items-center space-x-3 p-2 rounded-lg text-sm transition-colors ${
                        currentActivePage === subItem.id
                          ? 'bg-blue-500 text-white'
                          : 'hover:bg-gray-700 text-gray-400'
                      }`}
                      style={{
                        animationDelay: `${0.1 + (index * 0.05)}s`
                      }}
                    >
                      <span className="text-base">{subItem.icon}</span>
                      <span>{subItem.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </div>

      <div className={`${isCollapsed ? 'p-2' : 'p-4'} border-t border-gray-700 flex-shrink-0`}>
        <button
          onClick={onLogout}
          className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'} ${isCollapsed ? 'p-3' : 'p-3'} rounded-lg hover:bg-red-600 transition-colors text-gray-300 hover:text-white`}
        >
          <span className="text-lg">{icons.logout}</span>
          {!isCollapsed && <span className="text-sm font-medium animate-fadeInFromLeft">Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;