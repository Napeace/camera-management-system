// services/userService.js
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://ad7198bc0dd6.ngrok-free.app';

class UserService {
  getAccessToken() {
    return localStorage.getItem('access_token');
  }

  async handleResponse(response) {
    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        if (Array.isArray(errorData.detail)) {
            errorMessage = errorData.detail.map(err => `${err.loc.slice(-1)[0]}: ${err.msg}`).join(', ');
        } else {
            errorMessage = errorData.detail || JSON.stringify(errorData);
        }
      } catch (e) {
        errorMessage = await response.text();
      }
      throw new Error(errorMessage);
    }
    const text = await response.text();
    return text ? JSON.parse(text) : {};
  }

  async getAllUsers(filters = {}) {
    try {
      const token = this.getAccessToken();
      if (!token) throw new Error("No authentication token found.");

      const queryParams = new URLSearchParams();
      if (filters.search) queryParams.append('search', filters.search);
      // Backend sepertinya belum mendukung filter ini, tapi kita simpan untuk nanti
      // if (filters.role) queryParams.append('role', filters.role);
      
      queryParams.append('token', token);

      const url = `${API_BASE_URL}/users?${queryParams.toString()}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'ngrok-skip-browser-warning': 'true' }
      });
      const data = await this.handleResponse(response);
      return {
        data: Array.isArray(data) ? data : [],
        total: Array.isArray(data) ? data.length : 0
      };
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }
  
  async createUser(userData) {
    try {
      const token = this.getAccessToken();
      if (!token) throw new Error("No authentication token found.");
      
      const url = `${API_BASE_URL}/users/create?token=${token}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify(userData)
      });
      return await this.handleResponse(response);
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  // =======================================================
  // === FUNGSI-FUNGSI YANG HILANG DITAMBAHKAN DI SINI ===
  // =======================================================

  async updateUser(userId, userData) {
    try {
      const token = this.getAccessToken();
      if (!token) throw new Error("No authentication token found.");
      
      const url = `${API_BASE_URL}/users/update/${userId}?token=${token}`;
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify(userData)
      });
      return await this.handleResponse(response);
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  async softDeleteUser(userId) {
    try {
      const token = this.getAccessToken();
      if (!token) throw new Error("No authentication token found.");

      const url = `${API_BASE_URL}/users/soft/${userId}?token=${token}`;
      const response = await fetch(url, {
        method: 'DELETE',
        headers: { 'ngrok-skip-browser-warning': 'true' }
      });
      return await this.handleResponse(response);
    } catch (error) {
      console.error('Error soft deleting user:', error);
      throw error;
    }
  }
  
  async hardDeleteUser(userId) {
    try {
      const token = this.getAccessToken();
      if (!token) throw new Error("No authentication token found.");

      const url = `${API_BASE_URL}/users/hard/${userId}?token=${token}`;
      const response = await fetch(url, {
        method: 'DELETE',
        headers: { 'ngrok-skip-browser-warning': 'true' }
      });
      return await this.handleResponse(response);
    } catch (error) {
      console.error('Error hard deleting user:', error);
      throw error;
    }
  }
  
  async updateUser(userId, userData) {
    try {
      const token = this.getAccessToken();
      if (!token) throw new Error("No authentication token found.");
      
      // Endpoint untuk update user
      const url = `${API_BASE_URL}/users/update/${userId}?token=${token}`;
      console.log(`Updating user ${userId} with data:`, userData);
      
      const response = await fetch(url, {
        method: 'PUT', // Gunakan method PUT untuk update
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify(userData)
      });
      
      return await this.handleResponse(response);
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }
}

const userService = new UserService();
export default userService;