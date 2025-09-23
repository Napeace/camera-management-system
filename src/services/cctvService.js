import apiClient from './api';

class CCTVService {
  // Field mapping for user-friendly error messages
  fieldLabels = {
    'titik_letak': 'Titik Letak',
    'ip_address': 'IP Address', 
    'status': 'Status',
    'id_location': 'Lokasi',
    'string': 'Titik Letak', // Common server validation error
    'str': 'Titik Letak'     // Alternative validation error
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
            // Extract field name from error location
            const fieldName = err.loc[err.loc.length - 1];
            const friendlyFieldName = this.fieldLabels[fieldName] || fieldName;
            
            // Common validation messages with friendly field names
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
      
      // Add token (consistent with userService)
      const token = localStorage.getItem('access_token');
      if (token) {
        params.append('token', token);
      }
      
      // Add pagination
      params.append('skip', filters.skip || 0);
      params.append('limit', filters.limit || 50);
      
      // Add search parameter if exists
      if (filters.search) {
        params.append('search', filters.search);
      }
      
      // Add status filter if exists
      if (filters.status !== undefined) {
        params.append('status', filters.status);
      }
      
      // Add location filter if exists
      if (filters.id_location) {
        params.append('id_location', filters.id_location);
      }

      console.log('Fetching CCTV data with params:', params.toString());
      
      const response = await apiClient.get(`/cctv/?${params.toString()}`);
      
      console.log('CCTV API Response:', response);
      console.log('CCTV API Response Data:', response.data);
      
      // Pastikan response.data adalah array
      const cctvData = Array.isArray(response.data) ? response.data : 
                      response.data.data ? response.data.data :
                      response.data.items ? response.data.items : [];
      
      return {
        data: cctvData,
        total: cctvData.length,
        success: true
      };
    } catch (error) {
      console.error('Error fetching CCTV data:', error);
      console.error('Error response:', error.response);
      
      // Detailed error message
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
      
      const params = new URLSearchParams();
      // Add token (consistent with userService)
      const token = localStorage.getItem('access_token');
      if (token) {
        params.append('token', token);
      }
      
      const response = await apiClient.get(`/location/?${params.toString()}`);
      console.log('Locations API Response:', response.data);
      
      const locations = Array.isArray(response.data) ? response.data : 
                       response.data.data ? response.data.data : [];
      
      return locations;
    } catch (error) {
      console.error('Error fetching locations:', error);
      throw new Error(error.response?.data?.detail || 'Failed to fetch locations');
    }
  }

  // Test API connection
  async testConnection() {
    try {
      const params = new URLSearchParams();
      const token = localStorage.getItem('access_token');
      if (token) {
        params.append('token', token);
      }
      
      const response = await apiClient.get(`/?${params.toString()}`);
      console.log('API Connection Test:', response.data);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('API Connection Test Failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Create new CCTV - IMPROVED ERROR HANDLING
  async createCCTV(cctvData) {
    try {
      console.log('Creating CCTV with data:', cctvData);
      
      const token = localStorage.getItem('access_token');
      
      // Try POST with token in query params (consistent with GET requests)
      const params = new URLSearchParams();
      if (token) {
        params.append('token', token);
      }
      
      const requestData = {
        titik_letak: cctvData.titik_letak,
        ip_address: cctvData.ip_address,
        status: cctvData.status,
        id_location: parseInt(cctvData.id_location)
      };
      
      console.log('POST URL:', `/cctv/?${params.toString()}`);
      console.log('Request Data:', requestData);
      
      const response = await apiClient.post(`/cctv/?${params.toString()}`, requestData);
      
      console.log('Create CCTV Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating CCTV:', error);
      console.error('Error response:', error.response);
      
      // IMPROVED ERROR MESSAGE PARSING
      let errorMessage = 'Gagal membuat CCTV';
      
      if (error.response) {
        const errorData = error.response.data;
        console.log('Error response data:', errorData);
        
        if (typeof errorData === 'string') {
          errorMessage = errorData;
        } else if (errorData?.detail) {
          // Use the new formatValidationError method
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

  // Update CCTV - FIXED with token
  async updateCCTV(cctvId, cctvData) {
    try {
      const updateData = {};
      
      if (cctvData.titik_letak) updateData.titik_letak = cctvData.titik_letak;
      if (cctvData.ip_address) updateData.ip_address = cctvData.ip_address;
      if (cctvData.status !== undefined) updateData.status = cctvData.status;
      if (cctvData.id_location) updateData.id_location = parseInt(cctvData.id_location);

      console.log('Updating CCTV', cctvId, 'with data:', updateData);

      const token = localStorage.getItem('access_token');
      const params = new URLSearchParams();
      if (token) {
        params.append('token', token);
      }

      const response = await apiClient.put(`/cctv/${cctvId}?${params.toString()}`, updateData);
      return response.data;
    } catch (error) {
      console.error('Error updating CCTV:', error);
      console.error('Update error response:', error.response);
      
      // IMPROVED ERROR HANDLING
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

  // Delete CCTV - FIXED with token
  async deleteCCTV(cctvId) {
    try {
      const token = localStorage.getItem('access_token');
      const params = new URLSearchParams();
      if (token) {
        params.append('token', token);
      }

      console.log('Deleting CCTV', cctvId, 'with token');
      
      const response = await apiClient.delete(`/cctv/${cctvId}?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting CCTV:', error);
      console.error('Delete error response:', error.response);
      
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
        } else {
          errorMessage = `Server Error (${error.response.status})`;
        }
      } else if (error.request) {
        errorMessage = 'Koneksi bermasalah - tidak dapat terhubung ke server';
      }
      
      throw new Error(errorMessage);
    }
  }

  // Get statistics (calculated from current data)
  async getStatistics() {
    try {
      const result = await this.getAllCCTV();
      const cctvData = result.data;
      
      const total = cctvData.length;
      const online = cctvData.filter(cctv => cctv.status === true).length;
      const offline = total - online;
      
      return { total, online, offline };
    } catch (error) {
      console.error('Error calculating statistics:', error);
      return { total: 0, online: 0, offline: 0 };
    }
  }

  // Get unique locations for filter dropdown
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

  // Get DVR groups - ADDED METHOD TO FIX THE ERROR
  async getDVRGroups() {
    try {
      // This could be a separate endpoint for DVR groups if it exists
      // For now, we'll return location groups as DVR groups might be location-based
      const locations = await this.getAllLocations();
      return locations.map(loc => ({
        id: loc.id_location || loc.id,
        name: loc.nama_lokasi || loc.location_name || loc.name,
        type: 'location' // Add type to distinguish if needed
      }));
    } catch (error) {
      console.error('Error fetching DVR groups:', error);
      return [];
    }
  }
}

const cctvService = new CCTVService();
export default cctvService;