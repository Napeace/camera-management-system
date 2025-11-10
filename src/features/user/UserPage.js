import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import MainLayout from '../../components/layout/MainLayout';
import Sidebar from '../../components/layout/Sidebar';
import UserList from './components/UserList';
import UserCreateModal from './UserCreateModal';
import UserEditModal from './UserEditModal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import UserStatistics from './components/UserStatistics';
import UserFilters from './components/UserFilters';
import useUserPage from './hooks/useUserPage';

const UserPage = () => {
    const bottomRef = useRef(null);

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

    // Auto-scroll when pagination changes
    useEffect(() => {
        if (bottomRef.current && !loading) {
            bottomRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'end'
            });
        }
    }, [currentPage, loading]);

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
                            onPageChange={handlePaginationChange}
                            totalItems={filteredUsers.length}
                            itemsPerPage={itemsPerPage}
                        />
                    </motion.div>

                    {/* Results Count */}
                    {!loading && users.length > 0 && (
                        <motion.div
                            variants={animations.item}
                            className="text-sm text-gray-500 dark:text-gray-400 text-center"
                        >
                            Menampilkan {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, filteredUsers.length)} dari {filteredUsers.length} user yang difilter ({users.length} total).
                        </motion.div>
                    )}

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