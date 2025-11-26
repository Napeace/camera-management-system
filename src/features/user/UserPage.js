import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import MainLayout from '../../components/layout/MainLayout';
import Sidebar from '../../components/layout/Sidebar';
import UserList from './components/UserList';
import UserCreateModal from './components/UserCreateModal';
import UserEditModal from './components/UserEditModal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import UserStatistics from './components/UserStatistics';
import UserFilters from './components/UserFilters';
import useUserPage from './hooks/useUserPage';

const UserPage = () => {
    const bottomRef = useRef(null);
    const [shouldScrollOnChange, setShouldScrollOnChange] = useState(false);

    const {
        // UI States
        searchTerm,
        roleFilter,
        currentPage,
        showCreateModal,
        showEditModal,
        editingUser,
        confirmDialog,
        
        // Data
        users,
        paginatedUsers,
        filteredUsers,
        statistics,
        totalPages,
        itemsPerPage,
        hasActiveFilters,
        roles,
        loadingRoles,
        
        // API States
        loading,
        error,
        
        // Handlers
        handleSearch,
        handleRoleFilter,
        handleClearFilters,
        handleAddUser,
        handleEditUser,
        handleDeleteUser,
        handleRefresh,
        handlePageChange,
        handlePaginationChange,
        handleModalClose,
        handleUserCreated,
        handleUserUpdated,
        handleConfirmAction,
        handleCloseConfirmDialog,
        
        // Functions
        updateUser,
        getConfirmButtonText,
        
        // Animations
        animations
    } = useUserPage();

    useEffect(() => {
        if (shouldScrollOnChange && bottomRef.current && !loading) {
            bottomRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'end'
            });
            setShouldScrollOnChange(false);
        }
    }, [currentPage, loading, shouldScrollOnChange]);

    const handlePaginationChangeWithScroll = (page) => {
        setShouldScrollOnChange(true);
        handlePaginationChange(page);
    };

    return (
        <>
            <MainLayout
                Sidebar={(props) => (
                    <Sidebar
                        {...props}
                        onPageChange={handlePageChange}
                    />
                )}
                navbarTitle="Manajemen Pengguna"
                navbarSubtitle="Pengaturan Hak Akses dan Otoritas Pengguna"
            >
                <motion.div
                    className="space-y-6"
                    variants={animations.container}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                >
                    {/* Statistics Cards */}
                    <UserStatistics
                        statistics={statistics}
                        loading={loading}
                        onAddUserClick={handleAddUser}
                        itemVariants={animations.item}
                    />

                    {/* Filters */}
                    <UserFilters
                        searchTerm={searchTerm}
                        roleFilter={roleFilter}
                        loading={loading}
                        hasActiveFilters={hasActiveFilters}
                        onSearchChange={handleSearch}
                        onRoleChange={handleRoleFilter}
                        onClearFilters={handleClearFilters}
                        itemVariants={animations.item}
                        roles={roles}
                        loadingRoles={loadingRoles}
                    />

                    {/* User List Component */}
                    <motion.div variants={animations.item}>
                        <UserList
                            users={paginatedUsers}
                            loading={loading}
                            error={error}
                            onRefresh={handleRefresh}
                            onEdit={handleEditUser}
                            onDelete={handleDeleteUser}
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={handlePaginationChangeWithScroll}
                            totalItems={filteredUsers.length}
                            itemsPerPage={itemsPerPage}
                        />
                    </motion.div>
                    <div ref={bottomRef} className="h-1" />
                </motion.div>
            </MainLayout>

            {/* Modals */}
            <UserCreateModal
                isOpen={showCreateModal}
                onClose={handleModalClose}
                onUserCreated={handleUserCreated}
            />

            <UserEditModal
                isOpen={showEditModal}
                onClose={handleModalClose}
                onSave={updateUser}
                onUserUpdated={handleUserUpdated}
                userToEdit={editingUser}
            />

            {/* Confirmation Dialog */}
            <ConfirmDialog
                isOpen={confirmDialog.isOpen}
                onClose={handleCloseConfirmDialog}
                onConfirm={handleConfirmAction}
                title={confirmDialog.title}
                message={confirmDialog.message}
                confirmText={getConfirmButtonText()}
                cancelText="Batal"
                type={confirmDialog.type}
                loading={confirmDialog.loading}
            />
        </>
    );
};

export default UserPage;