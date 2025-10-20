import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useToast } from '../../../contexts/ToastContext';
import cctvService from '../../../services/cctvService';
import useCCTVStats from '../../../hooks/useCCTVStats';

const useCCTVPage = () => {
    const { showSuccess, showError, showInfo } = useToast();
    const bottomRef = useRef(null);
    const hasShownErrorRef = useRef(false);

    // State for CCTV data
    const [allCctvData, setAllCctvData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [locationGroups, setLocationGroups] = useState([]);

    // State for modals
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showLocationModal, setShowLocationModal] = useState(false);
    const [editingCCTV, setEditingCCTV] = useState(null);

    // State for filters
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [locationFilter, setLocationFilter] = useState('');

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Confirm dialog states
    const [confirmDialog, setConfirmDialog] = useState({
        isOpen: false,
        type: 'danger',
        title: '',
        message: '',
        confirmText: 'Iya',
        cancelText: 'Tidak',
        cctv: null,
        action: null,
        loading: false
    });

    // Auto-scroll when pagination changes
    useEffect(() => {
        if (bottomRef.current && !loading) {
            bottomRef.current.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'end',
                inline: 'nearest'
            });
        }
    }, [currentPage, loading]);

    const extractErrorMessage = (error) => {
        if (error?.response?.data?.message) return error.response.data.message;
        if (error?.response?.data?.detail) return JSON.stringify(error.response.data.detail);
        if (error?.message) return error.message;
        return 'An unexpected error occurred.';
    };

    const fetchAllData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            hasShownErrorRef.current = false;
            
            const [locations, cctvResult] = await Promise.all([
                cctvService.getLocationGroups(),
                cctvService.getAllCCTV()
            ]);
            setLocationGroups(locations || []);
            setAllCctvData(cctvResult.data || []);
        } catch (err) {
            console.error('Error fetching initial data:', err);
            const errorMessage = extractErrorMessage(err);
            setError(errorMessage);
            
            if (!hasShownErrorRef.current) {
                showError('Load Failed', errorMessage);
                hasShownErrorRef.current = true;
            }
        } finally {
            setLoading(false);
        }
    }, [showError]);

    useEffect(() => {
        fetchAllData();
    }, [fetchAllData]);

    const filteredCctvData = useMemo(() => {
        let filtered = allCctvData;
        if (searchTerm.trim()) {
            const searchLower = searchTerm.toLowerCase();
            filtered = filtered.filter(cctv =>
                (cctv.titik_letak && cctv.titik_letak.toLowerCase().includes(searchLower)) ||
                (cctv.ip_address && cctv.ip_address.toLowerCase().includes(searchLower))
            );
        }
        if (statusFilter) {
            const isOnline = statusFilter === 'online';
            filtered = filtered.filter(cctv => cctv.is_streaming === isOnline);
        }
        if (locationFilter) {
            filtered = filtered.filter(cctv => cctv.id_location == locationFilter);
        }
        return filtered;
    }, [allCctvData, searchTerm, statusFilter, locationFilter]);

    const totalPages = Math.ceil(filteredCctvData.length / itemsPerPage);
    const paginatedCctvData = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return filteredCctvData.slice(startIndex, endIndex);
    }, [filteredCctvData, currentPage, itemsPerPage]);

    const statistics = useCCTVStats(allCctvData);

    const handleSearch = useCallback((e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    }, []);

    const handleStatusFilter = useCallback((e) => {
        setStatusFilter(e.target.value);
        setCurrentPage(1);
    }, []);

    const handleLocationFilter = useCallback((e) => {
        setLocationFilter(e.target.value);
        setCurrentPage(1);
    }, []);
    
    const handleClearFilters = useCallback(() => {
        setSearchTerm('');
        setStatusFilter('');
        setLocationFilter('');
        setCurrentPage(1);
        showInfo('Filters Cleared', 'All filters have been reset');
    }, [showInfo]);

    const handleAddCCTV = useCallback(() => setShowCreateModal(true), []);
    const handleManageLocations = useCallback(() => setShowLocationModal(true), []);
    
    const handleEditCCTV = useCallback((cctv) => {
        setEditingCCTV(cctv);
        setShowEditModal(true);
    }, []);

    const handleDeleteCCTV = useCallback((cctv) => {
        setConfirmDialog({
            isOpen: true,
            type: 'danger',
            title: 'Hapus CCTV',
            message: 'Apakah anda yakin untuk menghapus CCTV ini ?',
            confirmText: 'Iya',
            cancelText: 'Tidak',
            cctv: cctv,
            action: 'delete',
            loading: false
        });
    }, []);

    const handleRefresh = useCallback(() => {
        fetchAllData();
        showInfo('Refreshing', 'Reloading CCTV data...');
    }, [fetchAllData, showInfo]);

    const handleConfirmAction = useCallback(async () => {
        const { action, cctv } = confirmDialog;
        setConfirmDialog(prev => ({ ...prev, loading: true }));
        
        try {
            switch (action) {
                case 'delete':
                    await cctvService.deleteCCTV(cctv.id_cctv);
                    setConfirmDialog({ isOpen: false });
                    await fetchAllData();
                    const cctvName = cctv.titik_letak || 'CCTV';
                    showSuccess('CCTV Berhasil Dihapus', `${cctvName} telah dihapus`);
                    break;
                    
                default:
                    setConfirmDialog({ isOpen: false });
                    break;
            }
        } catch (err) {
            console.error('Action failed:', err);
            setConfirmDialog(prev => ({ ...prev, loading: false }));
            const errorMessage = extractErrorMessage(err);
            showError('Action Failed', errorMessage);
        }
    }, [confirmDialog, fetchAllData, showSuccess, showError]);

    const handleCloseConfirmDialog = useCallback(() => {
        if (!confirmDialog.loading) {
            setConfirmDialog({ isOpen: false });
        }
    }, [confirmDialog.loading]);

    const handleModalClose = useCallback(() => {
        setShowCreateModal(false);
        setShowEditModal(false);
        setShowLocationModal(false);
        setEditingCCTV(null);
    }, []);

    const handleCCTVCreated = useCallback(async (newCCTV) => {
        await fetchAllData();
        const cctvName = newCCTV?.titik_letak || newCCTV?.title || 'CCTV baru';
        showSuccess('CCTV Berhasil Dibuat', `${cctvName} berhasil ditambahkan`);
    }, [fetchAllData, showSuccess]);

    const handleCCTVUpdated = useCallback(async (updatedCCTV) => {
        await fetchAllData();
        const cctvName = updatedCCTV?.titik_letak || updatedCCTV?.title || 'CCTV';
        showSuccess('CCTV Berhasil Diperbarui', `${cctvName} berhasil diperbarui`);
    }, [fetchAllData, showSuccess]);

    const handleLocationCreated = useCallback(async (newLocation) => {
        try {
            const locations = await cctvService.getLocationGroups();
            setLocationGroups(locations || []);
        } catch (err) {
            console.error('Error refreshing locations:', err);
        }
    }, []);

    const hasActiveFilters = searchTerm || statusFilter || locationFilter;

    return {
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
    };
};

export default useCCTVPage;