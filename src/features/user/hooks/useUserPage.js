import { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { useToast } from '../../../contexts/ToastContext';
import useUsers from '../../../hooks/useUsers';
import useStaggerAnimation from '../../../hooks/useStaggerAnimation';

const useUserPage = () => {
    const { user } = useAuth();
    const { showSuccess, showError, showInfo } = useToast();
    const navigate = useNavigate();

    const animations = useStaggerAnimation({
        staggerDelay: 0.08,
        initialDelay: 0.1,
        duration: 0.4,
        yOffset: 0
    });

    // Local UI states
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Confirm dialog states
    const [confirmDialog, setConfirmDialog] = useState({
        isOpen: false,
        type: 'danger',
        title: '',
        message: '',
        user: null,
        action: null,
        loading: false
    });

    const {
        users,
        loading,
        error,
        updateUser,
        softDeleteUser,
        hardDeleteUser,
        fetchUsers,
    } = useUsers();

     
    const statistics = useMemo(() => {
        const total = users.length;
        const superAdmins = users.filter(u => u.user_role_name === 'SuperAdmin').length;
        const security = users.filter(u => u.user_role_name === 'Security').length;
        return { total, superAdmins, security };
    }, [users]);  

    // Memoized filtered users
    const filteredUsers = useMemo(() => {
        let filtered = users;

        if (searchTerm.trim()) {
            const searchLower = searchTerm.toLowerCase();
            filtered = filtered.filter(user =>
                (user.nama && user.nama.toLowerCase().includes(searchLower)) ||
                (user.username && user.username.toLowerCase().includes(searchLower)) ||
                (user.nik && String(user.nik).toLowerCase().includes(searchLower))
            );
        }

        if (roleFilter) {
            filtered = filtered.filter(user => user.user_role_name === roleFilter);
        }

        return filtered;
    }, [users, searchTerm, roleFilter]);

    // Calculate paginated users
    const paginatedUsers = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return filteredUsers.slice(startIndex, endIndex);
    }, [filteredUsers, currentPage, itemsPerPage]);

    // Calculate total pages
    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

    // Helper function to extract error message
    const extractErrorMessage = useCallback((error) => {
        if (error?.response?.data?.message) return error.response.data.message;
        if (error?.response?.data?.detail) return error.response.data.detail;
        if (typeof error?.response?.data === 'string') return error.response.data;
        if (error?.message) return error.message;
        if (typeof error === 'string') return error;

        if (error?.response?.status === 422) {
            if (error?.response?.data?.errors) {
                const errors = error.response.data.errors;
                if (Array.isArray(errors)) {
                    return errors.map(err => err.message || err).join(', ');
                } else if (typeof errors === 'object') {
                    return Object.values(errors).flat().join(', ');
                }
            }
            return 'Validation failed. Please check your file format and data.';
        }

        return 'An unexpected error occurred. Please try again.';
    }, []);

    const handlePageChange = useCallback((pageId, path) => {
        navigate(path);
    }, [navigate]);

    const handlePaginationChange = useCallback((page) => {
        setCurrentPage(page);
    }, []);

    const handleSearch = useCallback((e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    }, []);

    const handleRoleFilter = useCallback((e) => {
        setRoleFilter(e.target.value);
        setCurrentPage(1);
    }, []);

    const handleClearFilters = useCallback(() => {
        setSearchTerm('');
        setRoleFilter('');
        setCurrentPage(1);
        showInfo('Filter Dibersihkan', 'Semua filter telah direset');
    }, [showInfo]);

    const handleAddUser = useCallback(() => {
        setShowCreateModal(true);
    }, []);

    const handleEditUser = useCallback((userToEdit) => {
        setEditingUser(userToEdit);
        setShowEditModal(true);
    }, []);

    const handleDeleteUser = useCallback((userToDelete, isHard = false) => {
        const actionType = isHard ? 'hard-delete' : 'soft-delete';
        const title = isHard ? 'Hapus Pengguna' : 'Hapus Pengguna';
        const message = `Apakah Anda yakin ingin menghapus pengguna ${userToDelete.nama}?`;

        setConfirmDialog({
            isOpen: true,
            type: 'danger',
            title: title,
            message: message,
            user: userToDelete,
            action: actionType,
            loading: false
        });
    }, []);

    const handleRefresh = useCallback(() => {
        fetchUsers();
        showInfo('Memuat Ulang', 'Memperbarui data user...');
    }, [fetchUsers, showInfo]);

    const handleConfirmAction = useCallback(async () => {
        const { action, user } = confirmDialog;
        setConfirmDialog(prev => ({ ...prev, loading: true }));

        try {
            switch (action) {
                case 'soft-delete':
                    await softDeleteUser(user.id_user);
                    setConfirmDialog({ isOpen: false });
                    showSuccess('User', `${user.nama} telah berhasil dihapus`);
                    break;

                case 'hard-delete':
                    await hardDeleteUser(user.id_user);
                    setConfirmDialog({ isOpen: false });
                    showSuccess('User Berhasil Dihapus Permanen', `${user.nama} telah dihapus permanen dari sistem`);
                    break;

                default:
                    setConfirmDialog({ isOpen: false });
                    break;
            }
        } catch (err) {
            console.error('Action failed:', err);
            setConfirmDialog(prev => ({ ...prev, loading: false }));
            const errorMessage = extractErrorMessage(err);
            showError('Tindakan Gagal', errorMessage);
        }
    }, [confirmDialog, softDeleteUser, hardDeleteUser, showSuccess, showError, extractErrorMessage]);

    const handleCloseConfirmDialog = useCallback(() => {
        if (!confirmDialog.loading) {
            setConfirmDialog({
                isOpen: false,
                type: 'danger',
                title: '',
                message: '',
                user: null,
                action: null,
                loading: false
            });
        }
    }, [confirmDialog.loading]);

    const handleModalClose = useCallback(() => {
        setShowCreateModal(false);
        setShowEditModal(false);
        setEditingUser(null);
    }, []);

    const handleUserCreated = useCallback(async (newUser) => {
        try {
            await fetchUsers();
            showSuccess(
                'User Berhasil Dibuat',
                `${newUser?.nama || 'User baru'} telah ditambahkan`
            );
        } catch (error) {
            console.error('Error refreshing data:', error);
            const errorMessage = extractErrorMessage(error);
            showError('Gagal Memuat Ulang', errorMessage);
        }
    }, [fetchUsers, showSuccess, showError, extractErrorMessage]);

    const handleUserUpdated = useCallback(async (updatedUser) => {
        try {
            await fetchUsers();
            showSuccess('User Berhasil Diperbarui', `${updatedUser?.nama || 'User'} telah diperbarui`);
        } catch (error) {
            console.error('Error refreshing data:', error);
            const errorMessage = extractErrorMessage(error);
            showError('Gagal Memuat Ulang', errorMessage);
        }
    }, [fetchUsers, showSuccess, showError, extractErrorMessage]);

    const hasActiveFilters = searchTerm || roleFilter;

    const getConfirmButtonText = () => {
        switch (confirmDialog.action) {
            case 'soft-delete':
                return 'Hapus';
            case 'hard-delete':
                return 'Hapus';
            default:
                return 'hapus';
        }
    };

    return {
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
    };
};

export default useUserPage;