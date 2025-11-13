// features/user/UserList.js - NEW DESIGN (Style seperti HistoryList)
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import useTableAnimation from '../../../hooks/useTableAnimation';
import Pagination from '../../../components/common/Pagination';
import { 
  PencilIcon, 
  TrashIcon,
  UserGroupIcon,
  UserIcon,
  UserCircleIcon,
  KeyIcon,
  AdjustmentsVerticalIcon
} from '@heroicons/react/24/outline';

const UserList = ({ 
  users = [], 
  loading = false, 
  error = null, 
  onRefresh, 
  onEdit, 
  onDelete,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  totalItems = 0,
  itemsPerPage = 10
}) => {
  const [actionLoading, setActionLoading] = useState({});
  
  const tableAnimations = useTableAnimation({
    staggerDelay: 0.05,
    duration: 0.3,
    enableHover: false 
  });

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('id-ID', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch (e) {
      return 'Invalid Date';
    }
  };

  const getRoleBadgeColor = (roleName) => {
    switch (roleName) {
      case 'SuperAdmin': 
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800';
      case 'Admin': 
        return 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800';
      case 'Security': 
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-800';
      default: 
        return 'bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-800';
    }
  };

  const handleEdit = (user) => onEdit && onEdit(user);
  
  const handleDelete = (user, isHard = false) => {
    if (onDelete) {
      onDelete(user, isHard);
    }
  };

  // Loading State
  if (loading && users.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-950/50 rounded-lg shadow-sm border border-gray-200 dark:border-slate-600/30">
        <div className="animate-pulse p-6">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-1/6"></div>
                <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-1/6"></div>
                <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-1/4"></div>
                <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-1/5"></div>
                <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-1/6"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="bg-white dark:bg-slate-950/50 rounded-lg shadow-sm border border-gray-200 dark:border-slate-600/30 p-6">
        <div className="text-center py-8">
          <svg className="mx-auto h-12 w-12 text-red-400 dark:text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">Error Loading Users</h3>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  // Empty State
  if (!users || users.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-950/50 rounded-lg shadow-sm border border-gray-200 dark:border-slate-600/30 p-6">
        <div className="text-center py-8">
          <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">No Users Found</h3>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">No users match your current filters.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <motion.div 
        className="bg-white dark:bg-slate-950/80 rounded-lg shadow-sm border border-gray-200 dark:border-slate-600/30 overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      >
        {/* Header dengan Title */}
        <div className="px-6 py-4 border-b bg-white dark:bg-slate-400/10 border-gray-200 dark:border-slate-600/30">
          <div className="flex items-center justify-between">
            {/* Title */}
            <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
              <UserGroupIcon className="w-5 h-5 mr-2" />
              Daftar Pengguna CCTV RSCH
            </h3>
          </div>
        </div>

        <div className="w-full overflow-x-auto overflow-y-hidden px-6">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-600/30">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white tracking-wider">
                  <div className="flex items-center">
                    <UserCircleIcon className="w-4 h-4 mr-2" />
                    Nama Pengguna
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white tracking-wider">
                  <div className="flex items-center">
                    <UserIcon className="w-4 h-4 mr-2" />
                    Username
                  </div>
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-white tracking-wider">
                  <div className="flex items-center justify-center">
                    <UserGroupIcon className="w-4 h-4 mr-2" />
                    Role
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white tracking-wider">
                  <div className="flex items-center">
                    <KeyIcon className="w-4 h-4 mr-2" />
                    Akses Terakhir
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white tracking-wider">
                  <div className="flex items-center">
                    <AdjustmentsVerticalIcon className="w-4 h-4 mr-2" />
                    Aksi
                  </div>
                </th>
              </tr>
            </thead>
            
            <motion.tbody
              className="bg-transparent divide-y divide-gray-200 dark:divide-slate-600/30"
              variants={tableAnimations.tbody}
              initial="hidden"
              animate="visible"
            >
              {users.map((user) => (
                <motion.tr 
                  key={user.id_user} 
                  variants={tableAnimations.row}
                  className="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors duration-150"
                >
                  {/* Nama Pengguna + NIP */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {user.nama}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        NIP: {user.nip}
                      </div>
                    </div>
                  </td>

                  {/* Username */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {user.username}
                    </div>
                  </td>

                  {/* Role Badge */}
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(user.user_role_name)}`}>
                      {user.user_role_name}
                    </span>
                  </td>

                  {/* Akses Terakhir */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {formatDate(user.last_login)}
                    </div>
                  </td>

                  {/* Aksi Buttons */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {/* Button Edit - Kuning */}
                      <button 
                        onClick={() => handleEdit(user)} 
                        className="text-yellow-600 dark:text-yellow-400 bg-yellow-600/30 dark:bg-yellow-800/30 hover:text-yellow-900 dark:hover:text-yellow-300 p-2 hover:bg-yellow-100 dark:hover:bg-yellow-400/10 rounded-md transition-colors duration-200" 
                        title="Edit User"
                      >
                        <PencilIcon className="w-5 h-5" />
                      </button>
                      
                      {/* Button Delete - Merah */}
                      <button 
                        onClick={() => handleDelete(user, true)} 
                        className="text-red-600 dark:text-red-400 bg-red-600/30 dark:bg-red-800/30 hover:text-red-900 dark:hover:text-red-300 p-2 hover:bg-red-100 dark:hover:bg-red-400/10 rounded-md transition-colors duration-200" 
                        title="Delete User"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </motion.tbody>
          </table>
        </div>
      </motion.div>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        onPageChange={onPageChange}
        itemName="User"
        showFirstLast={true}
      />
    </>
  );
};

export default UserList;