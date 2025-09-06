import axios from 'axios';

const BASE_URL = 'http://localhost:8000';

// Mock data untuk testing (hapus kalau FastAPI sudah ready)
const MOCK_USERS = [
  { username: 'admin', password: 'admin123', role: 'superadmin' },
  { username: 'security', password: 'security123', role: 'security' }
];

const MOCK_CAMERAS = [
  { id: 1, name: 'ICU Camera 1', location: 'ICU Room 101', status: 'active' },
  { id: 2, name: 'ER Camera 1', location: 'Emergency Room', status: 'active' },
  { id: 3, name: 'Lobby Camera', location: 'Main Lobby', status: 'inactive' },
  { id: 4, name: 'Parking Camera', location: 'Parking Area', status: 'active' }
];

// Function login (pakai mock dulu)
export const loginUser = async (username, password) => {
  try {
    // Simulasi delay API
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Check credentials di mock data
    const user = MOCK_USERS.find(u => 
      u.username === username && u.password === password
    );
    
    if (user) {
      return {
        success: true,
        data: {
          access_token: 'mock-jwt-token-' + Date.now(),
          username: user.username,
          role: user.role
        }
      };
    } else {
      return {
        success: false,
        message: 'Username atau password salah!'
      };
    }
    
    // Uncomment ini kalau FastAPI sudah ready:
    /*
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      username,
      password
    });
    
    return {
      success: true,
      data: response.data
    };
    */
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.detail || 'Login gagal!'
    };
  }
};

// Function get cameras (pakai mock dulu)
export const getCameras = async (token) => {
  try {
    // Simulasi delay API
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      success: true,
      data: MOCK_CAMERAS
    };
    
    // Uncomment ini kalau FastAPI sudah ready:
    /*
    const response = await axios.get(`${BASE_URL}/cameras`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return {
      success: true,
      data: response.data
    };
    */
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.detail || 'Gagal mengambil data camera!'
    };
  }
};