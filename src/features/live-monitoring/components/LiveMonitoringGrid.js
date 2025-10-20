import React from 'react';
import { motion } from 'framer-motion';
import { VideoCameraIcon } from '@heroicons/react/24/outline';
import CameraFeedPlaceholder from './CameraFeedPlaceholder';
import Pagination from '../../../components/common/Pagination';

const LiveMonitoringGrid = ({
    initialLoading,
    loading,
    locationFilter,
    statusFilter,
    cctvCameras,
    paginatedCameras,
    itemsPerPage,
    currentPage,
    totalPages,
    gridClass,
    onCameraClick,
    onPageChange
}) => {
    const loadingAnimationVariants = {
        initial: { opacity: 0 },
        animate: {
            opacity: 1,
            transition: { duration: 0.4, ease: 'easeInOut' },
        },
        exit: {
            opacity: 0,
            transition: { duration: 0.3, ease: 'easeInOut' },
        },
    };

    const gridAnimationVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                duration: 0.4,
                ease: 'easeInOut',
                when: "beforeChildren",
                staggerChildren: 0.05,
            },
        },
        exit: {
            opacity: 0,
            transition: { duration: 0.3, ease: 'easeInOut' },
        },
    };

    if (initialLoading || (loading && cctvCameras.length === 0)) {
        return (
            <motion.div
                key="loading"
                variants={loadingAnimationVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="flex flex-col items-center justify-center h-96 bg-white dark:bg-slate-900/70 rounded-xl border border-gray-300 dark:border-slate-700/50"
            >
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">
                    {initialLoading ? 'Loading locations...' : 'Loading cameras...'}
                </p>
            </motion.div>
        );
    }

    if (!locationFilter) {
        return (
            <motion.div
                key="no-location"
                variants={gridAnimationVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="text-center py-20 bg-white dark:bg-slate-900/70 rounded-xl border border-gray-300 dark:border-slate-700/50"
            >
                <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                        <VideoCameraIcon className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                    </div>
                    <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">Pilih Lokasi</p>
                    <p className="text-gray-600 dark:text-gray-400">Pilih lokasi untuk melihat kamera yang tersedia</p>
                </div>
            </motion.div>
        );
    }

    if (cctvCameras.length === 0) {
        return (
            <motion.div
                key="no-cameras"
                variants={gridAnimationVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="text-center py-20 bg-white dark:bg-slate-900/70 rounded-xl border border-gray-300 dark:border-slate-700/50"
            >
                <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                        <VideoCameraIcon className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                    </div>
                    <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">Tidak Ada Kamera</p>
                    <p className="text-gray-600 dark:text-gray-400">
                        {statusFilter
                            ? 'Tidak ada kamera yang sesuai dengan filter status'
                            : 'Belum ada kamera yang terdaftar di lokasi ini'}
                    </p>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            variants={gridAnimationVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="bg-white dark:bg-slate-900/70 rounded-xl border border-gray-300 dark:border-slate-700/50 overflow-hidden"
        >
            <div className="p-4">
                <div className={`grid ${gridClass} gap-4`}>
                    {paginatedCameras.map(camera => (
                        <CameraFeedPlaceholder
                            key={camera.id}
                            camera={camera}
                            onClick={onCameraClick}
                        />
                    ))}
                    {Array.from({
                        length: Math.max(0, itemsPerPage - paginatedCameras.length),
                    }).map((_, index) => (
                        <div
                            key={`empty-${index}`}
                            className="bg-gray-100 dark:bg-gray-800/50 rounded-xl aspect-video flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-700"
                        >
                            <p className="text-gray-400 dark:text-gray-500 text-sm">Slot Kosong</p>
                        </div>
                    ))}
                </div>
            </div>

            {totalPages > 1 && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={cctvCameras.length}
                    itemsPerPage={itemsPerPage}
                    onPageChange={onPageChange}
                    itemName="kamera"
                    showFirstLast={true}
                />
            )}
        </motion.div>
    );
};

export default LiveMonitoringGrid;