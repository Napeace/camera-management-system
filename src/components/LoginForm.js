import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
// import { loginUser } from '../services/api'; // Uncomment when API is ready

function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();

  // Mock login function - replace with actual API call
  const mockLoginUser = async (username, password) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock credentials
    const mockUsers = {
      'admin': { 
        username: 'admin', 
        role: 'superadmin', 
        fullName: 'Administrator',
        password: 'admin123' 
      },
      'security': { 
        username: 'security', 
        role: 'security', 
        fullName: 'Security Officer',
        password: 'security123' 
      }
    };
    
    const user = mockUsers[username];
    if (user && user.password === password) {
      return {
        success: true,
        data: {
          access_token: `mock-token-${Date.now()}`,
          user: {
            username: user.username,
            role: user.role,
            fullName: user.fullName
          }
        }
      };
    }
    
    return {
      success: false,
      message: 'Username atau password salah!'
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!username || !password) {
      setError('Username dan password harus diisi!');
      return;
    }

    setIsLoading(true);
    
    try {
      // Use mock function for now - replace with actual API call
      const result = await mockLoginUser(username, password);
      // const result = await loginUser(username, password); // Use this for actual API
      
      if (result.success) {
        // Use AuthContext login function
        login(result.data.user, result.data.access_token);
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError('Terjadi kesalahan saat login. Silakan coba lagi.');
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = (userType) => {
    if (userType === 'admin') {
      setUsername('admin');
      setPassword('admin123');
    } else {
      setUsername('security');
      setPassword('security123');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header Card */}
        <div className="bg-white rounded-t-2xl px-8 pt-8 pb-4 shadow-xl">
          <div className="text-center">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🏥</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              CCTV Management
            </h1>
            <p className="text-gray-600 text-sm">
              Hospital Security System
            </p>
          </div>
        </div>
        
        {/* Form Card */}
        <div className="bg-white rounded-b-2xl px-8 pb-8 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Masukkan username"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-400">👤</span>
                </div>
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Masukkan password"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-400">🔒</span>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
                <span className="text-red-500">⚠️</span>
                <span className="text-red-700 text-sm">{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full flex items-center justify-center px-4 py-3 rounded-lg font-medium text-white transition-all duration-200 ${
                isLoading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg transform hover:-translate-y-0.5'
              }`}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Memproses...
                </>
              ) : (
                <>
                  <span className="mr-2">🔐</span>
                  Login
                </>
              )}
            </button>
          </form>

          {/* Test Credentials */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3">
                Quick Login:
              </h4>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => handleQuickLogin('admin')}
                  className="w-full text-left flex justify-between items-center p-2 rounded hover:bg-gray-100 transition-colors"
                >
                  <span className="text-sm text-gray-600">Superadmin:</span>
                  <code className="bg-gray-200 px-2 py-1 rounded text-xs">admin / admin123</code>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickLogin('security')}
                  className="w-full text-left flex justify-between items-center p-2 rounded hover:bg-gray-100 transition-colors"
                >
                  <span className="text-sm text-gray-600">Security:</span>
                  <code className="bg-gray-200 px-2 py-1 rounded text-xs">security / security123</code>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginForm;