import React from 'react';
import CustomStatusSelect from '../../../components/common/CustomStatusSelect';
import CustomLocationSelect from '../../../components/common/CustomLocationSelect';

const LiveMonitoringStats = ({
    allStats,
    statusFilter,
    locationFilter,
    locationGroups,
    loading,
    onStatusFilter,
    onLocationFilter
}) => {
    return (
        <div className="flex-1 bg-white dark:bg-slate-900/70 backdrop-blur-sm p-6 rounded-xl border border-gray-300 dark:border-slate-700/50 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex flex-col md:flex-row md:items-center gap-4 flex-1">
                    <div className="flex flex-col">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            CCTV RS. Citra Husada
                        </label>
                        <div className="flex flex-wrap items-center gap-3 text-sm">
                            <div className="relative overflow-hidden flex items-center gap-2 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm px-6 py-3 rounded-2xl border-2 border-indigo-500">
                                <div className="absolute inset-0 bg-gradient-to-bl from-indigo-500/20 via-indigo-500/10 to-transparent dark:from-indigo-900/30 dark:via-indigo-900/15 dark:to-transparent pointer-events-none"></div>
                                <span className="relative z-10 text-sm text-gray-900 dark:text-white">{allStats.total}</span>
                                <span className="relative z-10 text-sm text-gray-900 dark:text-white">Total</span>
                            </div>
                            <div className="relative overflow-hidden flex items-center gap-2 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm px-6 py-3 rounded-2xl border-2 border-green-500">
                                <div className="absolute inset-0 bg-gradient-to-bl from-green-500/20 via-green-500/10 to-transparent dark:from-green-900/30 dark:via-green-900/15 dark:to-transparent pointer-events-none"></div>
                                <span className="relative z-10 text-sm text-gray-900 dark:text-white">{allStats.online}</span>
                                <span className="relative z-10 text-sm text-gray-900 dark:text-white">Online</span>
                            </div>
                            <div className="relative overflow-hidden flex items-center gap-2 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm px-6 py-3 rounded-2xl border-2 border-red-500">
                                <div className="absolute inset-0 bg-gradient-to-bl from-red-500/20 via-red-500/10 to-transparent dark:from-red-900/30 dark:via-red-900/15 dark:to-transparent pointer-events-none"></div>
                                <span className="relative z-10 text-sm text-gray-900 dark:text-white">{allStats.offline}</span>
                                <span className="relative z-10 text-sm text-gray-900 dark:text-white">Offline</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                            Pilih Status
                        </label>
                        <CustomStatusSelect 
                            value={statusFilter} 
                            onChange={onStatusFilter} 
                            disabled={loading} 
                        />
                    </div>
                    <div className="flex-1 min-w-0">
                        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                            Pilih Lokasi
                        </label>
                        <CustomLocationSelect
                            value={locationFilter}
                            onChange={onLocationFilter}
                            disabled={loading}
                            locations={locationGroups}
                            variant="default"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LiveMonitoringStats;