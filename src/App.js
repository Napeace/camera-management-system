import React, { useState } from 'react';

// Icons (using simple emojis for now, could be replaced with react-icons later)
const icons = {
  dashboard: '📊',
  camera: '📹',
  users: '👥',
  history: '📚',
  settings: '⚙️',
  notification: '🔔',
  logout: '🚪',
  add: '➕',
  view: '👁️',
  edit: '✏️',
  delete: '🗑️',
  export: '📤',
  import: '📥',
  backup: '💾',
  menu: '☰',
  close: '✖️',
  chevronDown: '⌄',
  chevronRight: '▶'
};

const Sidebar = ({ user, onLogout, activePage, onPageChange }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState({
    cctv: false,
    users: false,
    settings: false
  });

  const toggleMenu = (menuKey) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuKey]: !prev[menuKey]
    }));
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
    {
      id: 'users',
      label: 'Manajemen Pengguna',
      icon: icons.users,
      hasSubmenu: true,
      roleRequired: 'superadmin',
      submenu: [
        { id: 'add-user', label: 'Tambah Pengguna', icon: icons.add, path: '/users/add' },
        { id: 'view-users', label: 'Lihat Pengguna', icon: icons.view, path: '/users/view' },
        { id: 'update-user', label: 'Update Pengguna', icon: icons.edit, path: '/users/update' },
        { id: 'delete-user', label: 'Hapus Pengguna', icon: icons.delete, path: '/users/delete' }
      ]
    },
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

  // Filter menu berdasarkan role
  const filteredMenuItems = menuItems.filter(item => {
    if (item.roleRequired && user.role !== item.roleRequired) {
      return false;
    }
    return true;
  });

  const handleMenuClick = (item) => {
    if (item.hasSubmenu) {
      toggleMenu(item.id);
    } else {
      onPageChange(item.id, item.path);
    }
  };

  const handleSubmenuClick = (parentId, subItem) => {
    onPageChange(subItem.id, subItem.path);
  };

  return (
    <div className={`bg-gray-800 text-white h-screen transition-all duration-300 flex flex-col ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      {/* Sidebar Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        {!isCollapsed && (
          <div className="flex items-center space-x-3">
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
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
        >
          <span className="text-lg">{isCollapsed ? icons.menu : icons.close}</span>
        </button>
      </div>

      {/* User Info */}
      {!isCollapsed && (
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="bg-green-600 w-10 h-10 rounded-full flex items-center justify-center">
              <span className="text-lg">👤</span>
            </div>
            <div>
              <p className="font-medium text-sm">{user.username}</p>
              <p className="text-xs text-gray-400">
                {user.role === 'superadmin' ? '🔧 Super Admin' : '🔒 Security'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Menu */}
      <nav className="flex-1 p-4 space-y-2">
        {filteredMenuItems.map((item) => (
          <div key={item.id}>
            {/* Main Menu Item */}
            <button
              onClick={() => handleMenuClick(item)}
              className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors group ${
                activePage === item.id
                  ? 'bg-blue-600 text-white'
                  : 'hover:bg-gray-700 text-gray-300'
              }`}
            >
              <div className="flex items-center space-x-3">
                <span className="text-lg">{item.icon}</span>
                {!isCollapsed && (
                  <span className="text-sm font-medium">{item.label}</span>
                )}
              </div>
              
              {!isCollapsed && item.hasSubmenu && (
                <span className="text-sm">
                  {expandedMenus[item.id] ? icons.chevronDown : icons.chevronRight}
                </span>
              )}
            </button>

            {/* Submenu */}
            {!isCollapsed && item.hasSubmenu && expandedMenus[item.id] && (
              <div className="ml-4 mt-2 space-y-1">
                {item.submenu.map((subItem) => (
                  <button
                    key={subItem.id}
                    onClick={() => handleSubmenuClick(item.id, subItem)}
                    className={`w-full flex items-center space-x-3 p-2 rounded-lg text-sm transition-colors ${
                      activePage === subItem.id
                        ? 'bg-blue-500 text-white'
                        : 'hover:bg-gray-700 text-gray-400'
                    }`}
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

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-700">
        <button
          onClick={onLogout}
          className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-red-600 transition-colors text-gray-300 hover:text-white"
        >
          <span className="text-lg">{icons.logout}</span>
          {!isCollapsed && <span className="text-sm font-medium">Logout</span>}
        </button>
      </div>
    </div>
  );
};

// Navbar Component with Notifications
const Navbar = ({ user, notifications = [] }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  
  // Mock notifications for demo
  const mockNotifications = [
    { id: 1, message: 'Camera ICU-001 is offline', type: 'error', time: '2 min ago' },
    { id: 2, message: 'Camera ER-002 connection restored', type: 'success', time: '5 min ago' },
    { id: 3, message: 'Backup completed successfully', type: 'info', time: '1 hour ago' }
  ];

  const currentNotifications = notifications.length > 0 ? notifications : mockNotifications;
  const unreadCount = currentNotifications.filter(n => !n.read).length;

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Page Title */}
        <div>
          <h1 className="text-xl font-semibold text-gray-800">
            CCTV Management Dashboard
          </h1>
          <p className="text-sm text-gray-600">Monitor and manage security cameras</p>
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <span className="text-2xl">{icons.notification}</span>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notification Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
              <div className="p-4 border-b border-gray-200">
                <h3 className="font-semibold text-gray-800">Notifications</h3>
                <p className="text-sm text-gray-600">{unreadCount} new notifications</p>
              </div>
              
              <div className="max-h-64 overflow-y-auto">
                {currentNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 border-b border-gray-100 hover:bg-gray-50 ${
                      !notification.read ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <span className={`text-lg ${
                        notification.type === 'error' ? '🔴' :
                        notification.type === 'success' ? '🟢' : '🔵'
                      }`}></span>
                      <div className="flex-1">
                        <p className="text-sm text-gray-800">{notification.message}</p>
                        <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="p-4 border-t border-gray-200">
                <button className="w-full text-center text-sm text-blue-600 hover:text-blue-700">
                  Mark all as read
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

// Main Layout Component
const MainLayout = ({ children, user, onLogout }) => {
  const [activePage, setActivePage] = useState('dashboard');

  const handlePageChange = (pageId, path) => {
    setActivePage(pageId);
    // Here you would typically handle routing
    console.log(`Navigating to: ${pageId} (${path})`);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar
        user={user}
        onLogout={onLogout}
        activePage={activePage}
        onPageChange={handlePageChange}
      />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Navbar */}
        <Navbar user={user} />
        
        {/* Page Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

// Demo Dashboard Content
const DashboardContent = () => {
  const stats = [
    { label: 'Total Cameras', value: '24', icon: '📹', color: 'blue' },
    { label: 'Online', value: '22', icon: '🟢', color: 'green' },
    { label: 'Offline', value: '2', icon: '🔴', color: 'red' },
    { label: 'Alerts', value: '3', icon: '⚠️', color: 'yellow' }
  ];

  const recentActivity = [
    { action: 'Camera added', location: 'ICU Room 205', time: '10 minutes ago' },
    { action: 'User logged in', user: 'security_01', time: '15 minutes ago' },
    { action: 'Backup completed', status: 'Success', time: '1 hour ago' }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Welcome to CCTV Management System</h2>
        <p className="text-blue-100">Monitor and manage your hospital security infrastructure</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                <p className="text-sm text-gray-600">{stat.label}</p>
              </div>
              <div className={`text-3xl`}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
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

// Demo App Component
const App = () => {
  const [user] = useState({
    username: 'admin',
    role: 'superadmin' // or 'security'
  });

  const handleLogout = () => {
    alert('Logout clicked! (Demo)');
  };

  return (
    <MainLayout user={user} onLogout={handleLogout}>
      <DashboardContent />
    </MainLayout>
  );
};

export default App;