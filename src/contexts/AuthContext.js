// src/contexts/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';

// 1. Membuat Context
const AuthContext = createContext();

// 2. Custom Hook untuk mempermudah penggunaan context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// 3. Provider Component yang akan "membungkus" aplikasi
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // State untuk loading awal

  // Cek localStorage saat aplikasi pertama kali dimuat
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('access_token');
      const storedUser = localStorage.getItem('user');
      
      if (storedToken && storedUser) {
        const userData = JSON.parse(storedUser);
        setToken(storedToken);
        setUser(userData);
       } else {
       }
    } catch (error) {
      console.error('❌ Failed to parse auth data from localStorage', error);
      // Bersihkan jika data rusak
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
    } finally {
      setIsLoading(false); // Selesai loading, apapun hasilnya
    }
  }, []); // Hanya berjalan sekali saat komponen pertama kali mount

  const login = async (userData, authToken) => {
    try {
       // Set state (async)
      setUser(userData);
      setToken(authToken);
      
      // Set localStorage (sync)
      localStorage.setItem('access_token', authToken);
      localStorage.setItem('user', JSON.stringify(userData));
        // Return Promise yang resolve setelah state update
      return new Promise((resolve) => {
        // Tunggu sedikit untuk memastikan state ter-update
        setTimeout(() => {
          resolve({ success: true, user: userData, token: authToken });
        }, 100); // 100ms delay untuk state sync
      });
      
    } catch (error) {
      console.error('❌ AuthContext: Login error:', error);
      return Promise.reject(error);
    }
  };

  // Fungsi untuk menangani logout - return Promise untuk async handling
  const logout = async () => {
    try {
       // Clear state
      setUser(null);
      setToken(null);
      
      // Clear localStorage
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
       // Return success
      return Promise.resolve();
      
    } catch (error) {
      console.error('❌ AuthContext: Logout error:', error);
      return Promise.reject(error);
    }
  };

  // Fungsi untuk mengecek apakah user sudah login
  const isAuthenticated = () => {
    // Cek berdasarkan state token, lebih cepat daripada baca localStorage terus-menerus
    const authenticated = !!token;
     return authenticated;
  };

  // Fungsi untuk mengecek role user
  const hasRole = (requiredRole) => {
    if (!user || !user.role) {
       return false;
    }
    const hasAccess = user.role === requiredRole;
     return hasAccess;
  };

  // Nilai yang akan disediakan untuk semua komponen di dalamnya
  const value = {
    user,
    token,
    isLoading,
    login,
    logout,
    isAuthenticated,
    hasRole
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};