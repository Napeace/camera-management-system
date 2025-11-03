// features/history/components/HistoryFilters.js
import React from 'react';
import SearchInput from '../../../components/common/SearchInput';
import DateRangeFilter from './DateRangeFilter';

const HistoryFilters = ({
  searchTerm,
  startDate,
  endDate,
  hasActiveFilters,
  onSearch,
  onStartDateChange,
  onEndDateChange,
  onClearFilters
}) => {
  return (
    <div className="bg-white dark:bg-slate-950/50 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-slate-600/30">
      {/* Grid responsif - 2 kolom untuk filter, auto untuk clear button */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr_auto] gap-4">
        {/* Search Input - Left Column */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Cari CCTV
          </label>
          <SearchInput 
            value={searchTerm}
            onChange={onSearch}
            placeholder="Cari berdasarkan titik letak atau IP Address"
          />
        </div>

        {/* Date Range Filter - Middle Column */}
        <div>
          <DateRangeFilter
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={onStartDateChange}
            onEndDateChange={onEndDateChange}
          />
        </div>

        {/* Clear Button - Right Column (only shows when filters active) */}
        {hasActiveFilters && (
          <div className="flex items-end">
            <button 
              onClick={onClearFilters} 
              className="px-6 py-2.5 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors duration-200 font-medium text-sm whitespace-nowrap"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryFilters;