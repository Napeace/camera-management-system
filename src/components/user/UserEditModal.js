// src/components/user/UserEditModal.js
import React, { useState, useEffect } from 'react';

const UserEditModal = ({ isOpen, onClose, onSave, userToEdit }) => {
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
        nip: userToEdit.nip || '',
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
      const userData = {
        nama: formData.nama.trim(),
        nip: formData.nip.trim(),
        username: formData.username.trim(),
      };
      
      if (formData.password) {
        if (formData.password.length < 6) {
          setError('Password must be at least 6 characters');
          setLoading(false);
          return;
        }
        userData.password = formData.password;
      }
      
      // Panggil fungsi onSave dari props, bukan userService langsung
      if (onSave) {
        await onSave(userToEdit.id_user, userData);
      }
      
      onClose(); // Tutup modal setelah sukses
      
    } catch (error) {
      console.error('Update user error:', error);
      setError(error.message || 'Failed to update user.');
    } finally {
      setLoading(false);
    }
  };
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Edit User: {userToEdit?.nama}</h2>
          <button onClick={onClose} disabled={loading} className="text-gray-400 hover:text-gray-600">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="bg-red-100 text-red-700 p-3 rounded">{error}</div>}
          <div>
            <label>Full Name *</label>
            <input type="text" name="nama" required value={formData.nama} onChange={handleInputChange} className="block w-full mt-1 p-2 border rounded" disabled={loading} />
          </div>
          <div>
            <label>NIP *</label>
            <input type="text" name="nip" required value={formData.nip} onChange={handleInputChange} className="block w-full mt-1 p-2 border rounded" disabled={loading} />
          </div>
          <div>
            <label>Username *</label>
            <input type="text" name="username" required value={formData.username} onChange={handleInputChange} className="block w-full mt-1 p-2 border rounded" disabled={loading} />
          </div>
          <div>
            <label>New Password</label>
            <input type="password" name="password" value={formData.password} onChange={handleInputChange} className="block w-full mt-1 p-2 border rounded" placeholder="Leave blank to keep current password" minLength="6" disabled={loading} />
          </div>
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button type="button" onClick={onClose} disabled={loading} className="px-4 py-2 border rounded">Cancel</button>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserEditModal;