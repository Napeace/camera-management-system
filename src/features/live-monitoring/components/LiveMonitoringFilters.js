import React from 'react';

const LiveMonitoringFilters = ({ gridLayout, onGridLayoutChange }) => {
    const layouts = ['auto', '2x2', '3x3', '4x4'];

    return (
        <div className="grid grid-cols-2 gap-2">
            {layouts.map(layout => (
                <button
                    key={layout}
                    onClick={() => onGridLayoutChange(layout)}
                    className={`w-12 h-12 text-xs font-semibold rounded-xl transition-all ${
                        gridLayout === layout
                            ? 'bg-blue-600 text-white shadow-lg'
                            : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 border border-gray-300 dark:border-slate-600'
                    }`}
                >
                    {layout === 'auto' ? 'Auto' : layout}
                </button>
            ))}
        </div>
    );
};

export default LiveMonitoringFilters;