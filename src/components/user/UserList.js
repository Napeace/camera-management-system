// components/user/UserList.js
import React, { useState } from 'react';

const UserList = ({ users, loading, error, onRefresh, onEdit, onDelete }) => {
  const [actionLoading, setActionLoading] = useState({});
  
  // Format date
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  // Get role badge color
  const getRoleBadgeColor = (roleName) => {
    switch (roleName) {
      case 'Super Admin':
      case 'Admin':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Security':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'User':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-purple-100 text-purple-800 border-purple-200';
    }
  };

  // Get status badge color
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Handle edit action
  const handleEdit = (user) => {
    if (onEdit) {
      onEdit(user);
    } else {
      console.log('Edit user:', user);
      // Default action - could navigate to edit page
      alert(`Edit functionality not implemented for user: ${user.nama || user.name || user.username}`);
    }
  };

  // Handle delete action
  const handleDelete = async (user, isHard = false) => {
    const deleteType = isHard ? 'permanently delete' : 'soft delete';
    const userName = user.nama || user.name || user.username;
    
    if (!window.confirm(`Are you sure you want to ${deleteType} user "${userName}"?`)) {
      return;
    }

    try {
      setActionLoading(prev => ({ ...prev, [`${user.id}_${isHard ? 'hard' : 'soft'}`]: true }));
      
      if (onDelete) {
        await onDelete(user.id, isHard);
      } else {
        // Default action
        console.log(`${deleteType} user:`, user);
        alert(`Delete functionality not implemented for user: ${userName}`);
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert(`Failed to ${deleteType} user: ${error.message}`);
    } finally {
      setActionLoading(prev => ({ ...prev, [`${user.id}_${isHard ? 'hard' : 'soft'}`]: false }));
    }
  };

  // Loading state
  if (loading && users.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex space-x-4">
                  <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Users</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={onRefresh}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50"
          >
            <svg className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Empty state
  if (!users || users.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 text-center">
          <div className="text-gray-400 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Users Found</h3>
          <p className="text-gray-600">No users match your current filters.</p>
        </div>
      </div>
    );
  }

  // Table view
  return (
    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
      {/* Loading overlay */}
      {loading && users.length > 0 && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Updating...</p>
          </div>
        </div>
      )}
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Username
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => {
              const userName = user.nama || user.name || user.username || 'Unknown';
              const userEmail = user.email || '';
              const userNip = user.nip || '';
              const userRole = user.role?.name || user.role || 'User';
              const userStatus = user.status || 'active';
              const createdAt = user.created_at || user.createdAt || new Date().toISOString();
              
              return (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors duration-150">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 bg-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-medium text-sm">
                            {userName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{userName}</div>
                        {userEmail && <div className="text-xs text-gray-500">{userEmail}</div>}
                        {userNip && <div className="text-xs text-gray-500 font-mono">NIP: {userNip}</div>}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 font-mono">{user.username}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRoleBadgeColor(userRole)}`}>
                      {userRole}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadgeColor(userStatus)}`}>
                      <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${userStatus === 'active' ? 'bg-green-400' : 'bg-red-400'}`}></div>
                      {userStatus === 'active' ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                    <div className="flex justify-center items-center space-x-3">
                      <button 
                        onClick={() => handleEdit(user)}
                        className="text-indigo-600 hover:text-indigo-900 transition-colors"
                        title="Edit User"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button 
                        onClick={() => handleDelete(user, false)}
                        disabled={actionLoading[`${user.id}_soft`]}
                        className="text-yellow-600 hover:text-yellow-900 transition-colors disabled:opacity-50"
                        title="Soft Delete User"
                      >
                        {actionLoading[`${user.id}_soft`] ? (
                          <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        )}
                      </button>
                      <button 
                        onClick={() => handleDelete(user, true)}
                        disabled={actionLoading[`${user.id}_hard`]}
                        className="text-red-600 hover:text-red-900 transition-colors disabled:opacity-50"
                        title="Permanently Delete User"
                      >
                        {actionLoading[`${user.id}_hard`] ? (
                          <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(createdAt)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {/* Table Footer */}
      <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing <span className="font-medium">{users.length}</span> users
          </div>
          <div className="text-sm text-gray-500">
            Total: {users.length} users
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserList;