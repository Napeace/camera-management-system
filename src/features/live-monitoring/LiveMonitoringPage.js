import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import MainLayout from '../../components/layout/MainLayout';
import Sidebar from '../../components/layout/Sidebar';
import LiveMonitoringStats from './components/LiveMonitoringStats';
import LiveMonitoringFilters from './components/LiveMonitoringFilters';
import LiveMonitoringGrid from './components/LiveMonitoringGrid';
import LiveMonitoringModal from './components/LiveMonitoringModal';
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
        handleCloseFullscreen
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
                    className="space-y-6"
                    variants={animations.container}
                    initial="hidden"
                    animate="visible"
                    exit={{ opacity: 0, transition: { duration: 0.3 } }}
                >
                    {/* Stats & Filters */}
                    <motion.div variants={animations.item} className="flex gap-4">
                        <LiveMonitoringStats
                            allStats={allStats}
                            statusFilter={statusFilter}
                            locationFilter={locationFilter}
                            locationGroups={locationGroups}
                            loading={loading}
                            onStatusFilter={handleStatusFilter}
                            onLocationFilter={handleLocationFilter}
                        />
                        
                        <LiveMonitoringFilters
                            gridLayout={gridLayout}
                            onGridLayoutChange={handleGridLayoutChange}
                        />
                    </motion.div>
                    
                    {/* Camera Grid */}
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

            {fullscreenCamera && (
                <LiveMonitoringModal 
                    camera={fullscreenCamera} 
                    onClose={handleCloseFullscreen} 
                />
            )}
        </>
    );
};

export default LiveMonitoringPage;