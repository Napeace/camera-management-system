// hooks/useUsers.js
import { useState, useEffect, useCallback } from 'react';
import userService from '../services/userService';

const useUsers = (initialFilters = {}) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(initialFilters);
  const [total, setTotal] = useState(0);

  // Fetch users function with useCallback to prevent unnecessary re-renders
  const fetchUsers = useCallback(async (newFilters = filters) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await userService.getAllUsers(newFilters);
      
      // Handle both array and object responses
      const userData = response.data || [];
      const userTotal = response.total || userData.length;
      
      setUsers(userData);
      setTotal(userTotal);
      
      return response;
    } catch (err) {
      const errorMessage = err.message || 'Failed to fetch users';
      setError(errorMessage);
      setUsers([]);
      setTotal(0);
      console.error('Fetch users error:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Create user function
  const createUser = useCallback(async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await userService.createUser(userData);
      
      // Refresh users list after creation
      await fetchUsers(filters);
      
      return response;
    } catch (err) {
      const errorMessage = err.message || 'Failed to create user';
      setError(errorMessage);
      console.error('Create user error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [filters, fetchUsers]);

  // Update user function
  const updateUser = useCallback(async (userId, userData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await userService.updateUser(userId, userData);
      
      // Update user in local state
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId ? { ...user, ...response.data } : user
        )
      );
      
      return response;
    } catch (err) {
      const errorMessage = err.message || 'Failed to update user';
      setError(errorMessage);
      console.error('Update user error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Soft delete user function
  const softDeleteUser = useCallback(async (userId) => {
    try {
      setLoading(true);
      setError(null);
      
      await userService.softDeleteUser(userId);
      
      // Remove user from local state
      setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
      setTotal(prevTotal => Math.max(0, prevTotal - 1));
      
      return { success: true, message: 'User soft deleted successfully' };
    } catch (err) {
      const errorMessage = err.message || 'Failed to soft delete user';
      setError(errorMessage);
      console.error('Soft delete user error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Hard delete user function
  const hardDeleteUser = useCallback(async (userId) => {
    try {
      setLoading(true);
      setError(null);
      
      await userService.hardDeleteUser(userId);
      
      // Remove user from local state
      setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
      setTotal(prevTotal => Math.max(0, prevTotal - 1));
      
      return { success: true, message: 'User permanently deleted' };
    } catch (err) {
      const errorMessage = err.message || 'Failed to permanently delete user';
      setError(errorMessage);
      console.error('Hard delete user error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update filters and refetch
  const updateFilters = useCallback((newFilters) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    fetchUsers(updatedFilters);
  }, [filters, fetchUsers]);

  // Clear filters
  const clearFilters = useCallback(() => {
    const emptyFilters = {};
    setFilters(emptyFilters);
    fetchUsers(emptyFilters);
  }, [fetchUsers]);

  // Refresh data with current filters
  const refresh = useCallback(() => {
    fetchUsers(filters);
  }, [fetchUsers, filters]);

  // Get user by ID
  const getUserById = useCallback(async (userId) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await userService.getUserById(userId);
      return response;
    } catch (err) {
      const errorMessage = err.message || 'Failed to fetch user';
      setError(errorMessage);
      console.error('Get user by ID error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch when component mounts or when filters change significantly
  useEffect(() => {
    fetchUsers();
  }, []); // Only run once on mount

  // Cleanup function to cancel any ongoing requests if needed
  useEffect(() => {
    return () => {
      // Add cleanup logic here if needed
      setError(null);
    };
  }, []);

  return {
    // Data
    users,
    loading,
    error,
    filters,
    total,
    
    // Actions
    fetchUsers,
    createUser,
    updateUser,
    softDeleteUser,
    hardDeleteUser,
    getUserById,
    updateFilters,
    clearFilters,
    refresh,
    
    // Computed values
    hasUsers: users.length > 0,
    isEmpty: !loading && users.length === 0,
    hasError: !!error,
    
    // Helper functions
    resetError: () => setError(null),
    isFilterActive: (filterKey) => !!filters[filterKey]
  };
};

export default useUsers;