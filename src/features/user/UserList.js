// components/user/UserList.js
import React, { useState } from 'react';

const UserList = ({ users, loading, error, onRefresh, onEdit, onDelete }) => {
  const [actionLoading, setActionLoading] = useState({});
  
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return 'Invalid Date';
    }
  };

  const getRoleBadgeColor = (roleName) => {
    switch (roleName) {
      case 'SuperAdmin': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Admin': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Security': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleEdit = (user) => onEdit && onEdit(user);
  
  // FIXED: Remove window.confirm and pass user object instead of user ID
  const handleDelete = (user, isHard = false) => {
    console.log('UserList handleDelete called with:', user, isHard);
    
    // Langsung panggil onDelete tanpa confirmation (confirmation handled di parent)
    if (onDelete) {
      onDelete(user, isHard); // Pass user object, not user.id_user
    }
  };

  // =======================================================
  // === KODE YANG SEBELUMNYA HILANG DIKEMBALIKAN DI SINI ===
  // =======================================================

  // 1. Tampilkan skeleton loader jika sedang loading & data belum ada
  if (loading && users.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded w-full"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 2. Tampilkan pesan error jika ada masalah
  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
        <h3 className="text-lg font-medium text-red-600 mb-2">Error Loading Users</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <button onClick={onRefresh} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Try Again
        </button>
      </div>
    );
  }
  // =======================================================

  // 3. Tampilkan pesan "No Users" jika data benar-benar kosong
  if (!users || users.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Users Found</h3>
        <p className="text-gray-600">No users match your current filters.</p>
      </div>
    );
  }

  // 4. Jika semua aman, tampilkan tabel
  return (
    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Username</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id_user} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{user.nama}</div>
                      <div className="text-xs text-gray-500 font-mono">NIP: {user.nip}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 font-mono">{user.username}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(user.user_role_name)}`}>
                    {user.user_role_name}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                  <div className="flex justify-center items-center space-x-3">
                    <button 
                      onClick={() => handleEdit(user)} 
                      className="text-indigo-600 hover:text-indigo-900" 
                      title="Edit User"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                      </svg>
                    </button>
                    
                    {/* Hard Delete Button */}
                    <button 
                      onClick={() => handleDelete(user, true)} 
                      className="text-red-600 hover:text-red-900" 
                      title="Permanently Delete User"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                      </svg>
                    </button>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(user.created_at)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserList;