// services/api.js
const API_BASE_URL = 'https://ad7198bc0dd6.ngrok-free.app'; // Sesuaikan jika URL berubah

class AuthService {
  // =================================================================
  // === FUNGSI INI YANG DIPERBAIKI ===
  // =================================================================
  async handleResponse(response) {
    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        
        // Cek jika 'detail' ada dan ubah menjadi string jika itu adalah objek
        if (errorData.detail) {
          if (typeof errorData.detail === 'string') {
            errorMessage = errorData.detail;
          } else {
            // Jika 'detail' adalah objek, ubah menjadi teks JSON agar bisa dibaca
            errorMessage = JSON.stringify(errorData.detail);
          }
        } else {
          // Fallback jika tidak ada 'detail', tampilkan seluruh objek error
          errorMessage = JSON.stringify(errorData);
        }

      } catch (e) {
        errorMessage = await response.text();
      }
      throw new Error(errorMessage);
    }
    return response.json();
  }
  // =================================================================

  async login(credentials) {
    try {
      console.log('Workaround active: Attempting login for:', credentials.username);

      const loginParams = new URLSearchParams({
        username: credentials.username,
        password: credentials.password,
      });
      const loginUrl = `${API_BASE_URL}/auth/login?${loginParams.toString()}`;

      const loginResponse = await fetch(loginUrl, {
        method: 'POST',
        headers: { 'accept': 'application/json', 'ngrok-skip-browser-warning': 'true' },
      });

      const loginData = await this.handleResponse(loginResponse);
      if (!loginData.access_token) {
        throw new Error("Login successful but no token was provided.");
      }
      const token = loginData.access_token;
      localStorage.setItem('access_token', token);
      console.log('Step 1 SUCCESS: Got token.');

      const usersResponse = await fetch(`${API_BASE_URL}/users/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true',
        },
      });
      const allUsers = await this.handleResponse(usersResponse);
      console.log('Step 2 SUCCESS: Fetched all users.');

      const currentUser = allUsers.find(user => user.username === credentials.username);

      if (currentUser) {
        console.log('Step 3 SUCCESS: Found current user in the list:', currentUser);
        localStorage.setItem('user', JSON.stringify(currentUser));
      } else {
        throw new Error(`User '${credentials.username}' not found in the user list after login.`);
      }
      
      return { success: true, data: loginData };

    } catch (error) {
      console.error('Login process with workaround failed:', error);
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      return { success: false, message: error.message || 'Login process failed!' };
    }
  }

  // Fungsi lain-lain di bawah ini tidak perlu diubah
  async testConnection() {
    try {
      const response = await fetch(`${API_BASE_URL}/docs`, {
        headers: { 'ngrok-skip-browser-warning': 'true' },
      });
      return {
        success: response.ok,
        status: response.status,
        message: response.ok ? 'Connection successful' : `Connection failed: HTTP ${response.status}`,
      };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  async logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    return { success: true };
  }

  getCurrentUser() {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      return null;
    }
  }

  isAuthenticated() {
    const token = localStorage.getItem('access_token');
    return !!token;
  }
}

const authService = new AuthService();
export default authService;