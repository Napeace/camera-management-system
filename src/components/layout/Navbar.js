import React from 'react';
import NotificationDropdown from '../../features/notification/NotificationDropdown';
import ThemeToggle from '../common/ThemeToggle';

const Navbar = ({ user, notifications = [], title, subtitle }) => {
  const getGreeting = () => {
    if (!user) return 'Selamat Datang';
    
    if (user.role === 'superadmin') {
      return 'Selamat Datang Admin RSCH';
    }
    
    return `Selamat Datang ${user.nama}`;
  };

  return (
    <nav className="px-6 py-4 relative">
      <div className="flex items-center justify-between">
        {/* Left side - Welcome Message */}
        <div className="flex items-center space-x-4">
          {/* Logo/Icon */}
          <div className="flex items-center space-x-3">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white transition-colors duration-300">
                {title || getGreeting()}
              </h1>
              <p className="text-slate-700 dark:text-gray-300 transition-colors duration-300">
                {subtitle || 'Monitoring CCTV Rumah Sakit Citra Husada'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <ThemeToggle />
          <NotificationDropdown notifications={notifications} />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;