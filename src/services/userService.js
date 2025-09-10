// services/userService.js
const API_BASE_URL = 'https://ad7198bc0dd6.ngrok-free.app/';

class UserService {
  // Helper method untuk headers
  getHeaders(includeAuth = true) {
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (includeAuth) {
      const token = localStorage.getItem('access_token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }
    
    return headers;
  }

  // Helper method untuk handle response
  async handleResponse(response) {
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || `HTTP error! status: ${response.status}`);
    }
    
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return response.json();
    }
    return response.text();
  }

  // Get all users with filters
  async getAllUsers(filters = {}) {
    try {
      // Build query parameters
      const queryParams = new URLSearchParams();
      
      if (filters.search) {
        queryParams.append('search', filters.search);
      }
      if (filters.role) {
        queryParams.append('role', filters.role);
      }
      if (filters.status) {
        queryParams.append('status', filters.status);
      }

      const queryString = queryParams.toString();
      const url = `${API_BASE_URL}/users/${queryString ? `?${queryString}` : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders()
      });
      
      const data = await this.handleResponse(response);
      
      // Transform data to match existing structure if needed
      return {
        status: 'success',
        data: Array.isArray(data) ? data : data.users || [],
        total: Array.isArray(data) ? data.length : data.total || 0
      };
    } catch (error) {
      console.error('Error fetching users:', error);
      throw new Error(`Failed to fetch users: ${error.message}`);
    }
  }

  // Get user by ID
  async getUserById(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${id}`, {
        method: 'GET',
        headers: this.getHeaders()
      });
      
      const data = await this.handleResponse(response);
      
      return {
        status: 'success',
        data: data
      };
    } catch (error) {
      console.error('Error fetching user:', error);
      throw new Error(`Failed to fetch user: ${error.message}`);
    }
  }

  // Create new user
  async createUser(userData) {
    try {
      const response = await fetch(`${API_BASE_URL}/users/create`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(userData)
      });
      
      const data = await this.handleResponse(response);
      
      return {
        status: 'success',
        data: data
      };
    } catch (error) {
      console.error('Error creating user:', error);
      throw new Error(`Failed to create user: ${error.message}`);
    }
  }

  // Update user
  async updateUser(id, userData) {
    try {
      const response = await fetch(`${API_BASE_URL}/users/update/${id}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(userData)
      });
      
      const data = await this.handleResponse(response);
      
      return {
        status: 'success',
        data: data
      };
    } catch (error) {
      console.error('Error updating user:', error);
      throw new Error(`Failed to update user: ${error.message}`);
    }
  }

  // Soft delete user
  async softDeleteUser(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/users/soft/${id}`, {
        method: 'DELETE',
        headers: this.getHeaders()
      });
      
      await this.handleResponse(response);
      
      return {
        status: 'success',
        message: 'User soft deleted successfully'
      };
    } catch (error) {
      console.error('Error soft deleting user:', error);
      throw new Error(`Failed to soft delete user: ${error.message}`);
    }
  }

  // Hard delete user
  async hardDeleteUser(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/users/hard/${id}`, {
        method: 'DELETE',
        headers: this.getHeaders()
      });
      
      await this.handleResponse(response);
      
      return {
        status: 'success',
        message: 'User permanently deleted'
      };
    } catch (error) {
      console.error('Error hard deleting user:', error);
      throw new Error(`Failed to permanently delete user: ${error.message}`);
    }
  }

  // Get user roles
  async getRoles() {
    try {
      const response = await fetch(`${API_BASE_URL}/role/`, {
        method: 'GET',
        headers: this.getHeaders()
      });
      
      const data = await this.handleResponse(response);
      
      return {
        status: 'success',
        data: Array.isArray(data) ? data : data.roles || []
      };
    } catch (error) {
      console.error('Error fetching roles:', error);
      throw new Error(`Failed to fetch roles: ${error.message}`);
    }
  }
}

// Create and export singleton instance
const userService = new UserService();
export default userService;

// Export specific functions for backward compatibility
export const getAllUsers = (filters) => userService.getAllUsers(filters);
export const getUserById = (id) => userService.getUserById(id);
export const createUser = (userData) => userService.createUser(userData);
export const updateUser = (id, userData) => userService.updateUser(id, userData);
export const softDeleteUser = (id) => userService.softDeleteUser(id);
export const hardDeleteUser = (id) => userService.hardDeleteUser(id);
export const getRoles = () => userService.getRoles();