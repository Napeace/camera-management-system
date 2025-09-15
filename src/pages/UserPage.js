// pages/UserPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import MainLayout from '../components/layout/MainLayout';
import Sidebar from '../components/layout/Sidebar';
import UserList from '../components/user/UserList';
import UserCreateModal from '../components/user/UserCreateModal';
import UserEditModal from '../components/user/UserEditModal';
import useUsers from '../hooks/useUsers';

const UserPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  
  // 'refresh' sudah dihapus dari sini
  const { 
    users, 
    loading, 
    error, 
    total, 
    updateFilters, 
    clearFilters, 
    softDeleteUser,
    hardDeleteUser,
    createUser,
    updateUser,
  } = useUsers();

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
      window.location.href = '/login';
    }
  };

  const handlePageChange = (pageId, path) => {
    navigate(path);
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    clearTimeout(window.searchTimeout);
    window.searchTimeout = setTimeout(() => {
      updateFilters({ search: value.trim() || undefined });
    }, 300);
  };

  const handleRoleFilter = (e) => {
    const value = e.target.value;
    setRoleFilter(value);
    updateFilters({ role: value || undefined });
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setRoleFilter('');
    clearFilters();
  };

  const handleAddUser = () => setShowCreateModal(true);

  const handleEditUser = (userToEdit) => {
    setEditingUser(userToEdit);
    setShowEditModal(true);
  };

  const handleDeleteUser = async (userId, isHard = false) => {
    try {
      if (isHard) {
        await hardDeleteUser(userId);
      } else {
        await softDeleteUser(userId);
      }
      alert(`User ${isHard ? 'permanently deleted' : 'soft deleted'} successfully!`);
    } catch (err) {
      console.error('Delete user error:', err);
    }
  };
  
  const handleModalClose = () => {
    setShowCreateModal(false);
    setShowEditModal(false);
    setEditingUser(null);
  };

  const hasActiveFilters = searchTerm || roleFilter;

  const stats = {
    total: total,
    superAdmins: users.filter(u => u.user_role_name === 'SuperAdmin').length,
    security: users.filter(u => u.user_role_name === 'Security').length
  };

  const UserPageContent = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-1">Manage system users and their roles</p>
        </div>
        <div className="flex items-center space-x-3">
           {/* Tombol Refresh sudah dihapus dari sini */}
           <button onClick={handleAddUser} className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">Tambah User</button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border"><p className="text-sm">Total Users</p><p className="text-2xl font-bold">{stats.total}</p></div>
        <div className="bg-white p-4 rounded-lg shadow-sm border"><p className="text-sm">Super Admins</p><p className="text-2xl font-bold">{stats.superAdmins}</p></div>
        <div className="bg-white p-4 rounded-lg shadow-sm border"><p className="text-sm">Security Staff</p><p className="text-2xl font-bold">{stats.security}</p></div>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
             <label className="block text-sm font-medium mb-2">Search Users</label>
             <input type="text" placeholder="Search..." value={searchTerm} onChange={handleSearch} className="block w-full p-2 border border-gray-300 rounded-lg" />
          </div>
          <div className="sm:w-48">
            <label className="block text-sm font-medium mb-2">Filter by Role</label>
            <select value={roleFilter} onChange={handleRoleFilter} className="block w-full p-2 border border-gray-300 rounded-lg">
                <option value="">All Roles</option>
                <option value="SuperAdmin">Super Admin</option>
                <option value="Security">Security</option>
            </select>
          </div>
           {hasActiveFilters && <div className="sm:w-32 flex items-end"><button onClick={handleClearFilters} className="w-full px-4 py-2 text-gray-600 border rounded-lg hover:bg-gray-50">Clear</button></div>}
        </div>
      </div>
      <UserList 
        users={users} 
        loading={loading} 
        error={error} 
        onEdit={handleEditUser}
        onDelete={handleDeleteUser} 
      />
    </div>
  );

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
        <UserPageContent />
      </MainLayout>

      <UserCreateModal 
        isOpen={showCreateModal}
        onClose={handleModalClose}
        onUserCreated={handleModalClose}
      />
      <UserEditModal 
        isOpen={showEditModal}
        onClose={handleModalClose}
        onSave={updateUser}
        userToEdit={editingUser}
      />
    </>
  );
};

export default UserPage;