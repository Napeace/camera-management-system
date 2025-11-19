// src/services/cctvService.js
import apiClient from './api';

class CCTVService {
  // Field mapping for user-friendly error messages
  fieldLabels = {
    'titik_letak': 'Titik Letak',
    'ip_address': 'IP Address', 
    'is_streaming': 'Status Streaming',
    'id_location': 'Lokasi',
    'nama_lokasi': 'Nama Lokasi',
    'string': 'Titik Letak', 
    'str': 'Titik Letak'    
  };

  // Helper method to format validation errors with proper field names
  formatValidationError(errorDetail) {
    try {
      if (typeof errorDetail === 'string') {
        return errorDetail;
      }

      if (Array.isArray(errorDetail)) {
        const formattedErrors = errorDetail.map(err => {
          if (err.loc && err.msg) {
            const fieldName = err.loc[err.loc.length - 1];
            const friendlyFieldName = this.fieldLabels[fieldName] || fieldName;
            
            let message = err.msg;
            if (message.includes('at least')) {
              message = `${friendlyFieldName} harus memiliki minimal ${message.match(/\d+/)?.[0] || '5'} karakter`;
            } else if (message.includes('String should have')) {
              message = `${friendlyFieldName} harus memiliki minimal 5 karakter`;
            } else if (message.includes('ensure this value')) {
              message = `${friendlyFieldName} tidak valid`;
            } else if (message.includes('field required')) {
              message = `${friendlyFieldName} wajib diisi`;
            } else {
              message = `${friendlyFieldName}: ${message}`;
            }
            
            return message;
          }
          return err.msg || err.message || JSON.stringify(err);
        });
        
        return formattedErrors.join(', ');
      }

      return JSON.stringify(errorDetail);
    } catch (e) {
      return 'Terjadi kesalahan validasi';
    }
  }

  // Get all CCTV cameras
  async getAllCCTV(filters = {}) {
    try {
      const params = new URLSearchParams();
      
      params.append('skip', filters.skip || 0);
      params.append('limit', filters.limit || 50);
      
      if (filters.search) {
        params.append('search', filters.search);
      }
      
      if (filters.is_streaming !== undefined) {
        params.append('is_streaming', filters.is_streaming);
      }
      
      if (filters.id_location) {
        params.append('id_location', filters.id_location);
      }

      console.log('Fetching CCTV data with params:', params.toString());
      
      const response = await apiClient.get(`/cctv/?${params.toString()}`);
      
      console.log('CCTV API Response:', response.data);
      
      // Handle response structure - backend wraps in success_response
      let cctvData = [];
      if (response.data && response.data.data) {
        cctvData = Array.isArray(response.data.data) ? response.data.data : [];
      } else if (Array.isArray(response.data)) {
        cctvData = response.data;
      }
      
      // Transform data - ensure is_streaming is properly mapped
      const transformedData = cctvData.map(cctv => ({
        ...cctv,
        // Map location name for compatibility
        location_name: cctv.cctv_location_name || cctv.location_name,
        // Ensure is_streaming is boolean
        is_streaming: cctv.is_streaming !== undefined ? Boolean(cctv.is_streaming) : false
      }));
      
      console.log('Transformed CCTV data:', transformedData);
      
      return {
        data: transformedData,
        total: transformedData.length,
        success: true
      };
    } catch (error) {
      console.error('Error fetching CCTV data:', error);
      
      let errorMessage = 'Failed to fetch CCTV data';
      if (error.response) {
        errorMessage = error.response.data?.detail || 
                      error.response.data?.message || 
                      `Server Error: ${error.response.status}`;
      } else if (error.request) {
        errorMessage = 'Network error - cannot reach server';
      }
      
      throw new Error(errorMessage);
    }
  }

  // Get all locations for dropdown
  async getAllLocations() {
    try {
      console.log('Fetching locations...');
      
      const response = await apiClient.get('/location/');
      console.log('Locations API Response:', response.data);
      
      const locations = Array.isArray(response.data) ? response.data : 
                       response.data.data ? response.data.data : [];
      
      return locations;
    } catch (error) {
      console.error('Error fetching locations:', error);
      throw new Error(error.response?.data?.detail || 'Failed to fetch locations');
    }
  }

  // Test CCTV connection
  async testCCTVConnection(cctvId) {
    try {
      console.log('Testing CCTV connection:', cctvId);
      
      const response = await apiClient.get(`/cctv/${cctvId}/test`);
      console.log('Connection test response:', response.data);
      
      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      console.error('Error testing CCTV connection:', error);
      
      return {
        success: false,
        error: error.response?.data?.detail || 'Gagal test koneksi CCTV'
      };
    }
  }

  // Test API connection
  async testConnection() {
    try {
      const response = await apiClient.get('/');
      console.log('API Connection Test:', response.data);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('API Connection Test Failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Create new CCTV (IP Address)
  async createCCTV(cctvData) {
    try {
      console.log('Creating IP CCTV with data:', cctvData);
      
      const requestData = {
        titik_letak: cctvData.titik_letak,
        ip_address: cctvData.ip_address,
        id_location: parseInt(cctvData.id_location)
      };
      
      console.log('POST URL:', '/cctv/ip');
      console.log('Request Data:', requestData);
      
      const response = await apiClient.post('/cctv/ip', requestData);
      
      console.log('Create IP CCTV Response:', response.data);
      
      // Extract data dari success_response wrapper
      if (response.data && response.data.data) {
        return response.data.data;
      }
      
      return response.data;
    } catch (error) {
      console.error('Error creating IP CCTV:', error);
      
      let errorMessage = 'Gagal membuat CCTV';
      
      if (error.response) {
        const errorData = error.response.data;
        
        if (typeof errorData === 'string') {
          errorMessage = errorData;
        } else if (errorData?.detail) {
          errorMessage = this.formatValidationError(errorData.detail);
        } else if (errorData?.message) {
          errorMessage = errorData.message;
        } else {
          errorMessage = `Server Error (${error.response.status}): ${JSON.stringify(errorData)}`;
        }
      } else if (error.request) {
        errorMessage = 'Koneksi bermasalah - tidak dapat terhubung ke server';
      } else {
        errorMessage = error.message;
      }
      
      throw new Error(errorMessage);
    }
  }

   
  async createCCTVAnalog(analogData) {
    try {
      console.log('Creating Analog CCTV with data:', analogData);
      
      const requestData = {
        nama_lokasi: analogData.nama_lokasi,
        ip_address: analogData.ip_address
      };
      
      console.log('POST URL:', '/cctv/analog');
      console.log('Request Data:', requestData);
      
      const response = await apiClient.post('/cctv/analog', requestData);
      
      console.log('Create Analog CCTV Response:', response.data);
      
      // Extract data dari success_response wrapper
      if (response.data && response.data.data) {
        return response.data.data;
      }
      
      return response.data;
    } catch (error) {
      console.error('Error creating Analog CCTV:', error);
      
      let errorMessage = 'Gagal membuat CCTV Analog';
      
      if (error.response) {
        const errorData = error.response.data;
        
        if (typeof errorData === 'string') {
          errorMessage = errorData;
        } else if (errorData?.detail) {
          errorMessage = this.formatValidationError(errorData.detail);
        } else if (errorData?.message) {
          errorMessage = errorData.message;
        } else {
          errorMessage = `Server Error (${error.response.status}): ${JSON.stringify(errorData)}`;
        }
      } else if (error.request) {
        errorMessage = 'Koneksi bermasalah - tidak dapat terhubung ke server';
      } else {
        errorMessage = error.message;
      }
      
      throw new Error(errorMessage);
    }
  }

  // Update CCTV
  async updateCCTV(cctvId, cctvData) {
    try {
      const updateData = {};
      
      if (cctvData.titik_letak) updateData.titik_letak = cctvData.titik_letak;
      if (cctvData.ip_address) updateData.ip_address = cctvData.ip_address;
      if (cctvData.id_location) updateData.id_location = parseInt(cctvData.id_location);

      console.log('Updating CCTV', cctvId, 'with data:', updateData);

      const response = await apiClient.put(`/cctv/${cctvId}`, updateData);
      return response.data;
    } catch (error) {
      console.error('Error updating CCTV:', error);
      
      let errorMessage = 'Gagal mengupdate CCTV';
      
      if (error.response) {
        const errorData = error.response.data;
        
        if (typeof errorData === 'string') {
          errorMessage = errorData;
        } else if (errorData?.detail) {
          errorMessage = this.formatValidationError(errorData.detail);
        } else if (errorData?.message) {
          errorMessage = errorData.message;
        } else if (error.response.status === 401) {
          errorMessage = 'Tidak memiliki akses untuk mengupdate CCTV';
        } else if (error.response.status === 404) {
          errorMessage = 'CCTV tidak ditemukan';
        } else {
          errorMessage = `Server Error (${error.response.status})`;
        }
      } else if (error.request) {
        errorMessage = 'Koneksi bermasalah - tidak dapat terhubung ke server';
      }
      
      throw new Error(errorMessage);
    }
  }

  // Delete CCTV
  async deleteCCTV(cctvId) {
    try {
      console.log('=== DELETE CCTV DEBUG ===');
      console.log('CCTV ID:', cctvId);
      
      const response = await apiClient.delete(`/cctv/${cctvId}`, {
        timeout: 15000,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Delete response:', response.data);
      
      if (response.data) {
        if (response.data.status === 'success') {
          return {
            success: true,
            message: response.data.message || 'CCTV berhasil dihapus',
            data: response.data.data
          };
        } else if (response.data.message) {
          return {
            success: true,
            message: response.data.message,
            data: response.data.data || response.data
          };
        }
      }
      
      if (response.status === 204 || response.status === 200) {
        return {
          success: true,
          message: 'CCTV berhasil dihapus',
          data: null
        };
      }
      
      return {
        success: true,
        message: 'CCTV berhasil dihapus',
        data: response.data
      };
      
    } catch (error) {
      console.error('=== DELETE CCTV ERROR ===');
      console.error('Error:', error);
      
      let errorMessage = 'Gagal menghapus CCTV';
      
      if (error.response) {
        const errorData = error.response.data;
        
        if (typeof errorData === 'string') {
          errorMessage = errorData;
        } else if (errorData?.detail) {
          errorMessage = this.formatValidationError(errorData.detail);
        } else if (errorData?.message) {
          errorMessage = errorData.message;
        } else if (error.response.status === 401) {
          errorMessage = 'Tidak memiliki akses untuk menghapus CCTV';
        } else if (error.response.status === 404) {
          errorMessage = 'CCTV tidak ditemukan';
        } else if (error.response.status === 500) {
          errorMessage = 'Server error. Silakan hubungi administrator.';
        } else {
          errorMessage = `Server Error (${error.response.status}): ${error.response.statusText}`;
        }
      } else if (error.request) {
        if (error.code === 'ECONNABORTED') {
          errorMessage = 'Request timeout. Server terlalu lama merespon.';
        } else if (error.code === 'ERR_NETWORK') {
          errorMessage = 'Network error. Backend tidak dapat dijangkau.';
        } else {
          errorMessage = `Tidak ada response dari server. ${error.message}`;
        }
      } else {
        errorMessage = error.message || 'Terjadi kesalahan yang tidak diketahui';
      }
      
      throw new Error(errorMessage);
    }
  }

  // Get statistics (used in CRUD page)
  async getStatistics() {
    try {
      const result = await this.getAllCCTV();
      const cctvData = result.data;
      
      const total = cctvData.length;
      const online = cctvData.filter(cctv => cctv.is_streaming === true).length;
      const offline = total - online;
      
      return { total, online, offline };
    } catch (error) {
      console.error('Error calculating statistics:', error);
      return { total: 0, online: 0, offline: 0 };
    }
  }

  // Get unique locations for filter dropdown (CRUD page)
  async getLocationGroups() {
    try {
      const locations = await this.getAllLocations();
      return locations.map(loc => ({
        id_location: loc.id_location || loc.id,
        nama_lokasi: loc.nama_lokasi || loc.location_name || loc.name
      }));
    } catch (error) {
      console.error('Error fetching location groups:', error);
      return [];
    }
  }
}

const cctvService = new CCTVService();
export default cctvService;