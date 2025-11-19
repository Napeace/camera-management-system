// services/historyService.js - With Fixed Export Filename
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
      
      if (error.response?.data?.detail) {
        if (Array.isArray(error.response.data.detail)) {
          const errorMsg = error.response.data.detail
            .map(err => `${err.loc[1]}: ${err.msg}`)
            .join(', ');
          throw new Error(errorMsg);
        }
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
        
        if (typeof error.response.data.detail === 'string') {
          throw new Error(error.response.data.detail);
        }
        
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

   
  async exportHistory(startDate = null, endDate = null) {
    try {
      console.log('📤 Exporting history with params:', { startDate, endDate });
      
      const params = {
        file_type: 'xlsx'
      };
      
      // Format dates to YYYY-MM-DD for backend
      if (startDate) {
        const year = startDate.getFullYear();
        const month = String(startDate.getMonth() + 1).padStart(2, '0');
        const day = String(startDate.getDate()).padStart(2, '0');
        params.start_date = `${year}-${month}-${day}`;
      }
      
      if (endDate) {
        const year = endDate.getFullYear();
        const month = String(endDate.getMonth() + 1).padStart(2, '0');
        const day = String(endDate.getDate()).padStart(2, '0');
        params.end_date = `${year}-${month}-${day}`;
      }
      
      console.log('📤 Final export params:', params);
      
      // Request with blob response type for file download
      const response = await apiClient.get('/history/export', {
        params,
        responseType: 'blob'
      });
      
      console.log('📥 Response headers:', response.headers);
      
      // Create blob from response
      const blob = new Blob([response.data], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      
       
      let filename = 'Riwayat_History.xlsx'; // Default fallback
      
      // FastAPI sends: Content-Disposition: attachment; filename=Riwayat_2024-11-01_dari_2024-11-14_20241114120000.xlsx
      const contentDisposition = response.headers['content-disposition'];
      console.log('📄 Content-Disposition:', contentDisposition);
      
      if (contentDisposition) {
        // Extract filename from various formats
        const patterns = [
          /filename\*?=['"]?(?:UTF-8'')?([^'";]+)['"]?/i,  // RFC 5987
          /filename=['"]([^'"]+)['"]/i,                     // Quoted
          /filename=([^;,\s]+)/i,                           // Unquoted
        ];
        
        for (const pattern of patterns) {
          const match = contentDisposition.match(pattern);
          if (match && match[1]) {
            try {
              // Try to decode if it's URL encoded
              filename = decodeURIComponent(match[1].trim());
              console.log('✅ Extracted filename:', filename);
              break;
            } catch (e) {
              // If decode fails, use as-is
              filename = match[1].trim();
              console.log('✅ Using filename as-is:', filename);
              break;
            }
          }
        }
      }
      
      // Final fallback: Generate filename from dates if extraction failed
      if (filename === 'Riwayat_History.xlsx' && (startDate || endDate)) {
        const start = startDate ? startDate.toISOString().split('T')[0] : 'start';
        const end = endDate ? endDate.toISOString().split('T')[0] : 'end';
        const timestamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0];
        filename = `Riwayat_${start}_dari_${end}_${timestamp}.xlsx`;
        console.log('📝 Generated fallback filename:', filename);
      }
      
      // Create download link and trigger download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      console.log('✅ Export successful:', filename);
      
      return {
        success: true,
        filename
      };
    } catch (error) {
      console.error('❌ Error exporting history:', error);
      
      // Handle specific error responses
      if (error.response?.status === 404) {
        throw new Error('Tidak ada data untuk diekspor pada rentang tanggal tersebut');
      }
      
      if (error.response?.status === 400) {
        throw new Error('Parameter tanggal tidak valid');
      }
      
      if (error.response?.status === 500) {
        throw new Error('Terjadi kesalahan saat membuat file Excel');
      }
      
      throw new Error(error.message || 'Gagal mengekspor data history');
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

  // Export history to PDF (kept for compatibility)
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