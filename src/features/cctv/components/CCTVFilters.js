import React from 'react';
import SearchInput from '../../../components/common/SearchInput';
import CustomStatusSelect from '../../../components/common/CustomStatusSelect';
import CustomLocationSelect from '../../../components/common/CustomLocationSelect';

const CCTVFilters = ({
    searchTerm,
    statusFilter,
    locationFilter,
    locationGroups,
    loading,
    hasActiveFilters,
    onSearch,
    onStatusFilter,
    onLocationFilter,
    onClearFilters
}) => {
    return (
        <div className="bg-white dark:bg-slate-900/70 backdrop-blur-sm p-6 rounded-xl border border-gray-300 dark:border-slate-700/50">
            <div className="flex flex-col lg:flex-row gap-4 items-end">
                <div className="flex-1">
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                        Cari CCTV
                    </label>
                    <SearchInput 
                        value={searchTerm} 
                        onChange={onSearch} 
                        placeholder="Cari berdasarkan titik letak atau IP..." 
                    />
                </div>
                <div className="w-full lg:w-48">
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                        Status
                    </label>
                    <CustomStatusSelect 
                        value={statusFilter} 
                        onChange={onStatusFilter} 
                        disabled={loading} 
                    />
                </div>
                <div className="w-full lg:w-48">
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                        Lokasi
                    </label>
                    <CustomLocationSelect 
                        value={locationFilter} 
                        onChange={onLocationFilter} 
                        disabled={loading} 
                        locations={locationGroups} 
                        variant="default"
                    />
                </div>
                {hasActiveFilters && (
                    <div className="w-full lg:w-auto">
                        <button
                            onClick={onClearFilters}
                            disabled={loading}
                            className="w-full bg-gray-300 hover:bg-gray-400 dark:bg-slate-700 dark:hover:bg-slate-600 disabled:bg-gray-200 dark:disabled:bg-slate-800 text-gray-800 dark:text-white px-4 py-3 rounded-lg font-medium transition-colors duration-200 text-sm"
                        >
                            Clear
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CCTVFilters;