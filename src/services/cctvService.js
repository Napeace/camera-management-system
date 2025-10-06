import apiClient from './api';

class CCTVService {
  // Field mapping for user-friendly error messages
  fieldLabels = {
    'titik_letak': 'Titik Letak',
    'ip_address': 'IP Address', 
    'status': 'Status',
    'id_location': 'Lokasi',
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
      
      const token = localStorage.getItem('access_token');
      if (token) {
        params.append('token', token);
      }
      
      params.append('skip', filters.skip || 0);
      params.append('limit', filters.limit || 50);
      
      if (filters.search) {
        params.append('search', filters.search);
      }
      
      if (filters.status !== undefined) {
        params.append('status', filters.status);
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
      
      // Transform data - map backend fields to frontend expectations
      const transformedData = cctvData.map(cctv => ({
        ...cctv,
        // Map location name for compatibility
        location_name: cctv.cctv_location_name || cctv.location_name,
        // Map is_streaming to status for frontend compatibility
        status: cctv.is_streaming !== undefined ? cctv.is_streaming : false,
        is_streaming: cctv.is_streaming !== undefined ? cctv.is_streaming : false
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
      
      const params = new URLSearchParams();
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

  // Get stream URLs for a specific CCTV
  async getStreamUrls(cctvId) {
    try {
      console.log('Fetching stream URLs for CCTV:', cctvId);
      
      const token = localStorage.getItem('access_token');
      const params = new URLSearchParams();
      if (token) {
        params.append('token', token);
      }
      
      const response = await apiClient.get(`/cctv/${cctvId}/stream?${params.toString()}`);
      console.log('Stream URLs Response:', response.data);
      
      // Handle success_response wrapper
      let streamData;
      if (response.data && response.data.status === 'success') {
        streamData = response.data.data;
      } else if (response.data && response.data.data) {
        streamData = response.data.data;
      } else {
        streamData = response.data;
      }
      
      console.log('Extracted stream data:', streamData);
      
      // Map is_streaming to status
      return {
        success: true,
        data: {
          ...streamData,
          is_streaming: streamData.is_streaming !== undefined ? streamData.is_streaming : false,
          status: streamData.is_streaming !== undefined ? streamData.is_streaming : false
        }
      };
    } catch (error) {
      console.error('Error fetching stream URLs:', error);
      
      let errorMessage = 'Gagal mengambil stream URLs';
      
      if (error.response) {
        const errorData = error.response.data;
        if (typeof errorData === 'string') {
          errorMessage = errorData;
        } else if (errorData?.detail) {
          errorMessage = errorData.detail;
        } else if (errorData?.message) {
          errorMessage = errorData.message;
        } else if (error.response.status === 404) {
          errorMessage = 'CCTV tidak ditemukan';
        } else if (error.response.status === 401) {
          errorMessage = 'Tidak memiliki akses untuk melihat stream';
        }
      } else if (error.request) {
        errorMessage = 'Koneksi bermasalah - tidak dapat terhubung ke server';
      }
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }
  
  async getStreamsByLocation(locationId) {
    try {
      console.log(`Fetching streams for location: ${locationId}`);
      const token = localStorage.getItem('access_token');
      const params = new URLSearchParams();
      if (token) {
        params.append('token', token);
      }
      
      const response = await apiClient.get(`/cctv/location/${locationId}/streams?${params.toString()}`);
      
      console.log('Raw location streams response:', response.data);
      
      // Handle success_response wrapper dari backend
      let locationData;
      if (response.data && response.data.status === 'success') {
        locationData = response.data.data;
      } else if (response.data && response.data.data) {
        locationData = response.data.data;
      } else {
        locationData = response.data;
      }

      console.log('Extracted location data:', locationData);

      // Transform camera data to map is_streaming to status
      if (locationData && locationData.cameras) {
        locationData.cameras = locationData.cameras.map(cam => {
          console.log('Camera before transform:', cam);
          
          const transformed = {
            ...cam,
            // Backend returns is_streaming, map to status for frontend
            status: cam.is_streaming !== undefined ? cam.is_streaming : false,
            is_streaming: cam.is_streaming !== undefined ? cam.is_streaming : false
          };
          
          console.log('Camera after transform:', transformed);
          return transformed;
        });
      }

      console.log('Final location data with transformed cameras:', locationData);
      return locationData;

    } catch (error) {
      console.error('Error fetching streams by location:', error);
      console.error('Error response:', error.response);
      
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.detail ||
                          error.message || 
                          'Gagal terhubung ke server';
      throw new Error(errorMessage);
    }
  }

  // Test CCTV connection
  async testCCTVConnection(cctvId) {
    try {
      console.log('Testing CCTV connection:', cctvId);
      
      const token = localStorage.getItem('access_token');
      const params = new URLSearchParams();
      if (token) {
        params.append('token', token);
      }
      
      const response = await apiClient.get(`/cctv/${cctvId}/test?${params.toString()}`);
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

  // Create new CCTV
  async createCCTV(cctvData) {
    try {
      console.log('Creating CCTV with data:', cctvData);
      
      const token = localStorage.getItem('access_token');
      
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

  // Update CCTV
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
      const token = localStorage.getItem('access_token');
      const params = new URLSearchParams();
      if (token) {
        params.append('token', token);
      }

      console.log('=== DELETE CCTV DEBUG ===');
      console.log('CCTV ID:', cctvId);
      console.log('Token:', token ? 'Present' : 'Missing');
      console.log('API Base URL:', apiClient.defaults.baseURL);
      console.log('Full URL:', `${apiClient.defaults.baseURL}/cctv/${cctvId}?${params.toString()}`);
      
      // Test connection first with a simple GET request
      console.log('Testing API connection...');
      try {
        const testResponse = await apiClient.get(`/cctv/?skip=0&limit=1&token=${token}`, {
          timeout: 5000
        });
        console.log('API connection test successful:', testResponse.status);
      } catch (testError) {
        console.error('API connection test FAILED:', testError.message);
        throw new Error('Backend tidak dapat dijangkau. Pastikan server sedang berjalan.');
      }
      
      console.log('Sending DELETE request...');
      const response = await apiClient.delete(`/cctv/${cctvId}?${params.toString()}`, {
        timeout: 15000, // 15 second timeout for delete
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Delete response received!');
      console.log('Status:', response.status);
      console.log('Status text:', response.statusText);
      console.log('Response data:', response.data);
      
      // Handle success_response wrapper dari backend
      if (response.data) {
        if (response.data.status === 'success') {
          console.log('Delete successful with success status');
          return {
            success: true,
            message: response.data.message || 'CCTV berhasil dihapus',
            data: response.data.data
          };
        } else if (response.data.message) {
          console.log('Delete successful with message');
          return {
            success: true,
            message: response.data.message,
            data: response.data.data || response.data
          };
        }
      }
      
      // Fallback untuk response 204 No Content atau response tanpa body
      if (response.status === 204 || response.status === 200) {
        console.log('Delete successful with status code', response.status);
        return {
          success: true,
          message: 'CCTV berhasil dihapus',
          data: null
        };
      }
      
      console.log('Delete successful with fallback handling');
      return {
        success: true,
        message: 'CCTV berhasil dihapus',
        data: response.data
      };
      
    } catch (error) {
      console.error('=== DELETE CCTV ERROR ===');
      console.error('Error object:', error);
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error code:', error.code);
      console.error('Error stack:', error.stack);
      
      let errorMessage = 'Gagal menghapus CCTV';
      
      if (error.response) {
        // Server responded with error status
        console.error('=== SERVER RESPONSE ERROR ===');
        console.error('Status:', error.response.status);
        console.error('Status text:', error.response.statusText);
        console.error('Response data:', error.response.data);
        console.error('Response headers:', error.response.headers);
        
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
        // Request made but no response received
        console.error('=== NO RESPONSE ERROR ===');
        console.error('Request object:', error.request);
        console.error('Request ready state:', error.request.readyState);
        console.error('Request status:', error.request.status);
        console.error('Request response:', error.request.response);
        console.error('Request config:', error.config);
        
        if (error.code === 'ECONNABORTED') {
          errorMessage = 'Request timeout. Server terlalu lama merespon (>15 detik).';
        } else if (error.code === 'ERR_NETWORK') {
          errorMessage = 'Network error. Backend tidak dapat dijangkau atau CORS issue.';
        } else if (error.message.includes('timeout')) {
          errorMessage = 'Request timeout. Server tidak merespon dalam waktu yang ditentukan.';
        } else if (error.message.includes('Network Error')) {
          errorMessage = 'Network Error. Pastikan backend berjalan di: ' + apiClient.defaults.baseURL;
        } else {
          errorMessage = `Tidak ada response dari server. ${error.message}`;
        }
      } else {
        // Something else happened
        console.error('=== UNEXPECTED ERROR ===');
        console.error('Error:', error);
        errorMessage = error.message || 'Terjadi kesalahan yang tidak diketahui';
      }
      
      console.error('Final error message:', errorMessage);
      throw new Error(errorMessage);
    }
  }

  // Get statistics
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

  // Get DVR groups
  async getDVRGroups() {
    try {
      const locations = await this.getAllLocations();
      return locations.map(loc => ({
        id: loc.id_location || loc.id,
        name: loc.nama_lokasi || loc.location_name || loc.name,
        type: 'location'
      }));
    } catch (error) {
      console.error('Error fetching DVR groups:', error);
      return [];
    }
  }
}

const cctvService = new CCTVService();
export default cctvService;