// src/services/api.js
import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
  },
});

// ✅ FIX: Interceptor untuk request - inject token di HEADER (bukan query params)
apiClient.interceptors.request.use(
  (config) => {
    // Skip untuk login endpoint
    if (config.url && config.url.includes('/auth/login')) {
      return config;
    }
    
    // Ambil token dari localStorage
    const token = localStorage.getItem('access_token');
    
    if (token) {
      // ✅ CRITICAL FIX: Token harus di Authorization Header (OAuth2PasswordBearer)
      config.headers['Authorization'] = `Bearer ${token}`;
      
      console.log('✅ Token injected to Authorization header');
    } else {
      console.warn('⚠️ No token found in localStorage');
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Interceptor untuk response (menangani error global)
apiClient.interceptors.response.use(
  (response) => {
    console.log('✅ Response success:', response.config.url, response.status);
    return response;
  },
  (error) => {
    console.error('❌ Response error:', error.config?.url, error.response?.status);
    
    if (error.response && error.response.status === 401) {
      console.error('🚫 401 Unauthorized - Auto logout triggered');
      
      // Jika token expired, otomatis logout
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      
      // Redirect ke login
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;