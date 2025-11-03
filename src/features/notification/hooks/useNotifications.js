// src/hooks/useNotifications.js
// OPTIONAL: Custom hook untuk reusable notification logic
// Bisa digunakan di komponen lain jika perlu akses notifikasi

import { useState, useEffect, useCallback } from 'react';
import notificationService from '../services/notificationService';

/**
 * Custom hook untuk mengelola notifications
 * @param {number} refreshInterval - Interval refresh dalam ms (default: 40000)
 * @returns {Object} { notifications, loading, error, unreadCount, fetchNotifications, deleteNotification }
 */
const useNotifications = (refreshInterval = 40000) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await notificationService.getNotifications();
      
      if (response && response.data) {
        setNotifications(response.data);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Gagal memuat notifikasi');
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete notification
  const deleteNotification = useCallback(async (notificationId) => {
    try {
      await notificationService.deleteNotification(notificationId);
      
      // Update state - remove deleted notification
      setNotifications(prev => 
        prev.filter(n => n.id_notification !== notificationId)
      );
      
      return true;
    } catch (err) {
      console.error('Error deleting notification:', err);
      return false;
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Auto-refresh
  useEffect(() => {
    if (refreshInterval > 0) {
      const interval = setInterval(fetchNotifications, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [refreshInterval, fetchNotifications]);

  // Computed: unread count
  const unreadCount = notifications.length;

  return {
    notifications,
    loading,
    error,
    unreadCount,
    fetchNotifications,
    deleteNotification
  };
};

export default useNotifications;