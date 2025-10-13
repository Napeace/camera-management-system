// features/history/HistoryList.js - With Stagger Animation
import React from 'react';
import { motion } from 'framer-motion';
import useTableAnimation from '../../hooks/useTableAnimation';

const HistoryList = ({ historyData, loading, error }) => {
  // Gunakan custom hook untuk table animation tanpa hover scale
  const tableAnimations = useTableAnimation({
    staggerDelay: 0.05,
    duration: 0.3,
    enableHover: false // Disable hover animation untuk mencegah scroll
  });

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-950/50 rounded-lg shadow-sm border border-gray-200 dark:border-slate-600/30">
        <div className="animate-pulse p-6">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-1/4"></div>
                <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-1/3"></div>
                <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-1/4"></div>
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
          <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">No Error History Found</h3>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">No CCTV camera errors have been recorded yet.</p>
        </div>
      </div>
    );
  }

  const formatDateTime = (dateTimeString) => {
    const date = new Date(dateTimeString);
    return {
      date: date.toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }),
      time: date.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    };
  };

  const getStatusBadge = (status) => {
    if (status) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
          <svg className="w-1.5 h-1.5 mr-1" fill="currentColor" viewBox="0 0 8 8">
            <circle cx={4} cy={4} r={3} />
          </svg>
          Online
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300">
        <svg className="w-1.5 h-1.5 mr-1" fill="currentColor" viewBox="0 0 8 8">
          <circle cx={4} cy={4} r={3} />
        </svg>
        Offline
      </span>
    );
  };

  return (
    <motion.div 
      className="bg-white dark:bg-slate-950/50 rounded-lg shadow-sm border border-gray-200 dark:border-slate-600/30 overflow-hidden"
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
    >
      <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-600/30">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Error History Records</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">List of CCTV camera errors and incidents</p>
      </div>

      {/* Removed overflow-x-auto to prevent horizontal scroll */}
      <div className="w-full">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-600/30">
          <thead className="bg-gray-50 dark:bg-slate-900/20">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Camera Info
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Location
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Error Date & Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Duration
              </th>
            </tr>
          </thead>
          
          {/* Animated tbody */}
          <motion.tbody 
            className="bg-white dark:bg-slate-950/50 divide-y divide-gray-200 dark:divide-slate-600/30"
            variants={tableAnimations.tbody}
            initial="hidden"
            animate="visible"
          >
            {historyData.map((item) => {
              const { date, time } = formatDateTime(item.error_time);
              const errorDate = new Date(item.error_time);
              const now = new Date();
              const durationMs = now - errorDate;
              
              const formatDuration = (ms) => {
                const seconds = Math.floor(ms / 1000);
                const minutes = Math.floor(seconds / 60);
                const hours = Math.floor(minutes / 60);
                const days = Math.floor(hours / 24);
                const weeks = Math.floor(days / 7);
                const months = Math.floor(days / 30);
                const years = Math.floor(days / 365);
                
                if (years > 0) {
                  return `${years} tahun lalu`;
                } else if (months > 0) {
                  return `${months} bulan lalu`;
                } else if (weeks > 0) {
                  return `${weeks} minggu lalu`;
                } else if (days > 0) {
                  return `${days} hari lalu`;
                } else if (hours > 0) {
                  return `${hours} jam lalu`;
                } else if (minutes > 0) {
                  return `${minutes} menit lalu`;
                } else {
                  return 'Baru saja';
                }
              };
              
              const durationText = formatDuration(durationMs);
              
              return (
                <motion.tr 
                  key={item.id_history}
                  variants={tableAnimations.row}
                  className="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors duration-150"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8">
                        <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-slate-700 flex items-center justify-center">
                          <svg className="h-4 w-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </div>
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          Camera #{item.id_cctv}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {item.ip_address}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">{item.location_name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">{date}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{time}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(item.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {durationText}
                  </td>
                </motion.tr>
              );
            })}
          </motion.tbody>
        </table>
      </div>
    </motion.div>
  );
};

export default HistoryList;