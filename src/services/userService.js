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

  // Helper untuk menangani error dari Axios
  _handleError(error) {
    console.error('API Error Details:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
      url: error.config?.url
    });
    
    let errorMessage = 'An error occurred';
    
    if (error.response?.data) {
      if (typeof error.response.data === 'string') {
        errorMessage = error.response.data;
      } else if (error.response.data.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.response.data.message) {
        errorMessage = error.response.data.message;
      } else if (error.response.status) {
        errorMessage = `Server error: ${error.response.status}`;
      }
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    throw new Error(errorMessage);
  }

  async getAllUsers(filters = {}) {
    try {
      // ❌ REMOVED: Manual token validation
      // const token = this._getAuthToken();
      
      // Build query parameters
      const queryParams = new URLSearchParams({ 
        skip: 0, 
        limit: 1000 // Increase limit to get more users
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
      
      // ❌ REMOVED: Token manually appended to URL (handled by interceptor)
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
      // ❌ REMOVED: Manual token append
      console.log('Creating user with data:', userData);
      const response = await apiClient.post('/users/', userData);
      return this._handleResponse(response);
    } catch (error) {
      this._handleError(error);
    }
  }

  async updateUser(userId, userData) {
    try {
      // ❌ REMOVED: Manual token append
      console.log('Updating user:', userId, 'with data:', userData);
      const response = await apiClient.put(`/users/${userId}`, userData);
      return this._handleResponse(response);
    } catch (error) {
      this._handleError(error);
    }
  }

  async softDeleteUser(userId) {
    try {
      // ❌ REMOVED: Manual token append
      const response = await apiClient.delete(`/users/soft/${userId}`);
      return this._handleResponse(response);
    } catch (error) {
      this._handleError(error);
    }
  }

  async hardDeleteUser(userId) {
    try {
      // ❌ REMOVED: Manual token append
      const response = await apiClient.delete(`/users/hard/${userId}`);
      return this._handleResponse(response);
    } catch (error) {
      this._handleError(error);
    }
  }

  // Export Users to Excel/CSV
  async exportUsers(format = 'xlsx') {
    try {
      // ❌ REMOVED: Manual token append
      console.log('Exporting users with format:', format);
      
      const response = await apiClient.get(`/users/export?format=${format}`, {
        responseType: 'blob', // Important for file download
        timeout: 60000, // 60 seconds timeout for export operations
      });
      
      // For blob responses, we don't use _handleResponse since it's different format
      return response;
    } catch (error) {
      this._handleError(error);
    }
  }

  // Import Users from Excel/CSV file
  async importUsers(formData) {
    try {
      // ❌ REMOVED: Manual token append to formData
      console.log('Importing users from file');
      
      // Token will be automatically injected by interceptor in query params
      const response = await apiClient.post('/users/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 120000, // 2 minutes timeout for import operations
      });
      
      return this._handleResponse(response);
    } catch (error) {
      this._handleError(error);
    }
  }
}

const userService = new UserService();
export default userService;