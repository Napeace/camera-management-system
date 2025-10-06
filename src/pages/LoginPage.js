// pages/LoginPage.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import authService from '../services/authService';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

// Array kalimat motivasi
const motivationalQuotes = [
  "Keamanan dimulai dari kewaspadaan kita!",
  "Pantau, Lindungi, dan Jaga Keamanan Bersama",
  "Setiap detik adalah momen untuk menjaga keamanan",
  "Bersama kita ciptakan lingkungan yang aman",
  "Teknologi menjaga, kita yang mengawasi",
  "Keamanan adalah prioritas utama kami",
  "Awasi hari ini, amankan masa depan",
  "Satu sistem, satu tujuan: Keamanan maksimal",
  "Monitoring cerdas untuk perlindungan optimal",
  "Kewaspadaan adalah kunci keamanan terbaik"
];

function LoginPage() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, login: authLogin } = useAuth();
  
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [motivationalQuote, setMotivationalQuote] = useState('');
  const [lastQuoteIndex, setLastQuoteIndex] = useState(-1);
  const [quoteVisible, setQuoteVisible] = useState(true);

  useEffect(() => {
    // Fungsi untuk mendapatkan index random yang berbeda dari sebelumnya
    const getRandomDifferentIndex = (currentIndex) => {
      let newIndex;
      do {
        newIndex = Math.floor(Math.random() * motivationalQuotes.length);
      } while (newIndex === currentIndex && motivationalQuotes.length > 1);
      return newIndex;
    };

    // Pilih kalimat motivasi random pertama kali
    const randomIndex = getRandomDifferentIndex(-1);
    setMotivationalQuote(motivationalQuotes[randomIndex]);
    setLastQuoteIndex(randomIndex);

    if (!isLoading && isAuthenticated()) {
      navigate('/dashboard');
    }
    
    // Trigger animation on mount
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);
    
    // Ganti kalimat motivasi setiap 3 detik dengan animasi
    const quoteInterval = setInterval(() => {
      // Fade out
      setQuoteVisible(false);
      
      // Setelah fade out selesai, ganti quote dan fade in
      setTimeout(() => {
        setLastQuoteIndex(prevIndex => {
          const newIndex = getRandomDifferentIndex(prevIndex);
          setMotivationalQuote(motivationalQuotes[newIndex]);
          return newIndex;
        });
        setQuoteVisible(true);
      }, 300);
    }, 3000);
    
    return () => {
      clearTimeout(timer);
      clearInterval(quoteInterval);
    };
  }, [navigate, isAuthenticated, isLoading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.username.trim() || !formData.password.trim()) {
      setError('Please enter both username and password');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const result = await authService.login(formData);
      
      if (result.success) {
        authLogin(result.user, result.token);
        
        if (result.user.role === 'superadmin') {
          navigate('/dashboard');
        } else if (result.user.role === 'security') {
          navigate('/dashboard-security');
        } else {
          navigate('/');
        }
      } else {
        setError(result.message || 'Login failed. Please check your credentials.');
      }
    } catch (error) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Login handleSubmit error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };
  
  return (
    <div 
      className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden"
      style={{
        backgroundImage: 'url(/icons/login.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Overlay untuk membuat background lebih gelap */}
      <div className="absolute inset-0 bg-black/40"></div>
      
      <div className={`max-w-md w-full space-y-8 transition-all duration-700 ease-out transform relative z-10 ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
      }`}>
        {/* Header Section dengan Logo */}
        <div className={`text-center transition-all duration-700 delay-200 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
        }`}>
          {/* Logo CCTV - dibuat lebih besar */}
          <div className="mx-auto mb-6">
            <img 
              src="/icons/logo.svg" 
              alt="CCTV Logo"
              className="w-80 h-32 mx-auto object-contain drop-shadow-lg"
            />
          </div>
          <h2 className="text-3xl font-bold text-white animate-fade-in drop-shadow-lg">Selamat Datang!</h2>
          
          {/* Kalimat Motivasi Random dengan animasi */}
          <p className={`mt-3 text-lg text-white/90 font-medium drop-shadow-md transition-all duration-300 ${
            quoteVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
          }`}>
            {motivationalQuote}
          </p>
        </div>

        {/* Form Section */}
        <div className={`transition-all duration-700 delay-300 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
        }`}>
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Error Message */}
            {error && (
              <div className="bg-red-500/20 backdrop-blur border-l-4 border-red-400 p-4 rounded-md animate-shake">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-200">{error}</p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Username Input */}
            <div className="group animate-slide-up-delay-200">
              <input 
                id="username" 
                name="username" 
                type="text" 
                required 
                value={formData.username} 
                onChange={handleInputChange} 
                className="block w-full px-4 py-3 bg-white/90 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-purple-400 focus:border-purple-400 focus:bg-white transition-all duration-200 hover:border-gray-400 shadow-md" 
                placeholder="Username" 
                autoFocus
              />
            </div>

            {/* Password Input */}
            <div className="group animate-slide-up-delay-300">
              <div className="relative">
                <input 
                  id="password" 
                  name="password" 
                  type={showPassword ? "text" : "password"} 
                  required 
                  value={formData.password} 
                  onChange={handleInputChange} 
                  className="block w-full px-4 py-3 pr-12 bg-white/90 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-purple-400 focus:border-purple-400 focus:bg-white transition-all duration-200 hover:border-gray-400 shadow-md" 
                  placeholder="Password" 
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:ring-opacity-50 rounded-full p-1"
                >
                  <div className="relative w-5 h-5 overflow-hidden">
                    <EyeIcon 
                      className={`absolute inset-0 w-5 h-5 transition-all duration-300 ease-in-out transform ${
                        showPassword 
                          ? 'opacity-0 scale-75 rotate-12' 
                          : 'opacity-100 scale-100 rotate-0'
                      }`} 
                    />
                    <EyeSlashIcon 
                      className={`absolute inset-0 w-5 h-5 transition-all duration-300 ease-in-out transform ${
                        showPassword 
                          ? 'opacity-100 scale-100 rotate-0' 
                          : 'opacity-0 scale-75 -rotate-12'
                      }`} 
                    />
                  </div>
                </button>
              </div>
            </div>
            
            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={loading} 
              className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 ease-in-out transform hover:scale-[1.02] active:scale-[0.98] focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 animate-slide-up-delay-300 shadow-lg hover:shadow-xl"
            >
              {loading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Masuk...
                </div>
              ) : (
                'Masuk'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;