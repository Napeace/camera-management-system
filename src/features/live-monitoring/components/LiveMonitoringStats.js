import React from 'react';
import CustomStatusSelect from '../../../components/common/CustomStatusSelect';
import CustomLocationSelect from '../../../components/common/CustomLocationSelect';
import { VideoCameraIcon } from '@heroicons/react/24/outline';

const LiveMonitoringStats = ({
    allStats,
    statusFilter,
    locationFilter,
    locationGroups,
    loading,
    onStatusFilter,
    onLocationFilter,
    // NEW: Props for custom camera selection
    viewMode = 'location',
    selectedCameraCount = 0,
    onOpenCameraSelector
}) => {
    return (
        <div className="flex-1 bg-white dark:bg-slate-900/70 backdrop-blur-sm p-4 sm:p-6 rounded-xl border border-gray-300 dark:border-slate-700/50 shadow-sm">
            {/* Single Row Layout - Stats + Filters */}
            <div className="flex flex-col xl:flex-row xl:items-center gap-4 xl:gap-6">
                {/* Stats Display */}
                <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        CCTV RS. Citra Husada
                    </label>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-sm">
                        {/* Total Card */}
                        <div className="relative overflow-hidden flex items-center gap-2 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm px-4 sm:px-6 py-2.5 sm:py-3 rounded-2xl border-2 border-indigo-500">
                            <div className="absolute inset-0 bg-gradient-to-bl from-indigo-500/20 via-indigo-500/10 to-transparent dark:from-indigo-900/30 dark:via-indigo-900/15 dark:to-transparent pointer-events-none"></div>
                            {loading ? (
                                <>
                                    <div className="relative z-10 w-8 h-5 bg-gray-300 dark:bg-slate-700 animate-pulse rounded"></div>
                                    <span className="relative z-10 text-sm text-gray-900 dark:text-white">Total</span>
                                </>
                            ) : (
                                <>
                                    <span className="relative z-10 text-sm text-gray-900 dark:text-white font-semibold">{allStats.total}</span>
                                    <span className="relative z-10 text-sm text-gray-900 dark:text-white">Total</span>
                                </>
                            )}
                        </div>
                        
                        {/* Online Card */}
                        <div className="relative overflow-hidden flex items-center gap-2 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm px-4 sm:px-6 py-2.5 sm:py-3 rounded-2xl border-2 border-green-500">
                            <div className="absolute inset-0 bg-gradient-to-bl from-green-500/20 via-green-500/10 to-transparent dark:from-green-900/30 dark:via-green-900/15 dark:to-transparent pointer-events-none"></div>
                            {loading ? (
                                <>
                                    <div className="relative z-10 w-8 h-5 bg-gray-300 dark:bg-slate-700 animate-pulse rounded"></div>
                                    <span className="relative z-10 text-sm text-gray-900 dark:text-white">Online</span>
                                </>
                            ) : (
                                <>
                                    <span className="relative z-10 text-sm text-gray-900 dark:text-white font-semibold">{allStats.online}</span>
                                    <span className="relative z-10 text-sm text-gray-900 dark:text-white">Online</span>
                                </>
                            )}
                        </div>
                        
                        {/* Offline Card */}
                        <div className="relative overflow-hidden flex items-center gap-2 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm px-4 sm:px-6 py-2.5 sm:py-3 rounded-2xl border-2 border-red-500">
                            <div className="absolute inset-0 bg-gradient-to-bl from-red-500/20 via-red-500/10 to-transparent dark:from-red-900/30 dark:via-red-900/15 dark:to-transparent pointer-events-none"></div>
                            {loading ? (
                                <>
                                    <div className="relative z-10 w-8 h-5 bg-gray-300 dark:bg-slate-700 animate-pulse rounded"></div>
                                    <span className="relative z-10 text-sm text-gray-900 dark:text-white">Offline</span>
                                </>
                            ) : (
                                <>
                                    <span className="relative z-10 text-sm text-gray-900 dark:text-white font-semibold">{allStats.offline}</span>
                                    <span className="relative z-10 text-sm text-gray-900 dark:text-white">Offline</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Filters - Responsive Grid: 1 col mobile, 2 col tablet, 3 col desktop */}
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    {/* Status Filter */}
                    <div className="w-full">
                        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                            Pilih Status
                        </label>
                        <CustomStatusSelect 
                            value={statusFilter} 
                            onChange={onStatusFilter} 
                            disabled={loading} 
                        />
                    </div>

                    {/* Location Filter */}
                    <div className="w-full">
                        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                            Pilih Lokasi
                        </label>
                        <CustomLocationSelect
                            value={locationFilter}
                            onChange={onLocationFilter}
                            disabled={loading || viewMode === 'custom'}
                            locations={locationGroups}
                            variant="default"
                        />
                    </div>

                    {/* NEW: Custom Camera Selection Button */}
                    <div className="w-full md:col-span-2 lg:col-span-1">
                        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                            Pilih Kamera
                        </label>
                        <button
                            onClick={onOpenCameraSelector}
                            disabled={loading}
                            className={`w-full px-4 py-2.5 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                                viewMode === 'custom'
                                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/30 hover:from-blue-700 hover:to-blue-800'
                                    : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-md hover:shadow-lg'
                            }`}
                        >
                            <div className="flex items-center justify-center gap-2">
                                <VideoCameraIcon className="w-5 h-5" />
                                <span className="truncate flex-1 min-w-0 text-sm">
                                    {viewMode === 'custom'
                                        ? `${selectedCameraCount} Kamera Dipilih`
                                        : 'Pilih Kamera'}
                                </span>
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LiveMonitoringStats;