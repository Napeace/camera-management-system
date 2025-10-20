// src/features/user/UserCreateModal.js - Styled with Password Toggle
import React, { useState, useEffect } from 'react';
import userService from '../../services/userService';
import { XMarkIcon, ExclamationCircleIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

const UserCreateModal = ({ isOpen, onClose, onUserCreated }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  const [shouldShow, setShouldShow] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    nama: '',
    nip: '',
    username: '',
    password: '',
  });

  // Handle animation
  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      setFormData({
        nama: '',
        nip: '',
        username: '',
        password: '',
      });
      setError('');
      setShowPassword(false);
      // Small delay to trigger enter animation
      setTimeout(() => setShouldShow(true), 10);
    } else {
      setShouldShow(false);
      // Delay cleanup to allow exit animation
      const timer = setTimeout(() => setIsAnimating(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const validateForm = () => {
    const { nama, nip, username, password } = formData;
    if (!nama.trim() || !nip.trim() || !username.trim() || !password.trim()) {
      setError('Semua field dengan tanda * wajib diisi');
      return false;
    }
    if (password.length < 6) {
      setError('Password harus minimal 6 karakter');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError('');
    
    try {
      const userData = {
        nama: formData.nama.trim(),
        nip: formData.nip.trim(),
        username: formData.username.trim(),
        password: formData.password,
        id_role: 2
      };

      await userService.createUser(userData);
            
      if (onUserCreated) {
        await onUserCreated();
      }
      
      onClose();
      
    } catch (error) {
      console.error('Create user error:', error);
      setError(error.message || 'Gagal membuat user. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => !loading && onClose();

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !loading) {
      onClose();
    }
  };
  
  if (!isOpen && !isAnimating) return null;

  return (
    <div 
      onClick={handleBackdropClick}
      className={`fixed inset-0 bg-black/70 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-300 ${
        shouldShow ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div 
        className={`bg-gradient-to-b from-slate-50 via-blue-50 to-blue-100 dark:from-slate-950 dark:via-indigo-950 dark:to-indigo-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden transform transition-all duration-300 ${
          shouldShow ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-6 mx-4">
          <h2 className="text-2xl text-gray-900 dark:text-white font-semibold">Tambah User Baru</h2>
          <button 
            onClick={handleClose} 
            disabled={loading} 
            className="text-gray-600 hover:text-gray-900 dark:text-white/70 dark:hover:text-white disabled:opacity-50 transition-colors"
          >
            <XMarkIcon className="w-7 h-7" />
          </button>
        </div>
        
        {/* Border after header */}
        <div className="mx-6 h-1 bg-gray-300 dark:bg-white/10"></div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="bg-red-100 dark:bg-red-500/20 border border-red-300 dark:border-red-400/40 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex items-center">
                <ExclamationCircleIcon className="w-5 h-5 text-red-600 dark:text-red-300 mr-2 flex-shrink-0" />
                <p className="text-sm text-red-700 dark:text-red-200">{error}</p>
              </div>
            </div>
          )}

          <div>
            <label htmlFor="nama" className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
              Nama Lengkap *
            </label>
            <input 
              type="text" 
              id="nama" 
              name="nama" 
              required 
              value={formData.nama} 
              onChange={handleInputChange} 
              disabled={loading}
              className="block w-full px-4 py-3 bg-white dark:bg-white/10 backdrop-blur-sm border border-gray-300 dark:border-white/20 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/50 focus:ring-2 focus:ring-blue-500 dark:focus:ring-white/30 focus:border-blue-500 dark:focus:border-white/30 disabled:opacity-50 transition-all"
              placeholder="Masukkan nama lengkap"
            />
          </div>

          <div>
            <label htmlFor="nip" className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
              NIP *
            </label>
            <input 
              type="text" 
              id="nip" 
              name="nip" 
              required 
              value={formData.nip} 
              onChange={handleInputChange} 
              disabled={loading}
              className="block w-full px-4 py-3 bg-white dark:bg-white/10 backdrop-blur-sm border border-gray-300 dark:border-white/20 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/50 focus:ring-2 focus:ring-blue-500 dark:focus:ring-white/30 focus:border-blue-500 dark:focus:border-white/30 disabled:opacity-50 transition-all"
              placeholder="Masukkan NIP"
            />
          </div>

          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
              Username *
            </label>
            <input 
              type="text" 
              id="username" 
              name="username" 
              required 
              value={formData.username} 
              onChange={handleInputChange} 
              disabled={loading}
              className="block w-full px-4 py-3 bg-white dark:bg-white/10 backdrop-blur-sm border border-gray-300 dark:border-white/20 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/50 focus:ring-2 focus:ring-blue-500 dark:focus:ring-white/30 focus:border-blue-500 dark:focus:border-white/30 disabled:opacity-50 transition-all"
              placeholder="Masukkan username"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
              Password *
            </label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"}
                id="password" 
                name="password" 
                required 
                value={formData.password} 
                onChange={handleInputChange} 
                disabled={loading}
                minLength="6"
                className="block w-full px-4 py-3 pr-12 bg-white dark:bg-white/10 backdrop-blur-sm border border-gray-300 dark:border-white/20 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/50 focus:ring-2 focus:ring-blue-500 dark:focus:ring-white/30 focus:border-blue-500 dark:focus:border-white/30 disabled:opacity-50 transition-all"
                placeholder="Minimal 6 karakter"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white disabled:opacity-50 transition-colors"
              >
                {showPassword ? (
                  <EyeSlashIcon className="w-5 h-5" />
                ) : (
                  <EyeIcon className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Border before buttons */}
          <div className="h-1 bg-gray-300 dark:bg-white/10 mb-6"></div>
          
          {/* Buttons */}
          <div className="pb-6">
            <div className="flex gap-3 justify-end">
              <button
                type="button" 
                onClick={handleClose} 
                disabled={loading}
                className="w-28 px-1 py-3 bg-gray-200 dark:bg-white/10 backdrop-blur-sm border border-gray-300 dark:border-white/20 rounded-xl text-gray-700 dark:text-white font-medium hover:bg-gray-300 dark:hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Batal
              </button>
              <button
                type="submit" 
                disabled={loading}
                className="w-48 px-1 py-3 bg-blue-600 dark:bg-white/10 backdrop-blur-sm border border-blue-600 dark:border-white/20 rounded-xl text-white font-medium hover:bg-blue-700 dark:hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {loading && (
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {loading ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserCreateModal;