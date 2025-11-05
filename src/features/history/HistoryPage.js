// features/history/HistoryPage.js - FIXED: Remove query param after highlight
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
  const highlightProcessed = useRef(false); // ✅ Track jika highlight sudah diproses
  
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
    // Parse query param ?highlight=5
    const searchParams = new URLSearchParams(location.search);
    const highlightId = searchParams.get('highlight');
    
    // ✅ Skip jika highlight sudah pernah diproses untuk ID ini
    if (!highlightId || highlightProcessed.current === highlightId) {
      return;
    }
    
    if (!loading && filteredHistory.length > 0 && !scrollAttempted.current) {
      console.log(`🎯 Attempting to find history ID: ${highlightId}`);
      
      // 1️⃣ Cari index row di filteredHistory (data lengkap)
      const targetIndex = filteredHistory.findIndex(
        item => item.id_history === parseInt(highlightId)
      );
      
      if (targetIndex === -1) {
        console.warn(`⚠️ History ID ${highlightId} not found in filtered data`);
        scrollAttempted.current = true;
        highlightProcessed.current = highlightId;
        
        // ✅ Hapus query param karena data tidak ditemukan
        navigate('/history', { replace: true });
        return;
      }
      
      // 2️⃣ Hitung halaman yang benar
      const targetPage = Math.floor(targetIndex / itemsPerPage) + 1;
      console.log(`📄 Target is on page ${targetPage} (current: ${currentPage})`);
      
      // 3️⃣ Jika beda halaman, navigate dulu
      if (targetPage !== currentPage) {
        console.log(`🔄 Navigating to page ${targetPage}...`);
        handlePageNavigation(targetPage);
        // Jangan set scrollAttempted di sini, biar bisa scroll setelah pagination selesai
        return;
      }
      
      // 4️⃣ Jika sudah di halaman yang benar, scroll ke row
      console.log(`✅ Already on correct page, scrolling to row...`);
      
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
          
          // ✅ Remove highlight dan hapus query param setelah 2 detik
          setTimeout(() => {
            targetRow.classList.remove('history-row-highlight');
            
            // ✅ Hapus query parameter dari URL
            console.log('🧹 Cleaning up query parameter...');
            navigate('/history', { replace: true });
            
            // Mark as processed
            highlightProcessed.current = highlightId;
          }, 2000); // 2 detik
          
          scrollAttempted.current = true;
        } else {
          console.warn('⚠️ Target row not found in DOM');
          scrollAttempted.current = true;
          highlightProcessed.current = highlightId;
          
          // ✅ Hapus query param jika row tidak ditemukan
          navigate('/history', { replace: true });
        }
      }, 600); // Delay 600ms untuk memastikan render selesai
      
      return () => clearTimeout(scrollTimer);
    }
  }, [location.search, loading, filteredHistory, currentPage, itemsPerPage, handlePageNavigation, navigate]);

  // Reset scroll attempt HANYA saat filter berubah (bukan saat pagination)
  useEffect(() => {
    // Jangan reset jika hanya currentPage yang berubah
    // Reset hanya jika filter aktif berubah
    scrollAttempted.current = false;
  }, [searchTerm, startDate, endDate]);

  // Reset highlightProcessed saat URL berubah ke highlight baru
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const currentHighlightId = searchParams.get('highlight');
    
    // Reset jika ada highlight ID baru yang berbeda ATAU jika tidak ada highlight (cleanup)
    if (currentHighlightId && highlightProcessed.current !== currentHighlightId) {
      console.log(`🔄 New highlight detected: ${currentHighlightId}, resetting refs...`);
      scrollAttempted.current = false;
      highlightProcessed.current = null; // ✅ Reset ke null agar bisa diproses lagi
    } else if (!currentHighlightId && highlightProcessed.current) {
      // ✅ Jika URL sudah dibersihkan tapi ref masih menyimpan ID lama, reset juga
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