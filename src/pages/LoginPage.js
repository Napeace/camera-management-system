import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from '../components/LoginForm';

function LoginPage() {
  const navigate = useNavigate();

  useEffect(() => {
    // Kalau user sudah login, redirect ke dashboard
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/dashboard', { replace: true });
    }
  }, [navigate]);

  const handleLoginSuccess = (userData) => {
    // Simpan data user
    localStorage.setItem('user', JSON.stringify(userData));
    
    // Redirect ke dashboard
    navigate('/dashboard', { replace: true });
  };

  return <LoginForm onLoginSuccess={handleLoginSuccess} />;
}

export default LoginPage;