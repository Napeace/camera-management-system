// src/components/user/UserEditModal.js
import React, { useState, useEffect } from 'react';

const UserEditModal = ({ isOpen, onClose, onSave, onUserUpdated, userToEdit }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    nama: '',
    nip: '',
    username: '',
    password: '',
  });

  useEffect(() => {
    if (isOpen && userToEdit) {
      setFormData({
        nama: userToEdit.nama || '',
        nip: String(userToEdit.nip || ''), // Convert to string
        username: userToEdit.username || '',
        password: '',
      });
      setError('');
    }
  }, [isOpen, userToEdit]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Validate required fields
      if (!formData.nama.trim() || !formData.nip.trim() || !formData.username.trim()) {
        setError('Full Name, NIP, and Username are required');
        setLoading(false);
        return;
      }

      const userData = {
        nama: String(formData.nama).trim(),
        nip: String(formData.nip).trim(), // Ensure it's string and trim
        username: String(formData.username).trim(),
      };
      
      // Only include password if it's provided
      if (formData.password) {
        if (formData.password.length < 6) {
          setError('Password must be at least 6 characters');
          setLoading(false);
          return;
        }
        userData.password = formData.password;
      }
      
      // Panggil fungsi onSave dari props
      if (onSave) {
        await onSave(userToEdit.id_user, userData);
      }

      // Tutup modal setelah berhasil
      onClose();

      // Panggil callback untuk menampilkan toast dan refresh data
      if (onUserUpdated) {
        onUserUpdated(userData); // Toast akan muncul di sini
      }
            
    } catch (error) {
      console.error('Update user error:', error);
      setError(error.message || 'Failed to update user.');
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
          <h2 className="text-xl font-semibold text-gray-900">Edit User: {userToEdit?.nama}</h2>
          <button onClick={handleClose} disabled={loading} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
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
            <input 
              type="text" 
              id="nama"
              name="nama" 
              required 
              value={formData.nama} 
              onChange={handleInputChange} 
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              disabled={loading} 
            />
          </div>
          
          <div>
            <label htmlFor="nip" className="block text-sm font-medium text-gray-700 mb-1">NIP *</label>
            <input 
              type="text" 
              id="nip"
              name="nip" 
              required 
              value={formData.nip} 
              onChange={handleInputChange} 
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              disabled={loading} 
            />
          </div>
          
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">Username *</label>
            <input 
              type="text" 
              id="username"
              name="username" 
              required 
              value={formData.username} 
              onChange={handleInputChange} 
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              disabled={loading} 
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <input 
              type="password" 
              id="password"
              name="password" 
              value={formData.password} 
              onChange={handleInputChange} 
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              placeholder="Leave blank to keep current password" 
              minLength="6" 
              disabled={loading} 
            />
            <p className="text-xs text-gray-500 mt-1">Leave blank to keep current password</p>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button 
              type="button" 
              onClick={handleClose} 
              disabled={loading} 
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading} 
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserEditModal;