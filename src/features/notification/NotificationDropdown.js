import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { SignalSlashIcon, BellIcon } from '@heroicons/react/24/outline';

const NotificationItem = ({ notification, onNotificationClick, getNotificationIcon }) => {
  const handleClick = () => {
    onNotificationClick(notification.id);
  };

  return (
    <div
      onClick={handleClick}
      className="p-4 border-b-2 dark:border-b-[#0A1537] hover:bg-slate-100/80 dark:hover:bg-slate-700/60 cursor-pointer transition-colors duration-150 relative z-10 bg-white/50 dark:bg-transparent"
    >
      <div className="flex items-start space-x-3">
        <span className="text-lg flex-shrink-0 mt-0.5">
          {getNotificationIcon(notification.type)}
        </span>
        <div className="flex-1 min-w-0">
          <p className={`text-sm text-slate-800 dark:text-gray-200 ${!notification.read ? 'font-medium' : ''}`}>
            {notification.message}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{notification.time}</p>
        </div>
        {!notification.read && (
          <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0 mt-2"></div>
        )}
      </div>
    </div>
  );
};

const NotificationDropdown = ({ notifications = [] }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 });
  const buttonRef = useRef(null);
  
  // Default static notifications if none provided
  const defaultNotifications = [
    {
      id: 1,
      type: 'camera',
      message: 'Kamera [Lokasi A] telah Offline',
      subtitle: 'Harap cek ke lokasi lalu tambahkan ke catatan',
      time: '2 detik lalu',
      read: false
    },
    {
      id: 2,
      type: 'camera',
      message: 'Kamera [Lokasi B] telah Offline',
      subtitle: 'Harap cek ke lokasi lalu tambahkan ke catatan',
      time: '5 menit lalu',
      read: false
    },
    {
      id: 3,
      type: 'camera',
      message: 'Kamera [Lokasi C] telah Offline',
      subtitle: 'Harap cek ke lokasi lalu tambahkan ke catatan',
      time: '10 menit lalu',
      read: false
    },
    {
      id: 4,
      type: 'camera',
      message: 'Kamera [Lokasi D] telah Offline',
      subtitle: 'Harap cek ke lokasi lalu tambahkan ke catatan',
      time: '15 menit lalu',
      read: false
    },
    {
      id: 5,
      type: 'camera',
      message: 'Kamera [Lokasi E] telah Offline',
      subtitle: 'Harap cek ke lokasi lalu tambahkan ke catatan',
      time: '20 menit lalu',
      read: true
    },
    {
      id: 6,
      type: 'camera',
      message: 'Kamera [Lokasi F] telah Offline',
      subtitle: 'Harap cek ke lokasi lalu tambahkan ke catatan',
      time: '25 menit lalu',
      read: true
    },
    {
      id: 7,
      type: 'camera',
      message: 'Kamera [Lokasi G] telah Offline',
      subtitle: 'Harap cek ke lokasi lalu tambahkan ke catatan',
      time: '30 menit lalu',
      read: true
    }
  ];
  
  const [notificationList, setNotificationList] = useState(
    notifications.length > 0 ? notifications : defaultNotifications
  );
  
  useEffect(() => {
    if (notifications.length > 0) {
      setNotificationList(notifications);
    }
  }, [notifications]);
  
  const unreadCount = notificationList.filter(n => !n.read).length;
  
  const markAsRead = (id) => {
    setNotificationList(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };
  
  const getNotificationIcon = (type) => {
    switch(type) {
      case 'camera':
        return (
          <div className="w-10 h-10 rounded-lg flex items-center justify-center">
            <SignalSlashIcon className="w-6 h-6 text-red-500 dark:text-red-400" />
          </div>
        );
      default:
        return (
          <div className="w-10 h-10 rounded-lg bg-blue-500/20 dark:bg-blue-500/30 flex items-center justify-center">
            <svg className="w-6 h-6 text-blue-500 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
    }
  };

  // Update dropdown position when opened and on scroll/resize
  useEffect(() => {
    const updatePosition = (event) => {
      const dropdownElement = document.getElementById('notification-dropdown-portal');
      if (dropdownElement && dropdownElement.contains(event?.target)) {
        return;
      }

      if (showNotifications && buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        setDropdownPosition({
          top: rect.bottom + 8,
          right: window.innerWidth - rect.right - 15
        });
      }
    };

    updatePosition();

    if (showNotifications) {
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
    }

    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [showNotifications]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (buttonRef.current && !buttonRef.current.contains(event.target)) {
        const dropdownElement = document.getElementById('notification-dropdown-portal');
        if (dropdownElement && !dropdownElement.contains(event.target)) {
          setShowNotifications(false);
        }
      }
    };

    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications]);

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  const handleNotificationClick = (notificationId) => {
    markAsRead(notificationId);
  };

  const DropdownPortal = () => {
    if (!showNotifications) return null;

    return createPortal(
      <div 
        id="notification-dropdown-portal"
        className="fixed shadow-2xl overflow-hidden flex flex-col border border-slate-200 dark:border-blue-700 bg-white dark:bg-[#0A1537]"
        style={{
          top: `${dropdownPosition.top}px`,
          right: `${dropdownPosition.right}px`,
          zIndex: 999999,
          width: '360px',
          height: '410.36px',
          minHeight: '490.91px',
          borderRadius: '6.55px',
          borderWidth: '0.82px',
          backgroundImage: "url('/icons/Subtract.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'right bottom',
          backgroundPositionY: 'calc(100% + 70px)',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* Header - No Background Image */}
        <div className="p-3 bg-slate-100/70 dark:bg-[#091230]">
          <h3 className="font-semibold text-slate-900 dark:text-white text-center text-lg">
            Notifikasi
          </h3>
        </div>

        {/* Content and Footer Wrapper */}
        <div className="flex-1 overflow-hidden flex flex-col relative">
          {/* Notification List */}
          <div 
            className="flex-1 overflow-y-auto"
            style={{
              maxHeight: '400px'
            }}
          >
            {notificationList.length > 0 ? (
              notificationList.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onNotificationClick={handleNotificationClick}
                  getNotificationIcon={getNotificationIcon}
                />
              ))
            ) : (
              <div className="p-8 text-center flex flex-col justify-center items-center h-full">
                <svg className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <p className="text-gray-500 dark:text-gray-400 text-sm">No notifications</p>
              </div>
            )}
          </div>
          
          {/* Footer */}
          <div className="px-3 py-2 border-t border-slate-200 dark:border-slate-700/50 bg-slate-100/70 dark:bg-[#0B1739]/40">
            <p className="flex items-center justify-center text-xs text-slate-600 dark:text-gray-500 font-medium tracking-wide">
              CAMERA MANAGEMENT SYSTEM RS. CITRA HUSADA
            </p>
          </div>
        </div>
      </div>,
      document.body
    );
  };

  return (
    <>
      <div className="relative">
        <button
          ref={buttonRef}
          onClick={toggleNotifications}
          className="relative px-4 py-2 bg-slate-200/90 dark:bg-slate-700/70 hover:bg-slate-300/90 dark:hover:bg-slate-600/80 text-green-600 dark:text-green-400 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 flex items-center space-x-2 border border-slate-400/30 dark:border-slate-600/30 backdrop-blur-sm"
        >
          <span className="text-sm font-medium text-green-600 dark:text-green-400">Notifikasi</span>
          
          <BellIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
  
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 font-medium animate-pulse shadow-lg">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>
      </div>

      <DropdownPortal />
    </>
  );
};

export default NotificationDropdown;