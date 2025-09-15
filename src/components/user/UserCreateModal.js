// src/components/user/UserCreateModal.js
import React, { useState, useEffect } from 'react';
import userService from '../../services/userService';

const UserCreateModal = ({ isOpen, onClose, onUserCreated }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    nama: '',
    nip: '',
    username: '',
    password: '',
    confirmPassword: '',
  });

  // Reset form saat modal terbuka
  useEffect(() => {
    if (isOpen) {
      setFormData({
        nama: '',
        nip: '',
        username: '',
        password: '',
        confirmPassword: '',
      });
      setError('');
    }
  }, [isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const validateForm = () => {
    const { nama, nip, username, password, confirmPassword } = formData;
    if (!nama.trim() || !nip.trim() || !username.trim() || !password.trim()) {
      setError('All fields with * are required');
      return false;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
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
      // Siapkan data untuk dikirim ke API
      const userData = {
        nama: formData.nama.trim(),
        nip: formData.nip.trim(),
        username: formData.username.trim(),
        password: formData.password,
        id_role: 2 // <-- PERUBAHAN UTAMA: Role di-hardcode menjadi 2 (Security)
      };

      await userService.createUser(userData);
      
      alert('User created successfully with Security role!');
      if (onUserCreated) onUserCreated();
      onClose();
      
    } catch (error) {
      console.error('Create user error:', error);
      setError(error.message || 'Failed to create user. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => !loading && onClose();
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Create New User</h2>
          <button onClick={handleClose} disabled={loading} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Form Fields */}
          <div>
            <label htmlFor="nama" className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
            <input type="text" id="nama" name="nama" required value={formData.nama} onChange={handleInputChange} className="block w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="Enter full name" disabled={loading} />
          </div>
          <div>
            <label htmlFor="nip" className="block text-sm font-medium text-gray-700 mb-1">NIP *</label>
            <input type="text" id="nip" name="nip" required value={formData.nip} onChange={handleInputChange} className="block w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="Enter NIP" disabled={loading} />
          </div>
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">Username *</label>
            <input type="text" id="username" name="username" required value={formData.username} onChange={handleInputChange} className="block w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="Enter username" disabled={loading} />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
            <input type="password" id="password" name="password" required value={formData.password} onChange={handleInputChange} className="block w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="Enter password" minLength="6" disabled={loading} />
            <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">Confirm Password *</label>
            <input type="password" id="confirmPassword" name="confirmPassword" required value={formData.confirmPassword} onChange={handleInputChange} className="block w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="Confirm password" disabled={loading} />
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button type="button" onClick={handleClose} disabled={loading} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
              {loading ? 'Creating...' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserCreateModal;