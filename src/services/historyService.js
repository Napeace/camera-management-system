// services/historyService.js - Fixed with better error handling
import apiClient from './api';

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

  // Create new history record
  async createHistory(historyData) {
    try {
      const response = await apiClient.post('/history', historyData);
      
      if (response.data && response.data.status === 'success') {
        return response.data.data;
      }
      
      throw new Error(response.data?.message || 'Failed to create history');
    } catch (error) {
      console.error('Error creating history:', error);
      
      // Handle specific error messages from backend
      if (error.response?.data?.detail) {
        // Jika detail adalah array (validation error dari FastAPI)
        if (Array.isArray(error.response.data.detail)) {
          const errorMsg = error.response.data.detail
            .map(err => `${err.loc[1]}: ${err.msg}`)
            .join(', ');
          throw new Error(errorMsg);
        }
        // Jika detail adalah string
        throw new Error(error.response.data.detail);
      }
      
      if (error.response?.status === 404) {
        throw new Error('CCTV tidak ditemukan');
      }
      
      if (error.response?.status === 400) {
        throw new Error('Data tidak valid. Periksa kembali input Anda');
      }
      
      throw new Error(error.message || 'Gagal membuat history');
    }
  },

  // Update history record
  async updateHistory(historyId, historyData) {
    try {
      console.log('📤 Sending update request:', {
        historyId,
        data: historyData
      });
      
      const response = await apiClient.put(`/history/${historyId}`, historyData);
      
      console.log('📥 Update response:', response);
      
      if (response.data && response.data.status === 'success') {
        return response.data.data;
      }
      
      throw new Error(response.data?.message || 'Failed to update history');
    } catch (error) {
      console.error('❌ Error updating history:', error);
      console.error('❌ Error response:', error.response);
      
      if (error.response?.data?.detail) {
        console.error('❌ Error detail:', error.response.data.detail);
        
        // Jika detail adalah array (validation error dari FastAPI)
        if (Array.isArray(error.response.data.detail)) {
          const errorMsg = error.response.data.detail
            .map(err => {
              const field = err.loc ? err.loc[err.loc.length - 1] : 'unknown';
              const msg = err.msg || err.message || 'validation error';
              return `${field}: ${msg}`;
            })
            .join(', ');
          throw new Error(errorMsg);
        }
        
        // Jika detail adalah string
        if (typeof error.response.data.detail === 'string') {
          throw new Error(error.response.data.detail);
        }
        
        // Jika detail adalah object
        throw new Error(JSON.stringify(error.response.data.detail));
      }
      
      if (error.response?.status === 404) {
        throw new Error('History tidak ditemukan');
      }
      
      if (error.response?.status === 422) {
        throw new Error('Data tidak valid. Periksa format data yang dikirim.');
      }
      
      throw new Error(error.message || 'Gagal mengupdate history');
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
        responseType: 'blob'
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
        responseType: 'blob'
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