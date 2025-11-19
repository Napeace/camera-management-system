// src/features/user/UserCreateModal.js - Styled with Password Toggle
import React, { useState, useEffect } from 'react';
import userService from '../../../services/userService';
import { XMarkIcon, ExclamationCircleIcon, EyeIcon, EyeSlashIcon, UserIcon } from '@heroicons/react/24/outline';

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
      setTimeout(() => setShouldShow(true), 10);
    } else {
      setShouldShow(false);
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
      {/* Outer Container */}
      <div 
        className={`rounded-lg shadow-2xl max-w-md w-full overflow-hidden bg-white dark:bg-gradient-to-b dark:from-slate-950 dark:to-blue-800 border border-blue-300 dark:border-slate-800 p-5 transform transition-all duration-300 ${
          shouldShow ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      >
        {/* Inner Container */}
        <div className="bg-gray-50/80 dark:bg-white/5 backdrop-blur-sm rounded-lg p-5 space-y-4">
          
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 flex items-center justify-center bg-blue-100 dark:bg-blue-800/30 border border-blue-300 dark:border-blue-400/30 rounded-lg">
                <UserIcon className="w-5 h-5 text-blue-600 dark:text-blue-300" />
              </div>
              <h2 className="text-xl text-gray-900 dark:text-white font-semibold">Tambah Pengguna Baru</h2>
            </div>
            <button 
              onClick={handleClose} 
              disabled={loading} 
              className="text-gray-600 dark:text-white/70 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-white/10 rounded-lg p-1.5 disabled:opacity-50 transition-all"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
          
          {/* Border separator */}
          <div className="h-px bg-gray-200 dark:bg-white/10"></div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-100 dark:bg-red-500/20 border border-red-300 dark:border-red-400/40 rounded-lg p-4">
                <div className="flex items-center">
                  <ExclamationCircleIcon className="w-5 h-5 text-red-600 dark:text-red-300 mr-2 flex-shrink-0" />
                  <div className="text-sm text-red-700 dark:text-red-200 whitespace-pre-line">
                    {error}
                  </div>
                </div>
              </div>
            )}

            {/* Nama Lengkap */}
            <div>
              <label htmlFor="nama" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                Nama Lengkap <span className="text-red-500">*</span>
              </label>
              <input 
                type="text" 
                id="nama" 
                name="nama" 
                required 
                value={formData.nama} 
                onChange={handleInputChange} 
                disabled={loading}
                className="block w-full px-4 py-3 bg-gray-50 dark:bg-white/15 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-white/50 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 disabled:opacity-50 transition-all"
                placeholder="Masukkan nama lengkap"
              />
            </div>

            {/* NIP */}
            <div>
              <label htmlFor="nip" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                NIP <span className="text-red-500">*</span>
              </label>
              <input 
                type="text" 
                id="nip" 
                name="nip" 
                required 
                value={formData.nip} 
                onChange={handleInputChange} 
                disabled={loading}
                className="block w-full px-4 py-3 bg-gray-50 dark:bg-white/15 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-white/50 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 disabled:opacity-50 transition-all"
                placeholder="Masukkan NIP"
              />
            </div>

            {/* Username */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                Username <span className="text-red-500">*</span>
              </label>
              <input 
                type="text" 
                id="username" 
                name="username" 
                required 
                value={formData.username} 
                onChange={handleInputChange} 
                disabled={loading}
                className="block w-full px-4 py-3 bg-gray-50 dark:bg-white/15 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-white/50 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 disabled:opacity-50 transition-all"
                placeholder="Masukkan username"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                Password <span className="text-red-500">*</span>
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
                  className="block w-full px-4 py-3 pr-12 bg-gray-50 dark:bg-white/15 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-white/50 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 disabled:opacity-50 transition-all"
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
          </form>
        </div>

        {/* Buttons - Outside Inner Container */}
        <div className="flex gap-3 justify-end mt-4">
          <button
            type="button" 
            onClick={handleClose} 
            disabled={loading}
            className="px-6 py-2.5 bg-gray-300 dark:bg-gray-400/30 rounded-lg text-gray-700 dark:text-gray-200 text-sm font-medium hover:bg-gray-400 dark:hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Batal
          </button>
          <button
            type="submit" 
            onClick={handleSubmit}
            disabled={loading}
            className="px-8 py-2.5 bg-gray-300 dark:bg-gray-400/30 rounded-lg text-gray-700 dark:text-gray-200 text-sm font-medium hover:bg-gray-400 dark:hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {loading && (
              <svg className="animate-spin h-5 w-5 text-gray-700 dark:text-gray-200" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {loading ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserCreateModal;