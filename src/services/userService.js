// src/services/userService.js
import apiClient from './api';
import authService from './authService';

class UserService {
  // Helper untuk mendapatkan token, agar tidak berulang
  _getAuthToken() {
    const token = authService.getAccessToken();
    if (!token) throw new Error("Token autentikasi tidak ditemukan.");
    return token;
  }

  // Helper untuk menangani respons dan error
  _handleResponse(response) {
    if (response.data && response.data.status === 'success') {
      return response.data;
    }
    // Jika backend mengembalikan 200 OK tapi status logisnya 'error'
    throw new Error(response.data.message || "Struktur respons API tidak valid.");
  }

  // ✅ UPDATED: Helper untuk menangani error dengan custom message untuk NIP
  _handleError(error) {
    console.error('API Error Details:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
      url: error.config?.url
    });
    
    // Mapping field names ke Bahasa Indonesia
    const fieldMapping = {
      'nama': 'Nama Lengkap',
      'nip': 'NIP',
      'username': 'Username',
      'password': 'Password'
    };
    
    let errorMessage = 'Terjadi kesalahan';
    
    if (error.response?.data) {
      const data = error.response.data;
      
      // ✅ Handle FastAPI validation errors (array of objects)
      if (data.detail) {
        if (Array.isArray(data.detail)) {
          // FastAPI validation error format
          errorMessage = data.detail
            .map(err => {
              const fieldKey = err.loc ? err.loc[err.loc.length - 1] : 'Field';
              const fieldName = fieldMapping[fieldKey] || fieldKey;
              
              // ✅ NEW: Custom handling untuk NIP pattern validation
              if (fieldKey === 'nip' && err.type === 'string_pattern_mismatch') {
                return 'NIP harus berupa angka';
              }
              
              // Custom message berdasarkan tipe error
              if (err.type === 'string_too_short') {
                const minLength = err.ctx?.min_length || 5;
                return `${fieldName} minimal ${minLength} karakter`;
              } else if (err.type === 'string_too_long') {
                // ✅ Custom untuk username: hardcode 20 karakter
                if (fieldKey === 'username') {
                  return `${fieldName} maksimal 20 karakter`;
                }
                // Untuk field lain, gunakan maxLength dari context backend
                const maxLength = err.ctx?.max_length || 100;
                return `${fieldName} maksimal ${maxLength} karakter`;
              } else if (err.type === 'missing') {
                return `${fieldName} wajib diisi`;
              } else {
                // Default: gunakan message dari backend
                return `${fieldName}: ${err.msg}`;
              }
            })
            .join('\n');
        } else if (typeof data.detail === 'string') {
          errorMessage = data.detail;
        } else if (typeof data.detail === 'object') {
          errorMessage = JSON.stringify(data.detail);
        }
      } else if (data.message) {
        errorMessage = data.message;
      } else if (data.error) {
        errorMessage = data.error;
      } else if (typeof data === 'string') {
        errorMessage = data;
      } else {
        errorMessage = JSON.stringify(data);
      }
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    throw new Error(errorMessage);
  }

  async getAllUsers(filters = {}) {
    try {
      // Build query parameters
      const queryParams = new URLSearchParams({ 
        skip: 0, 
        limit: 1000
      });
      
      // Add search parameter if provided
      if (filters.search && filters.search.trim()) {
        queryParams.append('search', filters.search.trim());
      }
      
      // Add role parameter if provided
      if (filters.role && filters.role.trim()) {
        queryParams.append('role', filters.role.trim());
      }
      
      console.log('API Call URL:', `/users/?${queryParams.toString()}`);
      
      const response = await apiClient.get(`/users/?${queryParams.toString()}`);
      const result = this._handleResponse(response);

      return {
        data: Array.isArray(result.data) ? result.data : [],
        total: Array.isArray(result.data) ? result.data.length : 0,
      };
    } catch (error) {
      this._handleError(error);
    }
  }

  async createUser(userData) {
    try {
      console.log('Creating user with data:', userData);
      const response = await apiClient.post('/users/', userData);
      return this._handleResponse(response);
    } catch (error) {
      this._handleError(error);
    }
  }

  async updateUser(userId, userData) {
    try {
      console.log('Updating user:', userId, 'with data:', userData);
      const response = await apiClient.put(`/users/${userId}`, userData);
      return this._handleResponse(response);
    } catch (error) {
      this._handleError(error);
    }
  }

  async softDeleteUser(userId) {
    try {
      const response = await apiClient.delete(`/users/soft/${userId}`);
      return this._handleResponse(response);
    } catch (error) {
      this._handleError(error);
    }
  }

  async hardDeleteUser(userId) {
    try {
      const response = await apiClient.delete(`/users/hard/${userId}`);
      return this._handleResponse(response);
    } catch (error) {
      this._handleError(error);
    }
  }

  // Export Users to Excel/CSV
  async exportUsers(format = 'xlsx') {
    try {
      console.log('Exporting users with format:', format);
      
      const response = await apiClient.get(`/users/export?format=${format}`, {
        responseType: 'blob',
        timeout: 60000,
      });
      
      return response;
    } catch (error) {
      this._handleError(error);
    }
  }

  // Import Users from Excel/CSV file
  async importUsers(formData) {
    try {
      console.log('Importing users from file');
      
      const response = await apiClient.post('/users/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 120000,
      });
      
      return this._handleResponse(response);
    } catch (error) {
      this._handleError(error);
    }
  }
}

const userService = new UserService();
export default userService;