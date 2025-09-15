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
    const errorMessage = error.response?.data?.detail || error.message;
    console.error('API Error:', errorMessage);
    throw new Error(errorMessage);
  }

  async getAllUsers(filters = {}) {
    try {
      const token = this._getAuthToken();
      
      // Build query parameters
      const queryParams = new URLSearchParams({ 
        token, 
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
      const token = this._getAuthToken();
      console.log('Creating user with data:', userData);
      const response = await apiClient.post(`/users/?token=${token}`, userData);
      return this._handleResponse(response);
    } catch (error) {
      this._handleError(error);
    }
  }

  async updateUser(userId, userData) {
    try {
      const token = this._getAuthToken();
      console.log('Updating user:', userId, 'with data:', userData);
      const response = await apiClient.put(`/users/${userId}?token=${token}`, userData);
      return this._handleResponse(response);
    } catch (error) {
      this._handleError(error);
    }
  }

  async softDeleteUser(userId) {
    try {
      const token = this._getAuthToken();
      const response = await apiClient.delete(`/users/soft/${userId}?token=${token}`);
      return this._handleResponse(response);
    } catch (error) {
      this._handleError(error);
    }
  }

  async hardDeleteUser(userId) {
    try {
      const token = this._getAuthToken();
      const response = await apiClient.delete(`/users/hard/${userId}?token=${token}`);
      return this._handleResponse(response);
    } catch (error) {
      this._handleError(error);
    }
  }
}

const userService = new UserService();
export default userService;