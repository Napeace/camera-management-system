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
      }
    } catch (error) {
      console.error('Failed to parse auth data from localStorage', error);
      // Bersihkan jika data rusak
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
    } finally {
      setIsLoading(false); // Selesai loading, apapun hasilnya
    }
  }, []); // Hanya berjalan sekali saat komponen pertama kali mount

  // Fungsi untuk menangani login
  const login = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('access_token', authToken);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  // Fungsi untuk menangani logout
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
  };

  // Fungsi untuk mengecek apakah user sudah login
  const isAuthenticated = () => {
    // Cek berdasarkan state token, lebih cepat daripada baca localStorage terus-menerus
    return !!token;
  };

  // Fungsi untuk mengecek role user
  const hasRole = (requiredRole) => {
    if (!user || !user.role) return false;
    return user.role === requiredRole;
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