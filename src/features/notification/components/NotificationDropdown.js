// src/features/notification/components/NotificationDropdown.js
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { BellIcon } from '@heroicons/react/24/outline';
import NotificationItem from './NotificationItem';
import notificationService from '../../../services/notificationService';

const NotificationDropdown = () => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 });
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [markingAllRead, setMarkingAllRead] = useState(false);
  const [error, setError] = useState(null);
  const buttonRef = useRef(null);
  const dropdownRef = useRef(null);
  
  // Fetch notifications dari backend
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await notificationService.getNotifications();
      
      // Response structure: { message, data: [...] }
      if (response && response.data) {
        setNotifications(response.data);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Gagal memuat notifikasi');
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch saat component mount
  useEffect(() => {
    fetchNotifications();
  }, []);

  // Auto-refresh setiap 40 detik
  useEffect(() => {
    const interval = setInterval(() => {
      fetchNotifications();
    }, 40000); // 40 detik

    return () => clearInterval(interval);
  }, []);

  // Handle delete notification
  const handleNotificationDelete = (notificationId) => {
    // Optimistic UI update - hapus dari list langsung
    setNotifications(prev => 
      prev.filter(n => n.id_notification !== notificationId)
    );
    
    setShowNotifications(false);
  };

  // Handle mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      setMarkingAllRead(true);
      await notificationService.markAllAsRead();
      
      // Clear semua notifikasi dari UI
      setNotifications([]);
      
      // Optional: tutup dropdown setelah mark all
      // setShowNotifications(false);
    } catch (err) {
      console.error('Error marking all as read:', err);
      setError('Gagal menandai semua sebagai dibaca');
      
      // Refresh notifikasi jika gagal
      fetchNotifications();
    } finally {
      setMarkingAllRead(false);
    }
  };

  // Jumlah notifikasi (semua notifikasi dianggap unread sampai di-delete)
  const unreadCount = notifications.length;

  // Calculate position only once when opening - FIX: Hapus scroll listener
  useEffect(() => {
    if (!showNotifications || !buttonRef.current) return;

    const rect = buttonRef.current.getBoundingClientRect();
    setDropdownPosition({
      top: rect.bottom + 8,
      right: window.innerWidth - rect.right - 15
    });
  }, [showNotifications]);

  // Auto-close dropdown saat window resize (maximize/restore down)
  useEffect(() => {
    if (!showNotifications) return;

    let resizeTimer;
    const handleWindowResize = () => {
      // Clear timer sebelumnya
      clearTimeout(resizeTimer);
      
      // Set timer baru - tutup dropdown setelah resize berhenti
      resizeTimer = setTimeout(() => {
        setShowNotifications(false);
      }, 100); // Delay 100ms untuk avoid close saat resize smooth
    };

    window.addEventListener('resize', handleWindowResize);

    return () => {
      clearTimeout(resizeTimer);
      window.removeEventListener('resize', handleWindowResize);
    };
  }, [showNotifications]);

  // Auto-close dropdown saat halaman di-scroll
  useEffect(() => {
    if (!showNotifications) return;

    const handlePageScroll = (event) => {
      // Cek apakah scroll berasal dari window/document, bukan dari dalam dropdown
      const dropdown = document.getElementById('notification-dropdown-portal');
      if (dropdown && dropdown.contains(event.target)) {
        // Scroll dari dalam dropdown, jangan tutup
        return;
      }
      
      // Scroll dari halaman, tutup dropdown
      setShowNotifications(false);
    };

    // Pakai capture phase (true) untuk detect scroll lebih awal
    window.addEventListener('scroll', handlePageScroll, true);

    return () => {
      window.removeEventListener('scroll', handlePageScroll, true);
    };
  }, [showNotifications]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (buttonRef.current && !buttonRef.current.contains(event.target)) {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
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
    
    // Refresh notifications saat dropdown dibuka
    if (!showNotifications) {
      fetchNotifications();
    }
  };

  const DropdownPortal = () => {
    if (!showNotifications) return null;

    return createPortal(
      <div 
        ref={dropdownRef}
        id="notification-dropdown-portal"
        className="fixed shadow-2xl flex flex-col border border-slate-200 dark:border-blue-700 bg-white dark:bg-[#0A1537]"
        style={{
          top: `${dropdownPosition.top}px`,
          right: `${dropdownPosition.right}px`,
          zIndex: 999999,
          width: '360px',
          maxHeight: '490px',
          borderRadius: '6.55px',
          borderWidth: '0.82px',
          backgroundImage: "url('/icons/Subtract.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'right bottom',
          backgroundPositionY: 'calc(100% + 70px)',
          backgroundRepeat: 'no-repeat'
        }}
        onWheel={(e) => {
          // Prevent scroll event bubbling to window
          e.stopPropagation();
        }}
      >
        {/* Header */}
        <div className="p-3 bg-slate-100/70 dark:bg-[#091230] flex-shrink-0">
          <h3 className="font-semibold text-slate-900 dark:text-white text-center text-lg">
            Notifikasi
          </h3>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col relative min-h-0">
          {/* Notification List */}
          <div 
            className="flex-1 overflow-y-auto overflow-x-hidden"
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: '#94a3b8 transparent'
            }}
            onScroll={(e) => {
              // Prevent scroll event bubbling
              e.stopPropagation();
            }}
          >
            <style>{`
              #notification-dropdown-portal .flex-1.overflow-y-auto::-webkit-scrollbar {
                width: 6px;
              }
              #notification-dropdown-portal .flex-1.overflow-y-auto::-webkit-scrollbar-track {
                background: transparent;
              }
              #notification-dropdown-portal .flex-1.overflow-y-auto::-webkit-scrollbar-thumb {
                background: #94a3b8;
                border-radius: 3px;
              }
              #notification-dropdown-portal .flex-1.overflow-y-auto::-webkit-scrollbar-thumb:hover {
                background: #64748b;
              }
            `}</style>

            {loading ? (
              // Loading state
              <div className="p-8 text-center flex flex-col justify-center items-center h-full min-h-[300px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-3"></div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Memuat notifikasi...</p>
              </div>
            ) : error ? (
              // Error state
              <div className="p-8 text-center flex flex-col justify-center items-center h-full min-h-[300px]">
                <svg className="w-12 h-12 mx-auto text-red-400 dark:text-red-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-red-500 dark:text-red-400 text-sm mb-2">{error}</p>
                <button
                  onClick={fetchNotifications}
                  className="text-xs text-blue-500 hover:text-blue-600 underline"
                >
                  Coba lagi
                </button>
              </div>
            ) : notifications.length > 0 ? (
              // Notification list
              notifications.map((notification, index) => (
                <div key={notification.id_notification}>
                  <NotificationItem
                    notification={notification}
                    onDelete={handleNotificationDelete}
                  />
                  {/* Border bottom kecuali item terakhir */}
                  {index < notifications.length - 1 && (
                    <div className="border-b border-slate-700/30 dark:border-slate-700/30"></div>
                  )}
                </div>
              ))
            ) : (
              // Empty state
              <div className="p-8 text-center flex flex-col justify-center items-center h-full min-h-[300px]">
                <svg className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Tidak ada notifikasi</p>
              </div>
            )}
          </div>
          
          {/* Footer */}
          <div className="flex-shrink-0 px-3 py-2 border-t border-slate-200 dark:border-slate-700/50 bg-slate-100/70 dark:bg-[#0B1739]/40">
            {notifications.length > 0 ? (
              <button
                onClick={handleMarkAllAsRead}
                disabled={markingAllRead}
                className="w-full py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:text-gray-400 flex items-center justify-center space-x-1.5"
              >
                {markingAllRead ? (
                  <>
                    <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-blue-500 border-t-transparent"></div>
                    <span>Memproses...</span>
                  </>
                ) : (
                  <>
                    <span>Tandai Semua Sudah Dibaca</span>
                  </>
                )}
              </button>
            ) : (
              <p className="flex items-center justify-center text-xs text-slate-600 dark:text-gray-500 font-medium tracking-wide py-1">
                CAMERA MANAGEMENT SYSTEM RS. CITRA HUSADA
              </p>
            )}
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