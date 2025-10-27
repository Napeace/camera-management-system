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
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Search History</label>
          <SearchInput 
            value={searchTerm}
            onChange={onSearch}
            placeholder="Search by IP address or location..."
          />
        </div>
        <div className="lg:w-100">
          <DateRangeFilter 
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={onStartDateChange}
            onEndDateChange={onEndDateChange}
          />
        </div>
        {hasActiveFilters && (
          <div className="lg:w-32 flex items-end">
            <button 
              onClick={onClearFilters} 
              className="w-full px-4 py-2 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors duration-200"
            >
              Clear
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryFilters;