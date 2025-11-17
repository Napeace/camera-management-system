// features/history/HistoryList.js - WITH PAGINATION INSIDE
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FolderIcon, 
  VideoCameraIcon, 
  ServerIcon, 
  BuildingOfficeIcon, 
  CalendarIcon, 
  SignalIcon, 
  AdjustmentsVerticalIcon,
  PlusIcon,
  DocumentArrowDownIcon
} from '@heroicons/react/24/outline';
import useTableAnimation from '../../../hooks/useTableAnimation';
import Pagination from '../../../components/common/Pagination';
import HistoryListItem from './HistoryListItem';
import HistoryNoteModal from './HistoryNoteModal';
import ConfirmDialog from '../../../components/common/ConfirmDialog';
import historyService from '../../../services/historyService';

const HistoryList = ({ 
  historyData, 
  loading, 
  error, 
  onDataUpdated,
  onExportPDF,
  isExporting,
  onAddHistory,
  showSuccess,
  showError,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  totalItems = 0,
  itemsPerPage = 10
}) => {
  const [selectedHistory, setSelectedHistory] = useState(null);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [isRepairConfirmOpen, setIsRepairConfirmOpen] = useState(false);
  const [repairLoading, setRepairLoading] = useState(false);

  const tableAnimations = useTableAnimation({
    staggerDelay: 0.05,
    duration: 0.3,
    enableHover: false
  });

  // Handler for note button click
  const handleNoteClick = (item) => {
    console.log('📝 Note clicked for:', item);
    setSelectedHistory(item);
    setIsNoteModalOpen(true);
  };

  // Handler for repair button click
  const handleRepairClick = (item) => {
    console.log('🔧 Repair clicked for:', item);
    setSelectedHistory(item);
    setIsRepairConfirmOpen(true);
  };

  // Handler untuk close note modal - HANYA refresh jika ada update
  const handleNoteModalClose = async (wasUpdated = false) => {
    console.log('🔄 Note modal closing, wasUpdated:', wasUpdated);
    
    const historyName = selectedHistory?.cctv_name || 'CCTV';
    
    setIsNoteModalOpen(false);
    setSelectedHistory(null);
    
    if (wasUpdated) {
      console.log('✅ Ada update, refreshing data...');
      
      if (onDataUpdated) {
        await onDataUpdated();
        console.log('✅ Data refresh completed after note update');
      }

      if (showSuccess) {
        showSuccess(
          'Catatan Berhasil Disimpan',
          `Catatan untuk ${historyName} telah diperbarui`
        );
      }
    } else {
      console.log('ℹ️ Tidak ada update, skip refresh');
    }
  };

  // Handler for repair confirmation
  const handleRepairConfirm = async () => {
    if (!selectedHistory) return;

    setRepairLoading(true);
    try {
      const updateData = {
        service: true
      };
      
      console.log('🔧 Marking as repaired:', selectedHistory.id_history);
      
      await historyService.updateHistory(selectedHistory.id_history, updateData);
      
      console.log('✅ Marked as repaired successfully');
      
      const cctvName = selectedHistory.cctv_name || 'CCTV';
      
      setIsRepairConfirmOpen(false);
      setSelectedHistory(null);
      
      if (onDataUpdated) {
        console.log('🔄 Calling onDataUpdated to refresh data...');
        await onDataUpdated();
        console.log('✅ Data refresh completed after repair');
      }

      if (showSuccess) {
        showSuccess(
          'Perbaikan Berhasil Dikonfirmasi',
          `${cctvName} telah ditandai sebagai diperbaiki`
        );
      }
    } catch (error) {
      console.error('❌ Error marking as repaired:', error);
      
      if (showError) {
        showError(
          'Gagal Konfirmasi Perbaikan',
          error.message || 'Terjadi kesalahan saat mengkonfirmasi perbaikan'
        );
      }
    } finally {
      setRepairLoading(false);
    }
  };

  // Custom message for repair confirmation
  const repairConfirmMessage = (
    <div className="space-y-3">
      <p className="text-gray-800 dark:text-white text-lg leading-relaxed">
        Apakah anda yakin untuk mengkonfirmasi perbaikan CCTV ini ?
      </p>
      <p className="text-sm text-gray-600 dark:text-white/70 leading-relaxed">
        *Status perbaikan tidak dapat diubah kembali setelah dikonfirmasi harap pastikan bahwa CCTV sudah benar-benar diperbaiki !
      </p>
    </div>
  );

  // Check if export button should be disabled
  const isExportDisabled = loading || isExporting || !historyData || historyData.length === 0;

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-950/50 rounded-lg shadow-sm border border-gray-200 dark:border-slate-600/30">
        <div className="animate-pulse p-6">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-1/6"></div>
                <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-1/6"></div>
                <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-1/4"></div>
                <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-1/5"></div>
                <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-1/6"></div>
                <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-1/6"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-slate-950/50 rounded-lg shadow-sm border border-gray-200 dark:border-slate-600/30 p-6">
        <div className="text-center py-8">
          <svg className="mx-auto h-12 w-12 text-red-400 dark:text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">Error Loading History</h3>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  if (!historyData || historyData.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-950/50 rounded-lg shadow-sm border border-gray-200 dark:border-slate-600/30 p-6">
        <div className="text-center py-8">
          <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">Data History tidak ditemukan</h3>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">No CCTV camera errors have been recorded yet.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <motion.div 
        className="bg-white dark:bg-slate-950/80 rounded-t-xl shadow-sm border border-gray-200 dark:border-slate-500/30 overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      >
        {/* Header dengan Title dan Buttons */}
        <div className="px-6 py-4 rounded-t-xl bg-white dark:bg-slate-400/10 border-gray-200 border dark:border-slate-500/30">
          <div className="flex items-center justify-between">
            {/* Title */}
            <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
              <FolderIcon className="w-5 h-5 mr-2" />
              Riwayat Aktivitas Kamera CCTV
            </h3>

            {/* Action Buttons - RESPONSIVE THEME */}
            <div className="flex items-center gap-3">
              {/* Button Tambahkan Riwayat - Responsive Gradient */}
              <button
                onClick={onAddHistory}
                disabled={loading}
                className={`group relative inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium overflow-hidden transition-all duration-300 ${
                  loading 
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'hover:scale-105 hover:shadow-lg active:scale-95'
                }`}
              >
                {/* Gradient Background - Light Mode */}
                <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-amber-200 opacity-100 dark:opacity-0 transition-opacity duration-300"></div>
                
                {/* Gradient Background - Dark Mode */}
                <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-black opacity-0 dark:opacity-100 transition-opacity duration-300"></div>
                
                {/* Hover Overlay */}
                {!loading && (
                  <div className="absolute inset-0 bg-black/10 dark:bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                )}
                
                {/* Content */}
                <div className="relative flex items-center text-white dark:text-white z-10">
                  <div className="relative mr-2">
                    <PlusIcon className="w-3 h-3 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" strokeWidth={3} />
                  </div>
                  <span>Tambahkan Riwayat</span>
                </div>
              </button>

              {/* Button Laporan Kerusakan - With Smart Disable Logic */}
              <button
                onClick={onExportPDF}
                disabled={isExportDisabled}
                className={`group relative inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium overflow-hidden transition-all duration-300 ${
                  isExportDisabled
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:scale-105 hover:shadow-lg active:scale-95'
                }`}
              >
                {/* Gradient Background - Light Mode */}
                <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-rose-300 opacity-100 dark:opacity-0 transition-opacity duration-300"></div>
                
                {/* Gradient Background - Dark Mode */}
                <div className="absolute inset-0 bg-gradient-to-r from-red-700 to-black opacity-0 dark:opacity-100 transition-opacity duration-300"></div>
                
                {/* Hover Overlay */}
                {!isExportDisabled && (
                  <div className="absolute inset-0 bg-black/10 dark:bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                )}
                
                {/* Content */}
                <div className="relative flex items-center text-white dark:text-white z-10">
                  {isExporting ? (
                    <>
                      <svg className="animate-spin h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Mengekspor...</span>
                    </>
                  ) : (
                    <>
                      <DocumentArrowDownIcon className="w-4 h-4 mr-2" />
                      <span>Laporan Kerusakan</span>
                    </>
                  )}
                </div>
              </button>
            </div>
          </div>
        </div>

        <div className="w-full overflow-x-auto overflow-y-hidden px-6">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-600/30">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white tracking-wider w-48">
                  <div className="flex items-center">
                    <VideoCameraIcon className="w-4 h-4 mr-2" />
                    Kamera
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white tracking-wider">
                  <div className="flex items-center">
                    <ServerIcon className="w-4 h-4 mr-1" />
                    IP Address
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white tracking-wider w-48">
                  <div className="flex items-center">
                    <BuildingOfficeIcon className="w-4 h-4 mr-2" />
                    Lokasi
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white tracking-wider">
                  <div className="flex items-center">
                    <CalendarIcon className="w-4 h-4 mr-2" />
                    Tanggal
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white tracking-wider">
                  <div className="flex items-center">
                    <SignalIcon className="w-4 h-4 mr-2" />
                    Status
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white tracking-wider">
                  <div className="flex items-center">
                    <AdjustmentsVerticalIcon className="w-4 h-4 mr-2" />
                    Aksi
                  </div>
                </th>
              </tr>
            </thead>
            
            <motion.tbody 
              className="bg-transparent divide-y divide-gray-200 dark:divide-slate-600/30"
              variants={tableAnimations.tbody}
              initial="hidden"
              animate="visible"
            >
              {historyData.map((item) => (
                <HistoryListItem 
                  key={item.id_history}
                  item={item}
                  rowVariants={tableAnimations.row}
                  onNoteClick={handleNoteClick}
                  onRepairClick={handleRepairClick}
                />
              ))}
            </motion.tbody>
          </table>
        </div>
      </motion.div>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        onPageChange={onPageChange}
        itemName="Data History"
        showFirstLast={true}
        maxPageButtons={5}
      />

      {/* Note Modal */}
      <HistoryNoteModal
        isOpen={isNoteModalOpen}
        onClose={handleNoteModalClose}
        historyItem={selectedHistory}
      />

      {/* Repair Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isRepairConfirmOpen}
        onClose={() => {
          setIsRepairConfirmOpen(false);
          setSelectedHistory(null);
        }}
        onConfirm={handleRepairConfirm}
        title="Konfirmasi Perbaikan"
        message={repairConfirmMessage}
        confirmText="Iya"
        cancelText="Tidak"
        type="info"
        loading={repairLoading}
      />
    </>
  );
};

export default HistoryList;