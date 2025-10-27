// src/services/api.js
import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
  },
});

// Interceptor untuk request - inject token di query params
apiClient.interceptors.request.use(
  (config) => {
    // Skip untuk login endpoint
    if (config.url.includes('/auth/login')) {
      return config;
    }
    
    // Ambil token dari localStorage
    const token = localStorage.getItem('access_token');
    
    if (token) {
      // Inject token ke query params (sesuai backend)
      const url = new URL(config.url, config.baseURL);
      url.searchParams.append('token', token);
      
      // Update config dengan URL yang sudah ada token
      config.url = url.pathname + url.search;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor untuk response (menangani error global)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Jika token expired, otomatis logout
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;