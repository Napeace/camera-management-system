import { useState, useEffect } from 'react';

const useNotification = (initialNotifications = []) => {
  const [notificationList, setNotificationList] = useState([]);
  
  // Mock notifications data
  const mockNotifications = [
    { id: 1, message: 'Camera ICU-001 is offline', type: 'error', time: '2 min ago', read: false },
    { id: 2, message: 'Camera ER-002 connection restored', type: 'success', time: '5 min ago', read: false },
    { id: 3, message: 'Backup completed successfully', type: 'info', time: '1 hour ago', read: false },
    { id: 4, message: 'Camera OR-003 motion detected', type: 'warning', time: '3 hours ago', read: true },
    { id: 5, message: 'System maintenance scheduled', type: 'info', time: '1 day ago', read: true }
  ];

  // Initialize notifications
  useEffect(() => {
    if (initialNotifications.length > 0) {
      setNotificationList(initialNotifications);
    } else {
      setNotificationList(mockNotifications);
    }
  }, []);

  // Update notifications when props change
  useEffect(() => {
    if (initialNotifications.length > 0) {
      setNotificationList(initialNotifications);
    }
  }, [initialNotifications]);

  // Get unread notification count
  const unreadCount = notificationList.filter(n => !n.read).length;

  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotificationList(prevNotifications => 
      prevNotifications.map(notification => ({ ...notification, read: true }))
    );
  };

  // Mark single notification as read
  const markAsRead = (notificationId) => {
    setNotificationList(prevNotifications =>
      prevNotifications.map(notification =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  // Get notification icon based on type
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

  return {
    notificationList,
    unreadCount,
    markAllAsRead,
    markAsRead,
    getNotificationIcon
  };
};

export default useNotification;