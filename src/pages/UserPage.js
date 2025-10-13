// pages/UserPage.js
import React, { useState, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion'; // 1. Impor motion
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import MainLayout from '../components/layout/MainLayout';
import Sidebar from '../components/layout/Sidebar';
import UserList from '../features/user/UserList';
import UserCreateModal from '../features/user/UserCreateModal';
import UserEditModal from '../features/user/UserEditModal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import useUsers from '../hooks/useUsers';
import userService from '../services/userService';

// Isolated components to prevent re-renders
const SearchInput = React.memo(({ value, onChange, placeholder }) => (
  <input 
    type="text" 
    placeholder={placeholder} 
    value={value} 
    onChange={onChange} 
    className="block w-full p-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
  />
));

const RoleSelect = React.memo(({ value, onChange }) => (
  <select 
    value={value} 
    onChange={onChange} 
    className="block w-full p-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
  >
    <option value="">All Roles</option>
    <option value="SuperAdmin">Super Admin</option>
    <option value="Security">Security</option>
  </select>
));

const UserPage = () => {
  const { user } = useAuth();
  const { showSuccess, showError, showInfo } = useToast();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  // Local UI states
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  
  // Confirm dialog states
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    type: 'danger',
    title: '',
    message: '',
    user: null,
    action: null,
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

  // Helper function to extract error message
  const extractErrorMessage = (error) => {
    console.log('Extracting error from:', error);
    
    if (error?.response?.data?.message) {
      return error.response.data.message;
    }
    
    if (error?.response?.data?.detail) {
      return error.response.data.detail;
    }
    
    if (typeof error?.response?.data === 'string') {
      return error.response.data;
    }
    
    if (error?.message) {
      return error.message;
    }
    
    if (typeof error === 'string') {
      return error;
    }
    
    if (error?.response?.status === 422) {
      if (error?.response?.data?.errors) {
        const errors = error.response.data.errors;
        if (Array.isArray(errors)) {
          return errors.map(err => err.message || err).join(', ');
        } else if (typeof errors === 'object') {
          return Object.values(errors).flat().join(', ');
        }
      }
      return 'Validation failed. Please check your file format and data.';
    }
    
    return 'An unexpected error occurred. Please try again.';
  };

  // Export Users
  const handleExportUsers = useCallback(async () => {
    setIsExporting(true);
    try {
      const response = await userService.exportUsers();
      
      const blob = new Blob([response.data], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      const timestamp = new Date().toISOString().split('T')[0];
      link.download = `users_export_${timestamp}.xlsx`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      showSuccess('Export Successful', 'User data has been exported successfully');
    } catch (error) {
      console.error('Export error:', error);
      const errorMessage = extractErrorMessage(error);
      showError('Export Failed', errorMessage);
    } finally {
      setIsExporting(false);
    }
  }, [showSuccess, showError]);

  // Import Users
  const handleImportUsers = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    console.log('Selected file:', {
      name: file.name,
      type: file.type,
      size: file.size,
      lastModified: new Date(file.lastModified).toISOString()
    });

    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv'
    ];
    
    const allowedExtensions = ['.xlsx', '.xls', '.csv'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    
    if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
      showError(
        'Invalid File Type', 
        'Please select a valid Excel file (.xlsx, .xls) or CSV file (.csv)'
      );
      event.target.value = '';
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      showError(
        'File Too Large', 
        `File size is ${(file.size / (1024 * 1024)).toFixed(2)}MB. Maximum allowed size is 5MB.`
      );
      event.target.value = '';
      return;
    }

    if (file.size === 0) {
      showError('Empty File', 'The selected file is empty. Please choose a valid file with data.');
      event.target.value = '';
      return;
    }

    setIsImporting(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      console.log('FormData created with file:', file.name);
      
      const response = await userService.importUsers(formData);
      console.log('Import response:', response);
      
      await fetchUsers();
      
      const importedCount = response?.data?.imported_count || response?.imported_count || 0;
      const skippedCount = response?.data?.skipped_count || response?.skipped_count || 0;
      
      let successMessage = `Successfully imported ${importedCount} user(s)`;
      if (skippedCount > 0) {
        successMessage += ` (${skippedCount} duplicate(s) skipped)`;
      }
      
      showSuccess('Import Successful', successMessage);
      
    } catch (error) {
      console.error('Import error details:', error);
      
      const errorMessage = extractErrorMessage(error);
      
      let title = 'Import Failed';
      if (error?.response?.status === 422) {
        title = 'File Validation Error';
      } else if (error?.response?.status === 413) {
        title = 'File Too Large';
      } else if (error?.response?.status === 415) {
        title = 'Unsupported File Type';
      }
      
      showError(title, errorMessage);
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [showSuccess, showError, fetchUsers]);

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

  const handleConfirmAction = useCallback(async () => {
    const { action, user } = confirmDialog;
    setConfirmDialog(prev => ({ ...prev, loading: true }));
    
    try {
      switch (action) {
        case 'soft-delete':
          await softDeleteUser(user.id_user);
          setConfirmDialog({ isOpen: false });
          showSuccess('User Deleted', `${user.nama} has been successfully deactivated`);
          break;
          
        case 'hard-delete':
          await hardDeleteUser(user.id_user);
          setConfirmDialog({ isOpen: false });
          showSuccess('User Permanently Deleted', `${user.nama} has been permanently removed from the system`);
          break;
          
        default:
          setConfirmDialog({ isOpen: false });
          break;
      }
    } catch (err) {
      console.error('Action failed:', err);
      setConfirmDialog(prev => ({ ...prev, loading: false }));
      const errorMessage = extractErrorMessage(err);
      showError('Action Failed', errorMessage);
    }
  }, [confirmDialog, softDeleteUser, hardDeleteUser, showSuccess, showError]);

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
      const errorMessage = extractErrorMessage(error);
      showError('Refresh Failed', errorMessage);
    }
  }, [fetchUsers, showSuccess, showError]);

  const handleUserUpdated = useCallback(async (updatedUser) => {
    try {
      await fetchUsers();
      showSuccess('User Updated', `${updatedUser?.nama || 'User'} has been successfully updated`);
    } catch (error) {
      console.error('Error refreshing data:', error);
      const errorMessage = extractErrorMessage(error);
      showError('Refresh Failed', errorMessage);
    }
  }, [fetchUsers, showSuccess, showError]);

  const hasActiveFilters = searchTerm || roleFilter;

  const stats = useMemo(() => ({
    total: filteredUsers.length,
    superAdmins: filteredUsers.filter(u => u.user_role_name === 'SuperAdmin').length,
    security: filteredUsers.filter(u => u.user_role_name === 'Security').length
  }), [filteredUsers]);

  const getConfirmButtonText = () => {
    switch (confirmDialog.action) {
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
        Sidebar={(props) => (
          <Sidebar 
            {...props}
            onPageChange={handlePageChange}
          />
        )}
      >
        {/* 2. Tambahkan motion.div untuk transisi halaman */}
        <motion.div 
          className="space-y-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">User Management</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">Manage system users and their roles</p>
            </div>
            <div className="flex items-center space-x-3">
              {/* Import Button */}
              <button 
                onClick={handleImportUsers}
                disabled={isImporting}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {isImporting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Importing...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                    </svg>
                    Import
                  </>
                )}
              </button>

              {/* Export Button */}
              <button 
                onClick={handleExportUsers}
                disabled={isExporting}
                className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {isExporting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Exporting...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    Export
                  </>
                )}
              </button>

              {/* Add User Button */}
              <button 
                onClick={handleAddUser} 
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-all duration-200"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Tambah User
              </button>
            </div>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-slate-950/50 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-slate-600/30">
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Users</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
            </div>
            <div className="bg-white dark:bg-slate-950/50 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-slate-600/30">
              <p className="text-sm text-gray-600 dark:text-gray-400">Super Admins</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.superAdmins}</p>
            </div>
            <div className="bg-white dark:bg-slate-950/50 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-slate-600/30">
              <p className="text-sm text-gray-600 dark:text-gray-400">Security Staff</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.security}</p>
            </div>
          </div>
          
          {/* Filters */}
          <div className="bg-white dark:bg-slate-950/50 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-slate-600/30">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Search Users</label>
                <SearchInput 
                  value={searchTerm}
                  onChange={handleSearch}
                  placeholder="Search by name, username, or NIP..."
                />
              </div>
              <div className="sm:w-48">
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Filter by Role</label>
                <RoleSelect 
                  value={roleFilter}
                  onChange={handleRoleFilter}
                />
              </div>
              {hasActiveFilters && (
                <div className="sm:w-32 flex items-end">
                  <button 
                    onClick={handleClearFilters} 
                    className="w-full px-4 py-2 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors duration-200"
                  >
                    Clear
                  </button>
                </div>
              )}
            </div>
          </div>
          
          <UserList 
            users={filteredUsers}
            loading={loading} 
            error={error} 
            onEdit={handleEditUser}
            onDelete={handleDeleteUser} 
          />
        </motion.div>
      </MainLayout>

      {/* Hidden File Input for Import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

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