// features/history/hooks/useHistoryPage.js - WITH EXPORT LOGIC
import { useState, useCallback, useMemo } from 'react';
import { useToast } from '../../../contexts/ToastContext';
import useHistory from './useHistory';
import historyService from '../../../services/historyService';

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

  // Helper function untuk parse date
  const parseHistoryDate = (dateString) => {
    if (!dateString) return null;
    
    try {
      if (dateString.includes('/')) {
        const [datePart] = dateString.split(' ');
        const [day, month, year] = datePart.split('/');
        return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      }
      
      const parsed = new Date(dateString);
      return isNaN(parsed.getTime()) ? null : parsed;
    } catch (err) {
      console.error('Failed to parse date:', dateString, err);
      return null;
    }
  };

  // Memoized filtered history
  const filteredHistory = useMemo(() => {
    let filtered = historyData;

    // Search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      
      filtered = filtered.filter(item => {
        const cctvIp = item.cctv_ip || '';
        const cctvName = item.cctv_name || '';
        const locationName = item.location_name || '';
        
        const matchesIP = cctvIp.toLowerCase().includes(searchLower);
        const matchesCCTVName = cctvName.toLowerCase().includes(searchLower);
        const matchesLocation = locationName.toLowerCase().includes(searchLower);
        
        return matchesIP || matchesCCTVName || matchesLocation;
      });
    }

    // Date range filter
    if (startDate || endDate) {
      filtered = filtered.filter(item => {
        if (!item.created_at) return false;
        
        const itemDate = parseHistoryDate(item.created_at);
        if (!itemDate || isNaN(itemDate.getTime())) return false;
        
        const itemDateOnly = new Date(itemDate.getFullYear(), itemDate.getMonth(), itemDate.getDate());
        
        if (startDate) {
          const filterStartDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
          if (itemDateOnly < filterStartDate) return false;
        }
        
        if (endDate) {
          const filterEndDate = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
          if (itemDateOnly > filterEndDate) return false;
        }
        
        return true;
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
    today.setHours(0, 0, 0, 0);
    const todayTime = today.getTime();
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayTime = yesterday.getTime();

    return {
      total: filteredHistory.length,
      today: filteredHistory.filter(item => {
        const itemDate = parseHistoryDate(item.created_at);
        if (!itemDate) return false;
        itemDate.setHours(0, 0, 0, 0);
        return itemDate.getTime() === todayTime;
      }).length,
      yesterday: filteredHistory.filter(item => {
        const itemDate = parseHistoryDate(item.created_at);
        if (!itemDate) return false;
        itemDate.setHours(0, 0, 0, 0);
        return itemDate.getTime() === yesterdayTime;
      }).length
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
    showInfo('Filter Dihapus', 'Semua filter telah direset');
  }, [showInfo]);

  // Pagination handler
  const handlePageNavigation = useCallback((page) => {
    setCurrentPage(page);
  }, []);

   
  const handleExportToPDF = useCallback(async () => {
    console.log('🚀 Export triggered with state:', {
      startDate,
      endDate,
      filteredHistoryLength: filteredHistory.length,
      totalHistoryLength: historyData.length
    });

     
    if (filteredHistory.length === 0) {
      showError(
        'Tidak Ada Data',
        'Tidak ada data history untuk diekspor. Coba ubah filter tanggal Anda.'
      );
      return;
    }

    setIsExporting(true);
    
    try {
       
      // - If startDate & endDate are set → use them
      // - If not set → backend will use default (last 30 days)
      const exportStartDate = startDate;
      const exportEndDate = endDate;

      console.log('📤 Calling export API with:', {
        exportStartDate,
        exportEndDate
      });

      const result = await historyService.exportHistory(exportStartDate, exportEndDate);
      
      console.log('✅ Export successful:', result);

      // Format date range for toast message
      let dateRangeMsg = '';
      if (exportStartDate && exportEndDate) {
        const startStr = exportStartDate.toLocaleDateString('id-ID');
        const endStr = exportEndDate.toLocaleDateString('id-ID');
        dateRangeMsg = ` (${startStr} - ${endStr})`;
      } else {
        dateRangeMsg = ' (7 hari terakhir)';
      }

      showSuccess(
        'Ekspor Berhasil',
        `File ${result.filename || 'laporan kerusakan'} telah berhasil diunduh${dateRangeMsg}.`
      );
    } catch (error) {
      console.error('❌ Export error:', error);
      showError(
        'Ekspor Gagal',
        error.message || 'Terjadi kesalahan saat mengekspor data history ke Excel'
      );
    } finally {
      setIsExporting(false);
    }
  }, [startDate, endDate, filteredHistory.length, historyData.length, showSuccess, showError]);

  // Modal handlers
  const handleOpenCreateModal = useCallback(() => {
    setIsCreateModalOpen(true);
  }, []);

  const handleCloseCreateModal = useCallback(() => {
    setIsCreateModalOpen(false);
  }, []);

  const handleHistoryCreated = useCallback(async (newHistory) => {
    try {
      showSuccess('Riwayat Dibuat', 'Riwayat berhasil ditambahkan');
      await fetchHistory();
      setCurrentPage(1);
    } catch (error) {
      console.error('Error after creating history:', error);
    }
  }, [showSuccess, fetchHistory]);

  // Handler untuk refresh data dari child components
  const handleRefreshData = useCallback(async () => {
    try {
      await fetchHistory();
    } catch (error) {
      console.error('Error refreshing history data:', error);
      showError('Refresh Gagal', 'Gagal memuat ulang data history');
    }
  }, [fetchHistory, showError]);

  // Confirm dialog handlers
  const handleConfirmAction = useCallback(async () => {
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
      showError('Aksi Gagal', 'Terjadi kesalahan saat memproses permintaan Anda');
    }
  }, [showError]);

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
    getConfirmButtonText,
    handleRefreshData
  };
};

export default useHistoryPage;