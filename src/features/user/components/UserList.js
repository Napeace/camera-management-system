// features/user/UserList.js - FIXED: updated_at → last_login
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import useTableAnimation from '../../../hooks/useTableAnimation';
import AnimatedSection from '../../../components/common/AnimatedSection';
import Pagination from '../../../components/common/Pagination';
import { 
  PencilIcon, 
  TrashIcon, 
  ExclamationTriangleIcon, 
  UserGroupIcon 
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
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'Admin': 
        return 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-800';
      case 'Security': 
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800';
      default: 
        return 'bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-800';
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
      <div className="bg-white dark:bg-slate-950/50 rounded-lg shadow-sm border border-gray-200 dark:border-slate-600/30 p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-slate-700 rounded w-1/3 mb-6"></div>
          <div className="space-y-4">
            {[...Array(1)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 dark:bg-slate-700 rounded w-full"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/50 rounded-lg shadow-sm border border-red-200 dark:border-red-600/30 p-6 text-center">
        <div className="text-red-600 dark:text-red-300 mb-2">
          <ExclamationTriangleIcon className="w-12 h-12 mx-auto mb-2" />
          <p className="text-lg font-medium">Error Loading Users</p>
        </div>
        <p className="text-red-500 dark:text-red-200 mb-4">{error}</p>
        <button 
          onClick={onRefresh} 
          className="px-4 py-2 bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Empty State
  if (!users || users.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-950/50 rounded-lg shadow-sm border border-gray-200 dark:border-slate-600/30 p-6 text-center">
        <div className="flex flex-col items-center text-gray-500 dark:text-gray-400">
          <UserGroupIcon className="w-12 h-12 mb-2" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Users Found</h3>
          <p className="text-gray-600 dark:text-gray-400">No users match your current filters.</p>
        </div>
      </div>
    );
  }

  return (
    <AnimatedSection.ExpandHeight 
      duration={0.6} 
      delay={0}
      className="bg-white dark:bg-slate-950/50 rounded-lg shadow-sm border border-gray-200 dark:border-slate-600/30 overflow-hidden"
    >
      <div className="w-full">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-600/30">
          <thead className="bg-gray-50 dark:bg-slate-900/20">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                Username
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                Role
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                Actions
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                Last Login
              </th>
            </tr>
          </thead>
          
          {/* ✅ Animated tbody dengan SLIDE UP EFFECT (dari useTableAnimation) */}
          <motion.tbody
            className="bg-white dark:bg-slate-950/50 divide-y divide-gray-200 dark:divide-slate-600/30"
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
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {user.nama}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                        NIP: {user.nip}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-white font-mono">
                    {user.username}
                  </div>
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
                      className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 p-2 hover:bg-indigo-50 dark:hover:bg-indigo-400/10 rounded-lg transition-colors duration-200" 
                      title="Edit User"
                    >
                      <PencilIcon className="w-5 h-5" />
                    </button>
                    
                    <button 
                      onClick={() => handleDelete(user, true)} 
                      className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 p-2 hover:bg-red-50 dark:hover:bg-red-400/10 rounded-lg transition-colors duration-200" 
                      title="Permanently Delete User"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                </td>
                {/* ✅ FIXED: Ganti user.updated_at menjadi user.last_login */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {formatDate(user.last_login)}
                </td>
              </motion.tr>
            ))}
          </motion.tbody>
        </table>
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        onPageChange={onPageChange}
        itemName="User"
        showFirstLast={true}
      />
    </AnimatedSection.ExpandHeight>
  );
};

export default UserList;