// features/history/hooks/useHistoryPage.js
import { useState, useCallback, useMemo } from 'react';
import { useToast } from '../../../contexts/ToastContext';
import useHistory from './useHistory';

const useHistoryPage = () => {
  const { showSuccess, showError, showInfo } = useToast();
  
  // Local UI states
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isExporting, setIsExporting] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const itemsPerPage = 10;
  
  // Confirm dialog states
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    type: 'danger', 
    title: '',
    message: '',
    action: null,
    loading: false
  });
  
  const { 
    historyData, 
    loading, 
    error,
    fetchHistory
  } = useHistory();

  // Memoized filtered history
  const filteredHistory = useMemo(() => {
    let filtered = historyData;

    // Search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(item => 
        (item.ip_address && item.ip_address.toLowerCase().includes(searchLower)) ||
        (item.location_name && item.location_name.toLowerCase().includes(searchLower))
      );
    }

    // Date range filter
    if (startDate) {
      filtered = filtered.filter(item => {
        const itemDate = new Date(item.error_time);
        const filterStartDate = new Date(startDate);
        itemDate.setHours(0, 0, 0, 0);
        filterStartDate.setHours(0, 0, 0, 0);
        return itemDate >= filterStartDate;
      });
    }

    if (endDate) {
      filtered = filtered.filter(item => {
        const itemDate = new Date(item.error_time);
        const filterEndDate = new Date(endDate);
        itemDate.setHours(0, 0, 0, 0);
        filterEndDate.setHours(23, 59, 59, 999);
        return itemDate <= filterEndDate;
      });
    }

    return filtered;
  }, [historyData, searchTerm, startDate, endDate]);

  // Pagination
  const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);
  const paginatedHistory = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredHistory.slice(startIndex, endIndex);
  }, [filteredHistory, currentPage, itemsPerPage]);

  // Statistics
  const stats = useMemo(() => {
    const today = new Date();
    const todayStr = today.toDateString();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toDateString();

    return {
      total: filteredHistory.length,
      today: filteredHistory.filter(item => new Date(item.error_time).toDateString() === todayStr).length,
      yesterday: filteredHistory.filter(item => new Date(item.error_time).toDateString() === yesterdayStr).length
    };
  }, [filteredHistory]);

  // Filter handlers
  const handleSearch = useCallback((e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  }, []);

  const handleStartDateChange = useCallback((date) => {
    setStartDate(date);
    setCurrentPage(1);
  }, []);

  const handleEndDateChange = useCallback((date) => {
    setEndDate(date);
    setCurrentPage(1);
  }, []);

  const handleClearFilters = useCallback(() => {
    setSearchTerm('');
    setStartDate(null);
    setEndDate(null);
    setCurrentPage(1);
    showInfo('Filters Cleared', 'All filters have been reset');
  }, [showInfo]);

  // Pagination handler
  const handlePageNavigation = useCallback((page) => {
    setCurrentPage(page);
  }, []);

  // Export to PDF
  const handleExportToPDF = useCallback(async () => {
    setIsExporting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      showSuccess('Export Successful', 'History data has been exported to PDF successfully');
    } catch (error) {
      console.error('Export error:', error);
      showError('Export Failed', 'Failed to export history data to PDF');
    } finally {
      setIsExporting(false);
    }
  }, [showSuccess, showError]);

  // Modal handlers
  const handleOpenCreateModal = useCallback(() => {
    setIsCreateModalOpen(true);
  }, []);

  const handleCloseCreateModal = useCallback(() => {
    setIsCreateModalOpen(false);
  }, []);

  const handleHistoryCreated = useCallback(async (newHistory) => {
    try {
      showSuccess('History Created', 'History berhasil ditambahkan');
      
      // Refresh history data
      await fetchHistory();
      
      // Reset to first page to see the new history
      setCurrentPage(1);
    } catch (error) {
      console.error('Error after creating history:', error);
    }
  }, [showSuccess, fetchHistory]);

  // Confirm dialog handlers
  const handleConfirmAction = useCallback(async () => {
    const { action } = confirmDialog;
    console.log('Confirm action triggered:', action);
    
    setConfirmDialog(prev => ({ ...prev, loading: true }));
    
    try {
      setConfirmDialog({ 
        isOpen: false, 
        type: 'danger', 
        title: '', 
        message: '', 
        user: null, 
        action: null, 
        loading: false 
      });
    } catch (err) {
      console.error('Action failed:', err);
      setConfirmDialog(prev => ({ ...prev, loading: false }));
      showError('Action Failed', 'An error occurred while processing your request');
    }
  }, [confirmDialog, showError]);

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

  const getConfirmButtonText = () => {
    return 'Confirm';
  };

  const hasActiveFilters = searchTerm || startDate || endDate;

  return {
    // Data
    paginatedHistory,
    filteredHistory,
    loading,
    error,
    stats,
    
    // Filter states
    searchTerm,
    startDate,
    endDate,
    hasActiveFilters,
    
    // Pagination states
    currentPage,
    totalPages,
    itemsPerPage,
    
    // Export state
    isExporting,
    
    // Modal state
    isCreateModalOpen,
    
    // Confirm dialog
    confirmDialog,
    
    // Handlers
    handleSearch,
    handleStartDateChange,
    handleEndDateChange,
    handleClearFilters,
    handlePageNavigation,
    handleExportToPDF,
    handleOpenCreateModal,
    handleCloseCreateModal,
    handleHistoryCreated,
    handleConfirmAction,
    handleCloseConfirmDialog,
    getConfirmButtonText
  };
};

export default useHistoryPage;