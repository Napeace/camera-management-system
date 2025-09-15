// hooks/useUsers.js
import { useState, useEffect, useCallback } from 'react';
import userService from '../services/userService';

const useUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({});

  const fetchUsers = useCallback(async (currentFilters = filters) => {
    try {
      setLoading(true);
      setError(null);
      const response = await userService.getAllUsers(currentFilters);
      setUsers(response.data || []);
      setTotal(response.total || 0);
    } catch (err) {
      setError(err.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const createUser = useCallback(async (userData) => {
    try {
      setLoading(true);
      setError(null);
      await userService.createUser(userData);
      await fetchUsers(); // Refresh list
    } catch (err) {
      console.error('Create user error in hook:', err);
      setError(err.message || 'Failed to create user');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchUsers]);

  const updateUser = useCallback(async (userId, userData) => {
    try {
      setLoading(true);
      setError(null);
      await userService.updateUser(userId, userData);
      await fetchUsers(); // Refresh list
    } catch (err) {
      console.error('Update user error in hook:', err);
      setError(err.message || 'Failed to update user');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchUsers]);
  
  const softDeleteUser = useCallback(async (userId) => {
    try {
      setLoading(true);
      setError(null);
      await userService.softDeleteUser(userId);
      await fetchUsers(); // Refresh list
    } catch (err) {
      console.error('Soft delete user error:', err);
      setError(err.message || 'Failed to soft delete user');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchUsers]);

  const hardDeleteUser = useCallback(async (userId) => {
    try {
      setLoading(true);
      setError(null);
      await userService.hardDeleteUser(userId);
      await fetchUsers(); // Refresh list
    } catch (err) {
      console.error('Hard delete user error:', err);
      setError(err.message || 'Failed to permanently delete user');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchUsers]);

  const updateFilters = useCallback((newFilterValues) => {
    const newFilters = { ...filters, ...newFilterValues };
    setFilters(newFilters);
    fetchUsers(newFilters);
  }, [filters, fetchUsers]);

  const clearFilters = useCallback(() => {
    setFilters({});
    fetchUsers({});
  }, [fetchUsers]);
  
  return {
    users,
    loading,
    error,
    total,
    filters,
    fetchUsers,
    createUser,
    updateUser,
    softDeleteUser,
    hardDeleteUser,
    updateFilters,
    clearFilters,
    refresh: fetchUsers, // Alias refresh ke fetchUsers
  };
};

export default useUsers;