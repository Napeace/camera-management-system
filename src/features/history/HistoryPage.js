// features/history/HistoryPage.js - WITH AUTO SCROLL TO HIGHLIGHTED ROW
import React, { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import MainLayout from '../../components/layout/MainLayout';
import Sidebar from '../../components/layout/Sidebar';
import HistoryList from './HistoryList';
import HistoryFilters from './components/HistoryFilters';
import HistoryCreateModal from './HistoryCreateModal';
import Pagination from '../../components/common/Pagination';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import useStaggerAnimation from '../../hooks/useStaggerAnimation';
import useHistoryPage from './hooks/useHistoryPage';

const HistoryPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const scrollAttempted = useRef(false);
  
  const animations = useStaggerAnimation({
    staggerDelay: 0.08,
    initialDelay: 0.1,
    duration: 0.4
  });
  
  const {
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
    
    // Fungsi untuk refresh data
    handleRefreshData
  } = useHistoryPage();

  // 🔥 AUTO SCROLL & HIGHLIGHT LOGIC
  useEffect(() => {
    // Parse query param ?highlight=5
    const searchParams = new URLSearchParams(location.search);
    const highlightId = searchParams.get('highlight');
    
    if (highlightId && !loading && paginatedHistory.length > 0 && !scrollAttempted.current) {
      console.log(`🎯 Attempting to scroll to history ID: ${highlightId}`);
      
      // Tunggu sebentar supaya DOM sudah ready
      const scrollTimer = setTimeout(() => {
        const targetRow = document.querySelector(`[data-history-id="${highlightId}"]`);
        
        if (targetRow) {
          console.log('✅ Target row found, scrolling...');
          
          // Scroll dengan smooth behavior
          targetRow.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          });
          
          // Tambahkan highlight class
          targetRow.classList.add('history-row-highlight');
          
          // Remove highlight setelah 3 detik
          setTimeout(() => {
            targetRow.classList.remove('history-row-highlight');
          }, 3000);
          
          scrollAttempted.current = true;
        } else {
          console.warn('⚠️ Target row not found in current page');
        }
      }, 500); // Delay 500ms untuk memastikan render selesai
      
      return () => clearTimeout(scrollTimer);
    }
  }, [location.search, loading, paginatedHistory]);

  // Reset scroll attempt saat pindah halaman atau clear filter
  useEffect(() => {
    scrollAttempted.current = false;
  }, [currentPage, searchTerm, startDate, endDate]);

  const handlePageChange = (pageId, path) => {
    navigate(path);
  };

  return (
    <>
      <MainLayout 
        Sidebar={(props) => (
          <Sidebar 
            {...props}
            onPageChange={handlePageChange}
          />
        )}
      >
        <motion.div 
          className="space-y-6"
          variants={animations.container}
          initial="hidden"
          animate="visible"
          exit="hidden"
        >
          {/* Filters */}
          <motion.div variants={animations.item}>
            <HistoryFilters
              searchTerm={searchTerm}
              startDate={startDate}
              endDate={endDate}
              hasActiveFilters={hasActiveFilters}
              onSearch={handleSearch}
              onStartDateChange={handleStartDateChange}
              onEndDateChange={handleEndDateChange}
              onClearFilters={handleClearFilters}
            />
          </motion.div>
          
          {/* History List - dengan buttons di header */}
          <motion.div variants={animations.item}>
            <HistoryList 
              historyData={paginatedHistory}
              loading={loading} 
              error={error}
              onDataUpdated={handleRefreshData}
              onExportPDF={handleExportToPDF}
              isExporting={isExporting}
              onAddHistory={handleOpenCreateModal}
            />
          </motion.div>

          {/* Pagination */}
          {totalPages > 1 && (
            <motion.div variants={animations.item}>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filteredHistory.length}
                itemsPerPage={itemsPerPage}
                onPageChange={handlePageNavigation}
                itemName="errors"
                showFirstLast={true}
                maxPageButtons={5}
              />
            </motion.div>
          )}
        </motion.div>
      </MainLayout>

      {/* Create History Modal */}
      <HistoryCreateModal
        isOpen={isCreateModalOpen}
        onClose={handleCloseCreateModal}
        onHistoryCreated={handleHistoryCreated}
      />

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