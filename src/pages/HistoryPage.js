// pages/HistoryPage.js
import React, { useState, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import MainLayout from '../components/layout/MainLayout';
import Sidebar from '../components/layout/Sidebar';
import HistoryList from '../features/history/HistoryList';
import SearchInput from '../components/common/SearchInput';
import ConfirmDialog from '../components/common/ConfirmDialog';
import useHistory from '../hooks/useHistory';

// Date filter component
const DateRangeFilter = React.memo(({ startDate, endDate, onStartDateChange, onEndDateChange }) => (
  <div className="flex gap-2">
    <div className="flex-1">
      <label className="block text-sm font-medium mb-1">Date Range From</label>
      <input 
        type="date" 
        value={startDate} 
        onChange={onStartDateChange}
        className="block w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    </div>
    <div className="flex-1">
      <label className="block text-sm font-medium mb-1">To</label>
      <input 
        type="date" 
        value={endDate} 
        onChange={onEndDateChange}
        className="block w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    </div>
  </div>
));

const HistoryPage = () => {
  const { user, logout } = useAuth();
  const { showSuccess, showError, showInfo } = useToast();
  const navigate = useNavigate();
  
  // Local UI states
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isExporting, setIsExporting] = useState(false);
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
    historyData, 
    loading, 
    error
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
        const itemDate = new Date(item.error_time).toDateString();
        const filterStartDate = new Date(startDate).toDateString();
        return new Date(itemDate) >= new Date(filterStartDate);
      });
    }

    if (endDate) {
      filtered = filtered.filter(item => {
        const itemDate = new Date(item.error_time).toDateString();
        const filterEndDate = new Date(endDate).toDateString();
        return new Date(itemDate) <= new Date(filterEndDate);
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

  // Event handlers
  const handleLogout = useCallback(() => {
    setConfirmDialog({
      isOpen: true,
      type: 'warning', 
      title: 'Confirm Logout',
      message: 'Are you sure you want to logout? You will need to login again to access the system.',
      user: null,
      action: 'logout',
      loading: false
    });
  }, []);

  const handlePageChange = useCallback((pageId, path) => {
    navigate(path);
  }, [navigate]);

  const handleSearch = useCallback((e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  }, []);

  const handleStartDateChange = useCallback((e) => {
    setStartDate(e.target.value);
    setCurrentPage(1);
  }, []);

  const handleEndDateChange = useCallback((e) => {
    setEndDate(e.target.value);
    setCurrentPage(1);
  }, []);

  const handleClearFilters = useCallback(() => {
    setSearchTerm('');
    setStartDate('');
    setEndDate('');
    setCurrentPage(1);
    showInfo('Filters Cleared', 'All filters have been reset');
  }, [showInfo]);

  const handlePageNavigation = useCallback((page) => {
    setCurrentPage(page);
  }, []);

  // Export to PDF
  const handleExportToPDF = useCallback(async () => {
    setIsExporting(true);
    try {
      // This would be implemented when connecting to backend
      // For now, just show success message
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      
      showSuccess('Export Successful', 'History data has been exported to PDF successfully');
    } catch (error) {
      console.error('Export error:', error);
      showError('Export Failed', 'Failed to export history data to PDF');
    } finally {
      setIsExporting(false);
    }
  }, [showSuccess, showError]);

  // Handle confirm dialog actions
  const handleConfirmAction = useCallback(async () => {
    const { action } = confirmDialog;
    console.log('Confirm action triggered:', action);
    
    setConfirmDialog(prev => ({ ...prev, loading: true }));
    
    try {
      switch (action) {
        case 'logout':
          logout();
          navigate('/login');
          break;
          
        default:
          console.log('Unknown action:', action);
          setConfirmDialog({ 
            isOpen: false, 
            type: 'danger', 
            title: '', 
            message: '', 
            user: null, 
            action: null, 
            loading: false 
          });
          break;
      }
    } catch (err) {
      console.error('Action failed:', err);
      setConfirmDialog(prev => ({ ...prev, loading: false }));
      showError('Action Failed', 'An error occurred while processing your request');
    }
  }, [confirmDialog, logout, navigate, showError]);

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

  // Get confirm button text based on action
  const getConfirmButtonText = () => {
    switch (confirmDialog.action) {
      case 'logout':
        return 'Logout';
      default:
        return 'Confirm';
    }
  };

  const hasActiveFilters = searchTerm || startDate || endDate;

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
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">CCTV Error History</h1>
              <p className="text-gray-600 mt-1">Track and monitor CCTV camera error incidents</p>
            </div>
            <div className="flex items-center space-x-3">
              {/* Export to PDF Button */}
              <button 
                onClick={handleExportToPDF}
                disabled={isExporting}
                className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {isExporting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Exporting...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Export PDF
                  </>
                )}
              </button>
            </div>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <p className="text-sm text-gray-600">Total Errors</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <p className="text-sm text-gray-600">Today's Errors</p>
              <p className="text-2xl font-bold text-red-600">{stats.today}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <p className="text-sm text-gray-600">Yesterday's Errors</p>
              <p className="text-2xl font-bold text-orange-600">{stats.yesterday}</p>
            </div>
          </div>
          
          {/* Filters */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-2">Search History</label>
                <SearchInput 
                  value={searchTerm}
                  onChange={handleSearch}
                  placeholder="Search by IP address or location..."
                />
              </div>
              <div className="lg:w-80">
                <DateRangeFilter 
                  startDate={startDate}
                  endDate={endDate}
                  onStartDateChange={handleStartDateChange}
                  onEndDateChange={handleEndDateChange}
                />
              </div>
              {hasActiveFilters && (
                <div className="lg:w-32 flex items-end">
                  <button 
                    onClick={handleClearFilters} 
                    className="w-full px-4 py-2 text-gray-600 border rounded-lg hover:bg-gray-50 transition-colors duration-200"
                  >
                    Clear
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {/* History List */}
          <HistoryList 
            historyData={paginatedHistory}
            loading={loading} 
            error={error} 
          />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white px-4 py-3 border rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => handlePageNavigation(Math.max(currentPage - 1, 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => handlePageNavigation(Math.min(currentPage + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing{' '}
                      <span className="font-medium">{((currentPage - 1) * itemsPerPage) + 1}</span>
                      {' '}to{' '}
                      <span className="font-medium">
                        {Math.min(currentPage * itemsPerPage, filteredHistory.length)}
                      </span>
                      {' '}of{' '}
                      <span className="font-medium">{filteredHistory.length}</span>
                      {' '}results
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button
                        onClick={() => handlePageNavigation(Math.max(currentPage - 1, 1))}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="sr-only">Previous</span>
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                      
                      {/* Page numbers */}
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNumber;
                        if (totalPages <= 5) {
                          pageNumber = i + 1;
                        } else if (currentPage <= 3) {
                          pageNumber = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNumber = totalPages - 4 + i;
                        } else {
                          pageNumber = currentPage - 2 + i;
                        }
                        
                        return (
                          <button
                            key={pageNumber}
                            onClick={() => handlePageNavigation(pageNumber)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              currentPage === pageNumber
                                ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                            }`}
                          >
                            {pageNumber}
                          </button>
                        );
                      })}
                      
                      <button
                        onClick={() => handlePageNavigation(Math.min(currentPage + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="sr-only">Next</span>
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </MainLayout>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={handleCloseConfirmDialog}
        onConfirm={handleConfirmAction}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText={getConfirmButtonText()}
        cancelText="Cancel"
        type={confirmDialog.type}
        loading={confirmDialog.loading}
      />
    </>
  );
};

export default HistoryPage;