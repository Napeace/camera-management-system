import React, { useState, useEffect, useRef } from 'react';

const Navbar = ({ user, notifications = [] }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationList, setNotificationList] = useState([]);
  const dropdownRef = useRef(null);
  
  // Mock notifications DIPINDAH KE LUAR KOMPONEN atau di useMemo/useState
  const mockNotifications = [
    { id: 1, message: 'Camera ICU-001 is offline', type: 'error', time: '2 min ago', read: false },
    { id: 2, message: 'Camera ER-002 connection restored', type: 'success', time: '5 min ago', read: false },
    { id: 3, message: 'Backup completed successfully', type: 'info', time: '1 hour ago', read: false },
    { id: 4, message: 'Camera OR-003 motion detected', type: 'warning', time: '3 hours ago', read: true },
    { id: 5, message: 'System maintenance scheduled', type: 'info', time: '1 day ago', read: true }
  ];

  // SOLUSI 1: Initialize dengan useState langsung
  useEffect(() => {
    if (notifications.length > 0) {
      setNotificationList(notifications);
    } else {
      setNotificationList(mockNotifications);
    }
  }, []); // ← Dependency array kosong, hanya run sekali

  // SOLUSI 2: Update hanya ketika notifications dari props berubah
  useEffect(() => {
    if (notifications.length > 0) {
      setNotificationList(notifications);
    }
  }, [notifications]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications]);

  const unreadCount = notificationList.filter(n => !n.read).length;

  const handleMarkAllRead = () => {
    setNotificationList(prevNotifications => 
      prevNotifications.map(notification => ({ ...notification, read: true }))
    );
    setShowNotifications(false);
  };

  const handleNotificationClick = (notificationId) => {
    setNotificationList(prevNotifications =>
      prevNotifications.map(notification =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const getNotificationIcon = (type) => {
    switch(type) {
      case 'error':
        return '🔴';
      case 'success':
        return '🟢';
      case 'warning':
        return '🟡';
      case 'info':
      default:
        return '🔵';
    }
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 px-6 py-4 relative">
      <div className="flex items-center justify-between">
        {/* Page Title */}
        <div>
          <h1 className="text-xl font-semibold text-gray-800">
            Camera Management System
          </h1>
          <p className="text-sm text-gray-600">Monitor and manage security cameras</p>
        </div>

        {/* Right Side - Notifications Only */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={toggleNotifications}
              className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            >
              {/* Bell Icon */}
              <svg 
                className="w-6 h-6 text-gray-600" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
              
              {/* Notification Badge */}
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center px-1 font-medium animate-pulse">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 animate-slideDown">
                {/* Header */}
                <div className="p-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-800">Notifications</h3>
                    <span className="text-sm text-gray-600">
                      {unreadCount > 0 ? `${unreadCount} new` : 'All read'}
                    </span>
                  </div>
                </div>
                
                {/* Notification List */}
                <div className="max-h-80 overflow-y-auto">
                  {notificationList.length > 0 ? (
                    notificationList.map((notification) => (
                      <div
                        key={notification.id}
                        onClick={() => handleNotificationClick(notification.id)}
                        className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors duration-150 ${
                          !notification.read ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <span className="text-lg flex-shrink-0 mt-0.5">
                            {getNotificationIcon(notification.type)}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm text-gray-800 ${!notification.read ? 'font-medium' : ''}`}>
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                          </div>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-6 text-center text-gray-500">
                      <svg className="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                      </svg>
                      <p>No notifications</p>
                    </div>
                  )}
                </div>
                
                {/* Footer */}
                {notificationList.length > 0 && unreadCount > 0 && (
                  <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
                    <button 
                      onClick={handleMarkAllRead}
                      className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors duration-150"
                    >
                      Mark all as read
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slideDown {
          animation: slideDown 0.2s ease-out;
        }
      `}</style>
    </nav>
  );
};

export default Navbar;