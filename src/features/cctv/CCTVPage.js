import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import MainLayout from '../../components/layout/MainLayout';
import Sidebar from '../../components/layout/Sidebar';
import CCTVStatistics from './components/CCTVStatistics';
import CCTVFilters from './components/CCTVFilters';
import CCTVList from './CCTVList';
import CCTVModals from './components/CCTVModals';
import useCCTVPage from './hooks/useCCTVPage';
import useStaggerAnimation from '../../hooks/useStaggerAnimation';

const CCTVPage = () => {
    const navigate = useNavigate();

    const animations = useStaggerAnimation({
        staggerDelay: 0.08,
        initialDelay: 0.1,
        duration: 0.4,
        yOffset: 0
    });

    const {
        // Data & Loading
        paginatedCctvData,
        filteredCctvData,
        allCctvData,
        locationGroups,
        loading,
        error,
        statistics,
        bottomRef,
        
        // Filters
        searchTerm,
        statusFilter,
        locationFilter,
        hasActiveFilters,
        handleSearch,
        handleStatusFilter,
        handleLocationFilter,
        handleClearFilters,
        
        // Pagination
        currentPage,
        totalPages,
        itemsPerPage,
        setCurrentPage,
        
        // Actions
        handleRefresh,
        handleAddCCTV,
        handleManageLocations,
        handleEditCCTV,
        handleDeleteCCTV,
        
        // Modals
        showCreateModal,
        showEditModal,
        showLocationModal,
        editingCCTV,
        handleModalClose,
        handleCCTVCreated,
        handleCCTVUpdated,
        handleLocationCreated,
        
        // Confirm Dialog
        confirmDialog,
        handleConfirmAction,
        handleCloseConfirmDialog
    } = useCCTVPage();

    const handlePageChange = (pageId, path) => navigate(path);

    return (
        <>
            <MainLayout 
                Sidebar={(props) => (
                    <Sidebar 
                        {...props}
                        onPageChange={handlePageChange}
                    />
                )}
                navbarTitle="Manajemen CCTV"
                navbarSubtitle="Kontrol keamanan Rumah Sakit Citra Husada"
            >
                <motion.div 
                    className="space-y-6"
                    variants={animations.container}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                >
                    {/* Statistics Cards */}
                    <motion.div variants={animations.item}>
                        <CCTVStatistics
                            statistics={statistics}
                            loading={loading}
                            onAddCCTV={handleAddCCTV}
                            onManageLocations={handleManageLocations}
                        />
                    </motion.div>

                    {/* Filters */}
                    <motion.div variants={animations.item}>
                        <CCTVFilters
                            searchTerm={searchTerm}
                            statusFilter={statusFilter}
                            locationFilter={locationFilter}
                            locationGroups={locationGroups}
                            loading={loading}
                            hasActiveFilters={hasActiveFilters}
                            onSearch={handleSearch}
                            onStatusFilter={handleStatusFilter}
                            onLocationFilter={handleLocationFilter}
                            onClearFilters={handleClearFilters}
                        />
                    </motion.div>

                    {/* CCTV List */}
                    <motion.div variants={animations.item}>
                        <CCTVList
                            cctvData={paginatedCctvData}
                            loading={loading}
                            error={error}
                            onRefresh={handleRefresh}
                            onEdit={handleEditCCTV}
                            onDelete={handleDeleteCCTV}
                            locationGroups={locationGroups}
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                            totalItems={filteredCctvData.length}
                        />
                    </motion.div>

                    {/* Results Count */}
                    {!loading && allCctvData.length > 0 && (
                        <motion.div 
                            variants={animations.item}
                            className="text-sm text-gray-500 dark:text-gray-400 text-center"
                        >
                            Menampilkan {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, filteredCctvData.length)} dari {filteredCctvData.length} CCTV yang difilter ({allCctvData.length} total).
                        </motion.div>
                    )}

                    <div ref={bottomRef} className="h-1" />
                </motion.div>
            </MainLayout>

            {/* Modals */}
            <CCTVModals
                showCreateModal={showCreateModal}
                showEditModal={showEditModal}
                showLocationModal={showLocationModal}
                editingCCTV={editingCCTV}
                locationGroups={locationGroups}
                confirmDialog={confirmDialog}
                onModalClose={handleModalClose}
                onCCTVCreated={handleCCTVCreated}
                onCCTVUpdated={handleCCTVUpdated}
                onLocationCreated={handleLocationCreated}
                onConfirmAction={handleConfirmAction}
                onCloseConfirmDialog={handleCloseConfirmDialog}
            />
        </>
    );
};

export default CCTVPage;