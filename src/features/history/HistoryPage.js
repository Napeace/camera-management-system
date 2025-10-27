// features/history/HistoryPage.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import MainLayout from '../../components/layout/MainLayout';
import Sidebar from '../../components/layout/Sidebar';
import HistoryList from './HistoryList';
import HistoryFilters from './components/HistoryFilters';
import HistoryStatistics from './components/HistoryStatistics';
import HistoryCreateModal from './HistoryCreateModal';
import Pagination from '../../components/common/Pagination';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import useStaggerAnimation from '../../hooks/useStaggerAnimation';
import useHistoryPage from './hooks/useHistoryPage';

const HistoryPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
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
    getConfirmButtonText
  } = useHistoryPage();

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
          {/* Statistics */}
          <motion.div variants={animations.item}>
            <HistoryStatistics 
              stats={stats} 
              onExportPDF={handleExportToPDF}
              isExporting={isExporting}
              onAddHistory={handleOpenCreateModal}
            />
          </motion.div>
          
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
          
          {/* History List */}
          <motion.div variants={animations.item}>
            <HistoryList 
              historyData={paginatedHistory}
              loading={loading} 
              error={error} 
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