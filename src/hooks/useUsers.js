// hooks/useUsers.js - Fixed: Modal errors don't affect UserList
import { useState, useEffect, useCallback } from 'react';
import userService from '../services/userService';

const useUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({});

  const fetchUsers = useCallback(async (currentFilters = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching users with filters:', currentFilters);
      
      const response = await userService.getAllUsers(currentFilters);
      
      console.log('API Response:', response);
      
      let filteredUsers = response.data || [];
      
      // Apply local filtering jika API tidak support server-side filtering
      if (currentFilters.search) {
        const searchTerm = currentFilters.search.toLowerCase();
        filteredUsers = filteredUsers.filter(user => 
          (user.nama && user.nama.toLowerCase().includes(searchTerm)) ||
          (user.username && user.username.toLowerCase().includes(searchTerm)) ||
          (user.nip && String(user.nip).toLowerCase().includes(searchTerm))
        );
      }
      
      if (currentFilters.role) {
        filteredUsers = filteredUsers.filter(user => 
          user.user_role_name === currentFilters.role
        );
      }
      
      setUsers(filteredUsers);
      setTotal(filteredUsers.length);
      
    } catch (err) {
      console.error('Fetch users error:', err);
      setError(err.message || 'Failed to fetch users');
      setUsers([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchUsers(filters);
  }, []); // Remove filters dependency to prevent infinite loop

   
  const createUser = useCallback(async (userData) => {
    try {
      setLoading(true);
      // ❌ REMOVED: setError(null); - Jangan reset error saat create/update
      await userService.createUser(userData);
      await fetchUsers(filters); // Refresh with current filters
    } catch (err) {
      console.error('Create user error in hook:', err);
      // ❌ REMOVED: setError(err.message) - Biar modal yang handle
      throw err; // Tetap throw agar modal bisa catch
    } finally {
      setLoading(false);
    }
  }, [filters, fetchUsers]);

   
  const updateUser = useCallback(async (userId, userData) => {
    try {
      setLoading(true);
      // ❌ REMOVED: setError(null); - Jangan reset error saat create/update
      await userService.updateUser(userId, userData);
      await fetchUsers(filters); // Refresh with current filters
    } catch (err) {
      console.error('Update user error in hook:', err);
      // ❌ REMOVED: setError(err.message) - Biar modal yang handle
      throw err; // Tetap throw agar modal bisa catch
    } finally {
      setLoading(false);
    }
  }, [filters, fetchUsers]);
  
   
  const softDeleteUser = useCallback(async (userId) => {
    try {
      setLoading(true);
      setError(null);
      await userService.softDeleteUser(userId);
      await fetchUsers(filters);
    } catch (err) {
      console.error('Soft delete user error:', err);
      setError(err.message || 'Failed to soft delete user');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [filters, fetchUsers]);

  const hardDeleteUser = useCallback(async (userId) => {
    try {
      setLoading(true);
      setError(null);
      await userService.hardDeleteUser(userId);
      await fetchUsers(filters);
    } catch (err) {
      console.error('Hard delete user error:', err);
      setError(err.message || 'Failed to permanently delete user');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [filters, fetchUsers]);

  const updateFilters = useCallback((newFilterValues) => {
    console.log('Updating filters:', newFilterValues);
    
    const updatedFilters = { ...filters, ...newFilterValues };
    
    // Remove undefined/null values
    Object.keys(updatedFilters).forEach(key => {
      if (updatedFilters[key] === undefined || updatedFilters[key] === null || updatedFilters[key] === '') {
        delete updatedFilters[key];
      }
    });
    
    console.log('Final filters:', updatedFilters);
    
    setFilters(updatedFilters);
    fetchUsers(updatedFilters);
  }, [filters, fetchUsers]);

  const clearFilters = useCallback(() => {
    setFilters({});
    fetchUsers({});
  }, [fetchUsers]);

  const refresh = useCallback(() => {
    fetchUsers(filters);
  }, [filters, fetchUsers]);
  
  return {
    users,
    loading,
    error,
    total,
    filters,
    fetchUsers: refresh,
    createUser,
    updateUser,
    softDeleteUser,
    hardDeleteUser,
    updateFilters,
    clearFilters,
    refresh,
  };
};

export default useUsers;