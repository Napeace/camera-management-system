// src/services/notificationService.js
import apiClient from './api';

/**
 * Service untuk mengelola notifikasi
 */
const notificationService = {
  /**
   * Get semua notifikasi user yang sedang login
   * @returns {Promise} Promise dengan data notifikasi
   */
  getNotifications: async () => {
    try {
      const response = await apiClient.get('/notification/');
      return response.data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  },

  /**
   * Get jumlah notifikasi belum dibaca
   * @returns {Promise} Promise dengan count
   */
  getNotificationCount: async () => {
    try {
      const response = await apiClient.get('/notification/count');
      return response.data;
    } catch (error) {
      console.error('Error fetching notification count:', error);
      throw error;
    }
  },

  /**
   * Delete notifikasi tertentu (mark as read)
   * @param {number} notificationId - ID notifikasi
   * @returns {Promise} Promise dengan status delete
   */
  deleteNotification: async (notificationId) => {
    try {
      const response = await apiClient.delete(`/notification/${notificationId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  },

  /**
   * Delete semua notifikasi user (mark all as read)
   * @returns {Promise} Promise dengan jumlah notifikasi yang dihapus
   */
  markAllAsRead: async () => {
    try {
      const response = await apiClient.delete('/notification/');
      return response.data;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  },

  /**
   * Format waktu relatif (2 detik lalu, 1 menit lalu, dll)
   * @param {string} dateString - ISO date string
   * @returns {string} Formatted relative time
   */
  getRelativeTime: (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) {
      return `${diffInSeconds} detik lalu`;
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} menit lalu`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} jam lalu`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} hari lalu`;
  }
};

export default notificationService;