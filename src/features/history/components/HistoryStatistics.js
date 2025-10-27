// features/history/components/HistoryStatistics.js
import React from 'react';

const HistoryStatistics = ({ stats, onExportPDF, isExporting, onAddHistory }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div className="bg-white dark:bg-slate-950/50 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-slate-600/30">
        <p className="text-sm text-gray-600 dark:text-gray-400">Total Errors</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
      </div>
      <div className="bg-white dark:bg-slate-950/50 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-slate-600/30">
        <p className="text-sm text-gray-600 dark:text-gray-400">Today's Errors</p>
        <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.today}</p>
      </div>
      <div className="bg-white dark:bg-slate-950/50 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-slate-600/30 relative">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Yesterday's Errors</p>
            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{stats.yesterday}</p>
          </div>
          <div className="flex flex-col gap-2 shrink-0">
            <button 
              onClick={onExportPDF}
              disabled={isExporting}
              className="inline-flex items-center px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              title="Export to PDF"
            >
              {isExporting ? (
                <>
                  <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </>
              ) : (
                  <>  
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                  Export PDF
                  </>
              )}
            </button>
            <button 
              onClick={onAddHistory}
              className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition-all duration-200"
              title="Add History"
            >
              <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Tambah History
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistoryStatistics;