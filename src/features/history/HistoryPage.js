// features/history/HistoryPage.js - WITH TOAST INTEGRATION
import React, { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import MainLayout from '../../components/layout/MainLayout';
import Sidebar from '../../components/layout/Sidebar';
import HistoryList from './components/HistoryList';
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
  const { showSuccess, showError } = useToast();
  const scrollAttempted = useRef(false);
  const highlightProcessed = useRef(false);
  
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

  // 🔥 AUTO SCROLL & HIGHLIGHT LOGIC WITH QUERY PARAM CLEANUP
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const highlightId = searchParams.get('highlight');
    
    if (!highlightId || highlightProcessed.current === highlightId) {
      return;
    }
    
    if (!loading && filteredHistory.length > 0 && !scrollAttempted.current) {
      console.log(`🎯 Attempting to find history ID: ${highlightId}`);
      
      const targetIndex = filteredHistory.findIndex(
        item => item.id_history === parseInt(highlightId)
      );
      
      if (targetIndex === -1) {
        console.warn(`⚠️ History ID ${highlightId} not found in filtered data`);
        scrollAttempted.current = true;
        highlightProcessed.current = highlightId;
        navigate('/history', { replace: true });
        return;
      }
      
      const targetPage = Math.floor(targetIndex / itemsPerPage) + 1;
      console.log(`📄 Target is on page ${targetPage} (current: ${currentPage})`);
      
      if (targetPage !== currentPage) {
        console.log(`🔄 Navigating to page ${targetPage}...`);
        handlePageNavigation(targetPage);
        return;
      }
      
      console.log(`✅ Already on correct page, scrolling to row...`);
      
      const scrollTimer = setTimeout(() => {
        const targetRow = document.querySelector(`[data-history-id="${highlightId}"]`);
        
        if (targetRow) {
          console.log('✅ Target row found, scrolling...');
          
          targetRow.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          });
          
          targetRow.classList.add('history-row-highlight');
          
          setTimeout(() => {
            targetRow.classList.remove('history-row-highlight');
            console.log('🧹 Cleaning up query parameter...');
            navigate('/history', { replace: true });
            highlightProcessed.current = highlightId;
          }, 2000);
          
          scrollAttempted.current = true;
        } else {
          console.warn('⚠️ Target row not found in DOM');
          scrollAttempted.current = true;
          highlightProcessed.current = highlightId;
          navigate('/history', { replace: true });
        }
      }, 600);
      
      return () => clearTimeout(scrollTimer);
    }
  }, [location.search, loading, filteredHistory, currentPage, itemsPerPage, handlePageNavigation, navigate]);

  useEffect(() => {
    scrollAttempted.current = false;
  }, [searchTerm, startDate, endDate]);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const currentHighlightId = searchParams.get('highlight');
    
    if (currentHighlightId && highlightProcessed.current !== currentHighlightId) {
      console.log(`🔄 New highlight detected: ${currentHighlightId}, resetting refs...`);
      scrollAttempted.current = false;
      highlightProcessed.current = null;
    } else if (!currentHighlightId && highlightProcessed.current) {
      console.log('🧹 Highlight cleared from URL, resetting refs...');
      scrollAttempted.current = false;
      highlightProcessed.current = null;
    }
  }, [location.search]);

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
        navbarTitle="Riwayat CCTV"
        navbarSubtitle="Seluruh jejak aktivitas CCTV & Catat Error yang terjadi"
      >
        <motion.div 
          className="space-y-6"
          variants={animations.container}
          initial="hidden"
          animate="visible"
          exit="hidden"
        >
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
          
          <motion.div variants={animations.item}>
            <HistoryList 
              historyData={paginatedHistory}
              loading={loading} 
              error={error}
              onDataUpdated={handleRefreshData}
              onExportPDF={handleExportToPDF}
              isExporting={isExporting}
              onAddHistory={handleOpenCreateModal}
              showSuccess={showSuccess}
              showError={showError}
            />
          </motion.div>

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

      <HistoryCreateModal
        isOpen={isCreateModalOpen}
        onClose={handleCloseCreateModal}
        onHistoryCreated={handleHistoryCreated}
      />

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