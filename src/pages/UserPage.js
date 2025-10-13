// pages/UserPage.js
import React, { useState, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import MainLayout from '../components/layout/MainLayout';
import Sidebar from '../components/layout/Sidebar';
import UserList from '../features/user/UserList';
import UserCreateModal from '../features/user/UserCreateModal';
import UserEditModal from '../features/user/UserEditModal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import StatCard, { StatCardWithAction } from '../components/common/StatCard';
import useUsers from '../hooks/useUsers';
import userService from '../services/userService';
import useStaggerAnimation from '../hooks/useStaggerAnimation';
import { 
  UserGroupIcon, 
  ShieldCheckIcon, 
  UserIcon,
  PlusIcon
} from '@heroicons/react/24/outline';

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

const RoleSelect = React.memo(({ value, onChange, disabled }) => (
  <select 
    value={value} 
    onChange={onChange}
    disabled={disabled}
    className="block w-full p-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
  >
    <option value="">Semua Role</option>
    <option value="SuperAdmin">Super Admin</option>
    <option value="Security">Security</option>
  </select>
));

const UserPage = () => {
  const { user } = useAuth();
  const { showSuccess, showError, showInfo } = useToast();
  const navigate = useNavigate();
  
  // Animation variants dari custom hook (sama seperti CCTVPage)
  const animations = useStaggerAnimation({
    staggerDelay: 0.08,
    initialDelay: 0.1,
    duration: 0.4,
    yOffset: 0 // Hanya opacity
  });
  
  // Local UI states
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
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

  // Calculate paginated users
  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredUsers.slice(startIndex, endIndex);
  }, [filteredUsers, currentPage, itemsPerPage]);

  // Calculate total pages
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  // Statistics (sama seperti CCTVPage)
  const statistics = useMemo(() => {
    const total = filteredUsers.length;
    const superAdmins = filteredUsers.filter(u => u.user_role_name === 'SuperAdmin').length;
    const security = filteredUsers.filter(u => u.user_role_name === 'Security').length;
    return { total, superAdmins, security };
  }, [filteredUsers]);

  // Helper function to extract error message
  const extractErrorMessage = (error) => {
    if (error?.response?.data?.message) return error.response.data.message;
    if (error?.response?.data?.detail) return error.response.data.detail;
    if (typeof error?.response?.data === 'string') return error.response.data;
    if (error?.message) return error.message;
    if (typeof error === 'string') return error;
    
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

  const handlePageChange = useCallback((pageId, path) => {
    navigate(path);
  }, [navigate]);

  const handlePaginationChange = useCallback((page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleSearch = useCallback((e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  }, []);

  const handleRoleFilter = useCallback((e) => {
    setRoleFilter(e.target.value);
    setCurrentPage(1);
  }, []);

  const handleClearFilters = useCallback(() => {
    setSearchTerm('');
    setRoleFilter('');
    setCurrentPage(1);
    showInfo('Filter Dibersihkan', 'Semua filter telah direset');
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
    const title = isHard ? 'Hapus User Permanen' : 'Hapus User';
    const message = isHard 
      ? 'Tindakan ini tidak dapat dibatalkan. User dan semua data terkait akan dihapus permanen dari sistem.'
      : 'User ini akan dinonaktifkan dan dapat dipulihkan nanti jika diperlukan.';
    
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

  const handleRefresh = useCallback(() => {
    fetchUsers();
    showInfo('Memuat Ulang', 'Memperbarui data user...');
  }, [fetchUsers, showInfo]);

  const handleConfirmAction = useCallback(async () => {
    const { action, user } = confirmDialog;
    setConfirmDialog(prev => ({ ...prev, loading: true }));
    
    try {
      switch (action) {
        case 'soft-delete':
          await softDeleteUser(user.id_user);
          setConfirmDialog({ isOpen: false });
          showSuccess('User Berhasil Dihapus', `${user.nama} telah dinonaktifkan`);
          break;
          
        case 'hard-delete':
          await hardDeleteUser(user.id_user);
          setConfirmDialog({ isOpen: false });
          showSuccess('User Berhasil Dihapus Permanen', `${user.nama} telah dihapus permanen dari sistem`);
          break;
          
        default:
          setConfirmDialog({ isOpen: false });
          break;
      }
    } catch (err) {
      console.error('Action failed:', err);
      setConfirmDialog(prev => ({ ...prev, loading: false }));
      const errorMessage = extractErrorMessage(err);
      showError('Tindakan Gagal', errorMessage);
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
        'User Berhasil Dibuat', 
        `${newUser?.nama || 'User baru'} telah ditambahkan`
      );
    } catch (error) {
      console.error('Error refreshing data:', error);
      const errorMessage = extractErrorMessage(error);
      showError('Gagal Memuat Ulang', errorMessage);
    }
  }, [fetchUsers, showSuccess, showError]);

  const handleUserUpdated = useCallback(async (updatedUser) => {
    try {
      await fetchUsers();
      showSuccess('User Berhasil Diperbarui', `${updatedUser?.nama || 'User'} telah diperbarui`);
    } catch (error) {
      console.error('Error refreshing data:', error);
      const errorMessage = extractErrorMessage(error);
      showError('Gagal Memuat Ulang', errorMessage);
    }
  }, [fetchUsers, showSuccess, showError]);

  const hasActiveFilters = searchTerm || roleFilter;

  const getConfirmButtonText = () => {
    switch (confirmDialog.action) {
      case 'soft-delete':
        return 'Hapus';
      case 'hard-delete':
        return 'Hapus Permanen';
      default:
        return 'Konfirmasi';
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
        navbarTitle="Manajemen User"
        navbarSubtitle="Kelola user sistem dan role mereka"
      >
        {/* Wrap seluruh konten dengan motion container */}
        <motion.div 
          className="space-y-6"
          variants={animations.container}
          initial="hidden"
          animate="visible"
          exit="hidden"
        >
          {/* Statistics Cards - Animated (Layout: 1-1-2 seperti CCTVPage) */}
          <motion.div 
            variants={animations.item}
            className="grid grid-cols-1 md:grid-cols-4 gap-4"
          >
            <StatCard 
              label="Total Users" 
              value={String(statistics.total)}
              icon={UserGroupIcon}
              color="blue"
              loading={loading}
            />
            <StatCard 
              label="Super Admins" 
              value={String(statistics.superAdmins)}
              icon={ShieldCheckIcon}
              color="purple"
              loading={loading}
            />
            <div className="md:col-span-2">
              <StatCardWithAction 
                label="Security Staff" 
                value={String(statistics.security)}
                icon={UserIcon}
                buttonText="Tambah User"
                buttonIcon={PlusIcon}
                onButtonClick={handleAddUser}
                loading={loading}
                color="green"
              />
            </div>
          </motion.div>
          
          {/* Filters - Animated */}
          <motion.div 
            variants={animations.item}
            className="bg-white dark:bg-slate-900/70 backdrop-blur-sm p-6 rounded-xl border border-gray-300 dark:border-slate-700/50"
          >
            <div className="flex flex-col lg:flex-row gap-4 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Cari User</label>
                <SearchInput 
                  value={searchTerm}
                  onChange={handleSearch}
                  placeholder="Cari berdasarkan nama, username, atau NIP..."
                />
              </div>
              <div className="w-full lg:w-48">
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Role</label>
                <RoleSelect 
                  value={roleFilter}
                  onChange={handleRoleFilter}
                  disabled={loading}
                />
              </div>
              {hasActiveFilters && (
                <div className="w-full lg:w-auto">
                  <button 
                    onClick={handleClearFilters}
                    disabled={loading}
                    className="w-full bg-gray-300 hover:bg-gray-400 dark:bg-slate-700 dark:hover:bg-slate-600 disabled:bg-gray-200 dark:disabled:bg-slate-800 text-gray-800 dark:text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 text-sm"
                  >
                    Clear
                  </button>
                </div>
              )}
            </div>
          </motion.div>
          
          {/* User List Component - Animated */}
          <motion.div variants={animations.item}>
            <UserList 
              users={paginatedUsers}
              loading={loading} 
              error={error} 
              onRefresh={handleRefresh}
              onEdit={handleEditUser}
              onDelete={handleDeleteUser}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePaginationChange}
              totalItems={filteredUsers.length}
              itemsPerPage={itemsPerPage}
            />
          </motion.div>

          {/* Results Count - Animated */}
          {!loading && users.length > 0 && (
            <motion.div 
              variants={animations.item}
              className="text-sm text-gray-500 dark:text-gray-400 text-center"
            >
              Menampilkan {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, filteredUsers.length)} dari {filteredUsers.length} user yang difilter ({users.length} total).
            </motion.div>
          )}
        </motion.div>
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
        cancelText="Batal"
        type={confirmDialog.type}
        loading={confirmDialog.loading}
        itemName={confirmDialog.user?.nama}
      />
    </>
  );
};

export default UserPage;