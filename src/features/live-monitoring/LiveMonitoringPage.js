import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import MainLayout from '../../components/layout/MainLayout';
import Sidebar from '../../components/layout/Sidebar';
import LiveMonitoringStats from './components/LiveMonitoringStats';
import LiveMonitoringFilters from './components/LiveMonitoringFilters';
import LiveMonitoringGrid from './components/LiveMonitoringGrid';
import LiveMonitoringModal from './components/LiveMonitoringModal';
import CameraSelectorModal from './components/CameraSelectorModal';
import useLiveMonitoring from './hooks/useLiveMonitoring';
import useStaggerAnimation from '../../hooks/useStaggerAnimation';

const LiveMonitoringPage = () => {
    const navigate = useNavigate();

    const animations = useStaggerAnimation({
        staggerDelay: 0.08,
        initialDelay: 0.1,
        duration: 0.4,
        yOffset: 0,
    });

    const {
        // Data & Loading
        paginatedCameras,
        cctvCameras,
        locationGroups,
        loading,
        initialLoading,
        allStats,
        bottomRef,
        
        // Filters
        statusFilter,
        locationFilter,
        handleStatusFilter,
        handleLocationFilter,
        
        // Grid Layout
        gridLayout,
        handleGridLayoutChange,
        getGridClass,
        
        // Pagination
        currentPage,
        totalPages,
        itemsPerPage,
        handlePaginationChange,
        gridKey,
        
        // Fullscreen Modal
        fullscreenCamera,
        handleCameraClick,
        handleCloseFullscreen,

        // NEW: Custom Camera Selection
        viewMode,
        selectedCameraIds,
        allAvailableCameras,
        isCameraSelectorOpen,
        handleOpenCameraSelector,
        handleCloseCameraSelector,
        handleApplyCustomSelection,
        handleResetCustomSelection,
    } = useLiveMonitoring();

    const handlePageChange = (pageId, path) => navigate(path);

    return (
        <>
            <MainLayout
                Sidebar={props => <Sidebar {...props} onPageChange={handlePageChange} />}
                navbarTitle="Live Monitoring"
                navbarSubtitle="Pantau segala aktivitas Rumah Sakit Citra Husada"
            >
                <motion.div 
                    className="space-y-4 sm:space-y-6"
                    variants={animations.container}
                    initial="hidden"
                    animate="visible"
                    exit={{ opacity: 0, transition: { duration: 0.3 } }}
                >
                    {/* Stats & Filters - Responsive Layout: column mobile, row from tablet up */}
                    <motion.div 
                        variants={animations.item} 
                        className="flex flex-col gap-4"
                    >
                        <div className="flex flex-col md:flex-row gap-4">
                            {/* Stats Section - Full width on mobile, flex-1 on tablet+ */}
                            <LiveMonitoringStats
                                allStats={allStats}
                                statusFilter={statusFilter}
                                locationFilter={locationFilter}
                                locationGroups={locationGroups}
                                loading={loading}
                                onStatusFilter={handleStatusFilter}
                                onLocationFilter={handleLocationFilter}
                                // NEW: Pass custom camera selection props
                                viewMode={viewMode}
                                selectedCameraCount={selectedCameraIds.length}
                                onOpenCameraSelector={handleOpenCameraSelector}
                            />
                            
                            {/* Grid Layout Filters - Hidden on mobile and smaller tablets, show on larger screens ONLY when layout is horizontal */}
                            <div className="hidden xl:block xl:w-auto">
                                <LiveMonitoringFilters
                                    gridLayout={gridLayout}
                                    onGridLayoutChange={handleGridLayoutChange}
                                />
                            </div>
                        </div>

                        {/* Grid Layout Filters - Show on mobile, tablet, and when Stats+Filters wrap to 2 rows */}
                        <div className="xl:hidden">
                            <div className="bg-white dark:bg-slate-900/70 backdrop-blur-sm p-4 rounded-xl border border-gray-300 dark:border-slate-700/50 shadow-sm">
                                <label className="block text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">
                                    Tata Letak Grid
                                </label>
                                <div className="grid grid-cols-4 gap-2">
                                    {['auto', '2x2', '3x3', '4x4'].map(layout => (
                                        <button
                                            key={layout}
                                            onClick={() => handleGridLayoutChange(layout)}
                                            className={`w-full py-2.5 text-xs font-semibold rounded-lg transition-all ${
                                                gridLayout === layout
                                                    ? 'bg-blue-600 text-white shadow-lg'
                                                    : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 border border-gray-300 dark:border-slate-600'
                                            }`}
                                        >
                                            {layout === 'auto' ? 'Auto' : layout}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                    
                    {/* Camera Grid - Responsive */}
                    <motion.div 
                        variants={animations.item}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ 
                            opacity: 1, 
                            height: "auto",
                            transition: {
                                opacity: { duration: 0.5, delay: 0.3 },
                                height: { duration: 0.6, delay: 0.3 },
                                ease: [0.4, 0, 0.2, 1]
                            }
                        }}
                        exit={{ 
                            opacity: 0, 
                            height: 0,
                            transition: {
                                duration: 0.3,
                                ease: [0.4, 0, 0.2, 1]
                            }
                        }}
                        className="overflow-hidden"
                    >
                        <AnimatePresence mode="wait">
                            <LiveMonitoringGrid
                                key={gridKey}
                                initialLoading={initialLoading}
                                loading={loading}
                                locationFilter={locationFilter}
                                statusFilter={statusFilter}
                                cctvCameras={cctvCameras}
                                paginatedCameras={paginatedCameras}
                                itemsPerPage={itemsPerPage}
                                currentPage={currentPage}
                                totalPages={totalPages}
                                gridClass={getGridClass()}
                                onCameraClick={handleCameraClick}
                                onPageChange={handlePaginationChange}
                            />
                        </AnimatePresence>
                    </motion.div>

                    <div ref={bottomRef} className="h-1" />
                </motion.div>
            </MainLayout>

            {/* Fullscreen Camera Modal */}
            {fullscreenCamera && (
                <LiveMonitoringModal 
                    camera={fullscreenCamera} 
                    onClose={handleCloseFullscreen} 
                />
            )}

            {/* NEW: Camera Selector Modal */}
            <CameraSelectorModal
                isOpen={isCameraSelectorOpen}
                onClose={handleCloseCameraSelector}
                allCameras={allAvailableCameras}
                selectedCameraIds={selectedCameraIds}
                onApply={handleApplyCustomSelection}
                onReset={handleResetCustomSelection}
                maxSelection={16}
            />
        </>
    );
};

export default LiveMonitoringPage;