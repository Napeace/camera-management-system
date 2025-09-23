// services/historyService.js
import apiClient from './apiClient';

const historyService = {
  // Get all history records
  async getHistory(params = {}) {
    try {
      const response = await apiClient.get('/history', { params });
      return response;
    } catch (error) {
      console.error('Error fetching history:', error);
      throw error;
    }
  },

  // Get history with pagination
  async getHistoryPaginated(page = 1, limit = 10, filters = {}) {
    try {
      const params = {
        page,
        limit,
        ...filters
      };
      const response = await apiClient.get('/history/paginated', { params });
      return response;
    } catch (error) {
      console.error('Error fetching paginated history:', error);
      throw error;
    }
  },

  // Get history by date range
  async getHistoryByDateRange(startDate, endDate) {
    try {
      const params = {
        start_date: startDate,
        end_date: endDate
      };
      const response = await apiClient.get('/history/date-range', { params });
      return response;
    } catch (error) {
      console.error('Error fetching history by date range:', error);
      throw error;
    }
  },

  // Get history by location
  async getHistoryByLocation(locationId) {
    try {
      const response = await apiClient.get(`/history/location/${locationId}`);
      return response;
    } catch (error) {
      console.error('Error fetching history by location:', error);
      throw error;
    }
  },

  // Get history by CCTV camera
  async getHistoryByCCTV(cctvId) {
    try {
      const response = await apiClient.get(`/history/cctv/${cctvId}`);
      return response;
    } catch (error) {
      console.error('Error fetching history by CCTV:', error);
      throw error;
    }
  },

  // Get history statistics
  async getHistoryStats() {
    try {
      const response = await apiClient.get('/history/stats');
      return response;
    } catch (error) {
      console.error('Error fetching history stats:', error);
      throw error;
    }
  },

  // Export history to PDF
  async exportHistoryToPDF(filters = {}) {
    try {
      const response = await apiClient.get('/history/export/pdf', {
        params: filters,
        responseType: 'blob' // Important for file download
      });
      return response;
    } catch (error) {
      console.error('Error exporting history to PDF:', error);
      throw error;
    }
  },

  // Export history to Excel
  async exportHistoryToExcel(filters = {}) {
    try {
      const response = await apiClient.get('/history/export/excel', {
        params: filters,
        responseType: 'blob' // Important for file download
      });
      return response;
    } catch (error) {
      console.error('Error exporting history to Excel:', error);
      throw error;
    }
  },

  // Search history
  async searchHistory(searchTerm, filters = {}) {
    try {
      const params = {
        search: searchTerm,
        ...filters
      };
      const response = await apiClient.get('/history/search', { params });
      return response;
    } catch (error) {
      console.error('Error searching history:', error);
      throw error;
    }
  },

  // Get recent history (last 24 hours)
  async getRecentHistory(limit = 10) {
    try {
      const params = { limit };
      const response = await apiClient.get('/history/recent', { params });
      return response;
    } catch (error) {
      console.error('Error fetching recent history:', error);
      throw error;
    }
  },

  // Delete history record (if needed for admin)
  async deleteHistory(historyId) {
    try {
      const response = await apiClient.delete(`/history/${historyId}`);
      return response;
    } catch (error) {
      console.error('Error deleting history:', error);
      throw error;
    }
  }
};

export default historyService;