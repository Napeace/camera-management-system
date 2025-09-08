import { useState, useEffect } from 'react';
import { getAllUsers } from '../services/userService';

const useUsers = (initialFilters = {}) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(initialFilters);
  const [total, setTotal] = useState(0);

  // Fetch users function
  const fetchUsers = async (newFilters = filters) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await getAllUsers(newFilters);
      setUsers(response.data);
      setTotal(response.total);
    } catch (err) {
      setError(err.message || 'Failed to fetch users');
      setUsers([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  // Update filters and refetch
  const updateFilters = (newFilters) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    fetchUsers(updatedFilters);
  };

  // Clear filters
  const clearFilters = () => {
    const emptyFilters = {};
    setFilters(emptyFilters);
    fetchUsers(emptyFilters);
  };

  // Refresh data
  const refresh = () => {
    fetchUsers(filters);
  };

  // Initial fetch
  useEffect(() => {
    fetchUsers();
  }, []); // Only run once on mount

  return {
    users,
    loading,
    error,
    filters,
    total,
    updateFilters,
    clearFilters,
    refresh,
    fetchUsers
  };
};

export default useUsers;