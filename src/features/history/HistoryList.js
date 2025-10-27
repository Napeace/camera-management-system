// features/history/HistoryList.js - Refactored
import React from 'react';
import { motion } from 'framer-motion';
import useTableAnimation from '../../hooks/useTableAnimation';
import HistoryListItem from './components/HistoryListItem';

const HistoryList = ({ historyData, loading, error }) => {
  const tableAnimations = useTableAnimation({
    staggerDelay: 0.05,
    duration: 0.3,
    enableHover: false
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
          
          <motion.tbody 
            className="bg-white dark:bg-slate-950/50 divide-y divide-gray-200 dark:divide-slate-600/30"
            variants={tableAnimations.tbody}
            initial="hidden"
            animate="visible"
          >
            {historyData.map((item) => (
              <HistoryListItem 
                key={item.id_history}
                item={item}
                rowVariants={tableAnimations.row}
              />
            ))}
          </motion.tbody>
        </table>
      </div>
    </motion.div>
  );
};

export default HistoryList;