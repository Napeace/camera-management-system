// src/features/dashboard/components/RecentHistoryTable.js - COMPLETE REDESIGN
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FolderIcon,
  VideoCameraIcon, 
  ServerIcon, 
  BuildingOfficeIcon, 
  CalendarIcon, 
  SignalIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import useTableAnimation from '../../../hooks/useTableAnimation';
import historyService from '../../../services/historyService';

/**
 * RecentHistoryTable Component - Dashboard Version
 * Menampilkan 4 record history CCTV terbaru dengan tampilan identik HistoryList
 * Tanpa: Actions column, Pagination, Header buttons
 * 
 * @param {Function} onSeeMore - Handler untuk navigate ke halaman history lengkap
 */
const RecentHistoryTable = ({ onSeeMore }) => {
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const tableAnimations = useTableAnimation({
    staggerDelay: 0.05,
    duration: 0.3,
    enableHover: false
  });

  // Fetch recent history data on mount
  useEffect(() => {
    const fetchRecentHistory = async () => {
      setLoading(true);
      setError(null);
      
      try {
         const response = await historyService.getHistory({ 
          limit: 4,
          skip: 0 
        });
         if (response.data && response.data.status === 'success') {
          const data = response.data.data || [];
           // Take only first 4 items (sorted by latest from backend)
          setHistoryData(data.slice(0, 4));
        } else {
          console.warn('⚠️ Unexpected response format:', response);
          setHistoryData([]);
        }
      } catch (err) {
        console.error('❌ Error fetching recent history:', err);
        setError(err.message || 'Failed to load recent history');
        setHistoryData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentHistory();
  }, []);

  // Utility: Format DateTime (same as HistoryListItem)
  const formatDateTime = (dateTimeString) => {
    try {
      // Backend format: "2025-10-27 10:30:00"
      const formattedString = dateTimeString.replace(' ', 'T');
      const date = new Date(formattedString);
      
      if (isNaN(date.getTime())) {
        return { date: 'Invalid Date', time: 'Invalid Time' };
      }
      
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');

      return {
        date: `${day}/${month}/${year}`,
        time: `${hours}:${minutes}`
      };
    } catch (error) {
      console.error('Error formatting date:', error);
      return { date: 'Invalid Date', time: 'Invalid Time' };
    }
  };

  // Utility: Get Status Badge (same as HistoryListItem)
  const getStatusBadge = (status) => {
    if (status) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
          <svg className="w-1.5 h-1.5 mr-1.5" fill="currentColor" viewBox="0 0 8 8">
            <circle cx={4} cy={4} r={3} />
          </svg>
          Online
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300">
        <svg className="w-1.5 h-1.5 mr-1.5" fill="currentColor" viewBox="0 0 8 8">
          <circle cx={4} cy={4} r={3} />
        </svg>
        Offline
      </span>
    );
  };

  // Loading State
  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-950/50 rounded-lg shadow-sm border border-gray-200 dark:border-slate-600/30">
        <div className="animate-pulse p-6">
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-1/6"></div>
                <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-1/6"></div>
                <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-1/4"></div>
                <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-1/5"></div>
                <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-1/6"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error State
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

  // Empty State
  if (!historyData || historyData.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-950/50 rounded-lg shadow-sm border border-gray-200 dark:border-slate-600/30 p-6">
        <div className="text-center py-8">
          <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">No Recent History</h3>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">No CCTV errors have been recorded recently.</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className="bg-white dark:bg-slate-950/80 rounded-xl shadow-sm border border-gray-200 dark:border-slate-500/30 overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
    >
      {/* Header dengan Title - TANPA BUTTONS */}
      <div className="px-6 py-4 rounded-t-xl bg-white dark:bg-slate-400/10 border-gray-200 border dark:border-slate-500/30">
        <div className="flex items-center justify-between">
          {/* Title */}
          <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
            <FolderIcon className="w-5 h-5 mr-2" />
            Riwayat Aktivitas Kamera CCTV
          </h3>
        </div>
      </div>

      {/* Table Container */}
      <div className="w-full overflow-x-auto overflow-y-hidden px-6">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-600/30">
          <thead>
            <tr>
              {/* Kamera */}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white tracking-wider w-48">
                <div className="flex items-center">
                  <VideoCameraIcon className="w-4 h-4 mr-2" />
                  Kamera
                </div>
              </th>
              
              {/* IP Address */}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white tracking-wider">
                <div className="flex items-center">
                  <ServerIcon className="w-4 h-4 mr-1" />
                  IP Address
                </div>
              </th>
              
              {/* Lokasi */}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white tracking-wider w-48">
                <div className="flex items-center">
                  <BuildingOfficeIcon className="w-4 h-4 mr-2" />
                  Lokasi
                </div>
              </th>
              
              {/* Tanggal */}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white tracking-wider">
                <div className="flex items-center">
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  Tanggal
                </div>
              </th>
              
              {/* Status */}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white tracking-wider">
                <div className="flex items-center">
                  <SignalIcon className="w-4 h-4 mr-2" />
                  Status
                </div>
              </th>
              
              {/* NO AKSI COLUMN */}
            </tr>
          </thead>
          
          <motion.tbody 
            className="bg-transparent divide-y divide-gray-200 dark:divide-slate-600/30"
            variants={tableAnimations.tbody}
            initial="hidden"
            animate="visible"
          >
            {historyData.map((item) => {
              const { date, time } = formatDateTime(item.created_at);
              
              return (
                <motion.tr 
                  key={item.id_history}
                  variants={tableAnimations.row}
                  className="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors duration-150"
                >
                  {/* Kamera - dengan truncate */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div 
                      className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[180px]" 
                      title={item.cctv_name || 'Unknown Camera'}
                    >
                      {item.cctv_name || 'Unknown Camera'}
                    </div>
                  </td>
                  
                  {/* IP Address */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {item.cctv_ip || '-'}
                    </div>
                  </td>
                  
                  {/* Lokasi - dengan truncate */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div 
                      className="text-sm text-gray-900 dark:text-white truncate max-w-[160px]" 
                      title={item.location_name || '-'}
                    >
                      {item.location_name || '-'}
                    </div>
                  </td>
                  
                  {/* Tanggal */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">{date}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{time}</div>
                  </td>
                  
                  {/* Status */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(item.status)}
                  </td>
                  
                  {/* NO AKSI COLUMN */}
                </motion.tr>
              );
            })}
          </motion.tbody>
        </table>
      </div>

      {/* Footer: Selengkapnya Button */}
      <div className="px-6 py-4 bg-white dark:bg-slate-900/50">
        <button
          onClick={onSeeMore}
          className="flex items-center justify-center w-full text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 group"
        >
          <span>Selengkapnya</span>
          <ChevronDownIcon className="w-4 h-4 ml-2 transition-transform duration-200" />
        </button>
      </div>
    </motion.div>
  );
};

export default RecentHistoryTable;