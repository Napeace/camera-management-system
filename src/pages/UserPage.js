// pages/UserPage.js
import React, { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import MainLayout from '../components/layout/MainLayout';
import Sidebar from '../components/layout/Sidebar';
import UserList from '../features/user/UserList';
import UserCreateModal from '../features/user/UserCreateModal';
import UserEditModal from '../features/user/UserEditModal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import useUsers from '../hooks/useUsers';

// Isolated components to prevent re-renders
const SearchInput = React.memo(({ value, onChange, placeholder }) => (
  <input 
    type="text" 
    placeholder={placeholder} 
    value={value} 
    onChange={onChange} 
    className="block w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
  />
));

const RoleSelect = React.memo(({ value, onChange }) => (
  <select 
    value={value} 
    onChange={onChange} 
    className="block w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
  >
    <option value="">All Roles</option>
    <option value="SuperAdmin">Super Admin</option>
    <option value="Security">Security</option>
  </select>
));

const UserPage = () => {
  const { user, logout } = useAuth();
  const { showSuccess, showError, showWarning, showInfo } = useToast();
  const navigate = useNavigate();
  
  // Local UI states
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  
  // Confirm dialog states
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    type: 'danger',
    title: '',
    message: '',
    user: null,
    action: null, // 'soft-delete', 'hard-delete', 'logout'
    loading: false
  });
  
  const { 
    users, 
    loading, 
    error, 
    updateUser,
    softDeleteUser,
    hardDeleteUser,
    fetchUsers,
  } = useUsers();

  // Memoized filtered users
  const filteredUsers = useMemo(() => {
    let filtered = users;

    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(user => 
        (user.nama && user.nama.toLowerCase().includes(searchLower)) ||
        (user.username && user.username.toLowerCase().includes(searchLower)) ||
        (user.nip && String(user.nip).toLowerCase().includes(searchLower))
      );
    }

    if (roleFilter) {
      filtered = filtered.filter(user => user.user_role_name === roleFilter);
    }

    return filtered;
  }, [users, searchTerm, roleFilter]);

  // Stable event handlers
  const handleLogout = useCallback(() => {
    setConfirmDialog({
      isOpen: true,
      type: 'warning',
      title: 'Confirm Logout',
      message: 'Are you sure you want to logout? You will need to login again to access the system.',
      user: null,
      action: 'logout',
      loading: false
    });
  }, []);

  const handlePageChange = useCallback((pageId, path) => {
    navigate(path);
  }, [navigate]);

  const handleSearch = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  const handleRoleFilter = useCallback((e) => {
    setRoleFilter(e.target.value);
  }, []);

  const handleClearFilters = useCallback(() => {
    setSearchTerm('');
    setRoleFilter('');
    showInfo('Filters Cleared', 'All filters have been reset');
  }, [showInfo]);

  const handleAddUser = useCallback(() => {
    setShowCreateModal(true);
  }, []);

  const handleEditUser = useCallback((userToEdit) => {
    setEditingUser(userToEdit);
    setShowEditModal(true);
  }, []);

  const handleDeleteUser = useCallback((userToDelete, isHard = false) => {
    const actionType = isHard ? 'hard-delete' : 'soft-delete';
    const title = isHard ? 'Permanently Delete User' : 'Delete User';
    const message = isHard 
      ? 'This action cannot be undone. The user and all associated data will be permanently removed from the system.'
      : 'This user will be deactivated and can be restored later if needed.';
    
    setConfirmDialog({
      isOpen: true,
      type: 'danger',
      title: title,
      message: message,
      user: userToDelete,
      action: actionType,
      loading: false
    });
  }, []);

  // Handle confirm dialog actions
  const handleConfirmAction = useCallback(async () => {
    const { action, user } = confirmDialog;
    console.log('Confirm action triggered:', action, user);
    
    setConfirmDialog(prev => ({ ...prev, loading: true }));
    
    try {
      switch (action) {
        case 'logout':
          showWarning('Logging out...', 'You will be redirected to login page');
          setTimeout(() => {
            logout();
            window.location.href = '/login';
          }, 1000);
          break;
          
        case 'soft-delete':
          await softDeleteUser(user.id_user);
          setConfirmDialog({ isOpen: false, type: 'danger', title: '', message: '', user: null, action: null, loading: false });
          showSuccess('User Deleted', `${user.nama} has been successfully deactivated`);
          break;
          
        case 'hard-delete':
          await hardDeleteUser(user.id_user);
          setConfirmDialog({ isOpen: false, type: 'danger', title: '', message: '', user: null, action: null, loading: false });
          showSuccess('User Permanently Deleted', `${user.nama} has been permanently removed from the system`);
          break;
          
        default:
          console.log('Unknown action:', action);
          setConfirmDialog({ isOpen: false, type: 'danger', title: '', message: '', user: null, action: null, loading: false });
          break;
      }
    } catch (err) {
      console.error('Action failed:', err);
      setConfirmDialog(prev => ({ ...prev, loading: false }));
      showError('Action Failed', err.message || 'An error occurred while processing your request');
    }
  }, [confirmDialog, logout, softDeleteUser, hardDeleteUser, showSuccess, showError, showWarning]);

  const handleCloseConfirmDialog = useCallback(() => {
    if (!confirmDialog.loading) {
      setConfirmDialog({
        isOpen: false,
        type: 'danger',
        title: '',
        message: '',
        user: null,
        action: null,
        loading: false
      });
    }
  }, [confirmDialog.loading]);
  
  const handleModalClose = useCallback(() => {
    setShowCreateModal(false);
    setShowEditModal(false);
    setEditingUser(null);
  }, []);

  const handleUserCreated = useCallback(async (newUser) => {
    try {
      await fetchUsers();
      showSuccess(
        'User Created Successfully', 
        `${newUser?.nama || 'New user'} has been created`
      );
    } catch (error) {
      console.error('Error refreshing data:', error);
      showError('Refresh Failed', 'Failed to refresh user list');
    }
  }, [fetchUsers, showSuccess, showError]);

  const handleUserUpdated = useCallback(async (updatedUser) => {
    try {
      await fetchUsers();
      showSuccess('User Updated', `${updatedUser?.nama || 'User'} has been successfully updated`);
    } catch (error) {
      console.error('Error refreshing data:', error);
      showError('Refresh Failed', 'Failed to refresh user list');
    }
  }, [fetchUsers, showSuccess, showError]);

  const hasActiveFilters = searchTerm || roleFilter;

  const stats = useMemo(() => ({
    total: filteredUsers.length,
    superAdmins: filteredUsers.filter(u => u.user_role_name === 'SuperAdmin').length,
    security: filteredUsers.filter(u => u.user_role_name === 'Security').length
  }), [filteredUsers]);

  // Get confirm button text based on action
  const getConfirmButtonText = () => {
    switch (confirmDialog.action) {
      case 'logout':
        return 'Logout';
      case 'soft-delete':
        return 'Delete';
      case 'hard-delete':
        return 'Permanently Delete';
      default:
        return 'Confirm';
    }
  };

  return (
    <>
      <MainLayout 
        user={user} 
        Sidebar={(props) => (
          <Sidebar 
            {...props}
            user={user}
            onLogout={handleLogout}
            onPageChange={handlePageChange}
          />
        )}
      >
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
              <p className="text-gray-600 mt-1">Manage system users and their roles</p>
            </div>
            <div className="flex items-center space-x-3">
              <button 
                onClick={handleAddUser} 
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
              >
                Tambah User
              </button>
            </div>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <p className="text-sm">Total Users</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <p className="text-sm">Super Admins</p>
              <p className="text-2xl font-bold">{stats.superAdmins}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <p className="text-sm">Security Staff</p>
              <p className="text-2xl font-bold">{stats.security}</p>
            </div>
          </div>
          
          {/* Filters */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-2">Search Users</label>
                <SearchInput 
                  value={searchTerm}
                  onChange={handleSearch}
                  placeholder="Search by name, username, or NIP..."
                />
              </div>
              <div className="sm:w-48">
                <label className="block text-sm font-medium mb-2">Filter by Role</label>
                <RoleSelect 
                  value={roleFilter}
                  onChange={handleRoleFilter}
                />
              </div>
              {hasActiveFilters && (
                <div className="sm:w-32 flex items-end">
                  <button 
                    onClick={handleClearFilters} 
                    className="w-full px-4 py-2 text-gray-600 border rounded-lg hover:bg-gray-50"
                  >
                    Clear
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {/* User List */}
          <UserList 
            users={filteredUsers}
            loading={loading} 
            error={error} 
            onEdit={handleEditUser}
            onDelete={handleDeleteUser} 
          />
        </div>
      </MainLayout>

      {/* Modals */}
      <UserCreateModal 
        isOpen={showCreateModal}
        onClose={handleModalClose}
        onUserCreated={handleUserCreated}
      />
      
      <UserEditModal 
        isOpen={showEditModal}
        onClose={handleModalClose}
        onSave={updateUser}
        onUserUpdated={handleUserUpdated}
        userToEdit={editingUser}
      />

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={handleCloseConfirmDialog}
        onConfirm={handleConfirmAction}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText={getConfirmButtonText()}
        cancelText="Cancel"
        type={confirmDialog.type}
        loading={confirmDialog.loading}
        itemName={confirmDialog.user?.nama}
      />
    </>
  );
};

export default UserPage;