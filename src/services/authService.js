// services/authService.js
import { jwtDecode } from 'jwt-decode';

// Mengambil URL API dari file .env
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

class AuthService {
  async handleResponse(response) {
    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        if (errorData.detail) {
          errorMessage = typeof errorData.detail === 'string' ? errorData.detail : JSON.stringify(errorData.detail);
        } else {
          errorMessage = JSON.stringify(errorData);
        }
      } catch (e) {
        errorMessage = await response.text();
      }
      throw new Error(errorMessage);
    }
    return response.json();
  }

  async login(credentials) {
    try {
      const loginParams = new URLSearchParams({
        username: credentials.username,
        password: credentials.password,
      });
      const loginUrl = `${API_BASE_URL}/auth/login?${loginParams.toString()}`;

      const response = await fetch(loginUrl, {
        method: 'POST',
        headers: { 'accept': 'application/json', 'ngrok-skip-browser-warning': 'true' },
      });

      const data = await this.handleResponse(response);
      if (!data.access_token) throw new Error("Login successful but no token was provided.");

      const token = data.access_token;
      const decodedToken = jwtDecode(token);
      
      const getRoleName = (id_role) => {
        if (id_role === 1) return 'superadmin';
        if (id_role === 2) return 'security';
        return 'unknown';
      };
      
      const user = {
        username: decodedToken.sub,
        nama: decodedToken.nama,
        role: getRoleName(decodedToken.id_role)
      };

      localStorage.setItem('access_token', token);
      localStorage.setItem('user', JSON.stringify(user));

      return { success: true, token, user };
    } catch (error) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      throw error; // Lempar error agar bisa ditangkap di komponen
    }
  }

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
  }

  getCurrentUser() {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      return null;
    }
  }

  getAccessToken() {
    return localStorage.getItem('access_token');
  }
  
  isAuthenticated() {
    return !!this.getAccessToken();
  }
}

const authService = new AuthService();
export default authService;