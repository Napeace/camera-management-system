import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import NotificationItem from './NotificationItem';
import useNotification from '../../hooks/useNotification';

const NotificationDropdown = ({ notifications = [] }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef(null);
  
  const {
    notificationList,
    unreadCount,
    markAllAsRead,
    markAsRead,
    getNotificationIcon
  } = useNotification(notifications);

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

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  const handleMarkAllRead = () => {
    markAllAsRead();
    setShowNotifications(false);
  };

  const handleNotificationClick = (notificationId) => {
    markAsRead(notificationId);
  };

  // Notification Dropdown Portal
  const DropdownPortal = () => {
    if (!showNotifications) return null;

    return createPortal(
      <div 
        className="fixed right-6 top-20 w-96 bg-white dark:bg-slate-700 rounded-lg shadow-xl border border-gray-200 dark:border-slate-600 z-notification animate-slideDown"
        style={{ zIndex: 999999 }}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-800 rounded-t-lg">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-900 dark:text-white">Notifications</h3>
            <span className="text-sm text-gray-600 dark:text-gray-300">
              {unreadCount > 0 ? `${unreadCount} new` : 'All read'}
            </span>
          </div>
        </div>
        
        {/* Notification List */}
        <div className="max-h-80 overflow-y-auto sidebar-scrollbar">
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
            <div className="p-6 text-center text-gray-500 dark:text-gray-400">
              <svg className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <p>No notifications</p>
            </div>
          )}
        </div>
        
        {/* Footer */}
        {notificationList.length > 0 && unreadCount > 0 && (
          <div className="p-4 border-t border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-800 rounded-b-lg">
            <button 
              onClick={handleMarkAllRead}
              className="w-full text-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium transition-colors duration-150"
            >
              Mark all as read
            </button>
          </div>
        )}
      </div>,
      document.body
    );
  };

  return (
    <>
      {/* Notification Button */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={toggleNotifications}
          className="relative px-4 py-2 bg-slate-200/90 dark:bg-slate-700/70 hover:bg-slate-300/90 dark:hover:bg-slate-600/80 text-green-600 dark:text-green-400 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 flex items-center space-x-2 border border-slate-400/30 dark:border-slate-600/30 backdrop-blur-sm"
        >
          <span className="text-sm font-medium text-green-600 dark:text-green-400">Notification</span>
          
          {/* Bell Icon */}
          <svg 
            className="w-5 h-5 text-green-600 dark:text-green-400" 
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
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 font-medium animate-pulse">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Dropdown Portal */}
      <DropdownPortal />
    </>
  );
};

export default NotificationDropdown;