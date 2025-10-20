// src/features/dashboard/components/RecentHistoryTable.js
import React from 'react';
import { motion } from 'framer-motion';
import { ClipboardDocumentListIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import useTableAnimation from '../../../hooks/useTableAnimation';

/**
 * RecentHistoryTable Component
 * Menampilkan 4 record history CCTV terbaru dalam bentuk table
 * 
 * @param {Array} historyData - Array of history records (optional, uses static data if not provided)
 * @param {Boolean} loading - Loading state
 * @param {Function} onSeeMore - Handler untuk navigate ke halaman history lengkap
 */
const RecentHistoryTable = ({ historyData, loading, onSeeMore }) => {
    const tableAnimations = useTableAnimation({
        staggerDelay: 0.08,
        duration: 0.4,
        enableHover: false,
        yOffset: 20
    });

    // Static data untuk demo (nanti bisa diganti dengan data dari API)
    const defaultHistoryData = [
        { id_history: 1, id_cctv: 1, ip_address: '192.168.1.101', location_name: 'Lobby Utama', error_time: '2024-01-15T10:30:00Z', status: false },
        { id_history: 2, id_cctv: 2, ip_address: '192.168.1.102', location_name: 'Ruang Server', error_time: '2024-01-15T09:15:00Z', status: false },
        { id_history: 3, id_cctv: 3, ip_address: '192.168.1.103', location_name: 'Parkiran Depan', error_time: '2024-01-14T16:45:00Z', status: true },
        { id_history: 4, id_cctv: 4, ip_address: '192.168.1.104', location_name: 'Koridor Lantai 2', error_time: '2024-01-14T14:20:00Z', status: false },
    ];

    const data = historyData || defaultHistoryData;

    return (
        <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ 
                opacity: 1, 
                height: "auto",
                transition: {
                    opacity: { duration: 0.5, delay: 0.5 },
                    height: { duration: 0.6, delay: 0.5 },
                    ease: [0.4, 0, 0.2, 1]
                }
            }}
            exit={{ 
                opacity: 0, 
                height: 0,
                transition: {
                    opacity: { duration: 0.3 },
                    height: { duration: 0.4 },
                    ease: [0.4, 0, 0.2, 1]
                }
            }}
            className="bg-white dark:bg-slate-950/50 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-slate-600/30 shadow-sm flex flex-col overflow-hidden"
        >
            <div className="p-4 border-b border-gray-200 dark:border-slate-600/30">
                <div className="flex items-center space-x-2">
                    <ClipboardDocumentListIcon className="w-5 h-5 text-blue-400" />
                    <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                        Recent History
                    </h3>
                </div>
            </div>
            <div className="overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-slate-900/20 sticky top-0">
                        <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">
                                Location
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">
                                Status
                            </th>
                        </tr>
                    </thead>
                    <motion.tbody
                        className="divide-y divide-gray-200 dark:divide-slate-600/30"
                        variants={tableAnimations.tbody}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                    >
                        {data.slice(0, 4).map((item) => (
                            <motion.tr
                                key={item.id_history}
                                className="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors duration-150"
                                variants={tableAnimations.row}
                            >
                                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                    {item.location_name}
                                </td>
                                <td className="px-4 py-3">
                                    <span
                                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                            item.status
                                                ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                                                : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                                        }`}
                                    >
                                        {item.status ? 'Online' : 'Offline'}
                                    </span>
                                </td>
                            </motion.tr>
                        ))}
                    </motion.tbody>
                </table>
            </div>
            <div className="p-3 border-t border-gray-200 dark:border-slate-600/30">
                <button
                    onClick={onSeeMore}
                    className="flex items-center justify-center w-full text-xs text-gray-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-colors duration-200"
                >
                    Selengkapnya
                    <ChevronDownIcon className="w-3 h-3 ml-1" />
                </button>
            </div>
        </motion.div>
    );
};

export default RecentHistoryTable;