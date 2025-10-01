// CCTVPage.jsx
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import MainLayout from '../components/layout/MainLayout';
import Sidebar from '../components/layout/Sidebar';
import SearchInput from '../components/common/SearchInput';
import StatCard, { StatCardWithAction } from '../components/common/StatCard';
import CustomStatusSelect from '../components/common/CustomStatusSelect';
import CustomLocationSelect from '../components/common/CustomLocationSelect';
import cctvService from '../services/cctvService';
import CCTVCreateModal from '../features/cctv/CCTVCreateModal';
import CCTVEditModal from '../features/cctv/CCTVEditModal';
import CCTVList from '../features/cctv/CCTVList';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { 
    PlusIcon, 
    VideoCameraIcon, 
    SignalIcon, 
    SignalSlashIcon
} from '@heroicons/react/24/outline';

const CCTVPage = () => {
    const { user } = useAuth();
    const { showSuccess, showError, showInfo } = useToast();
    const navigate = useNavigate();

    // State for CCTV data
    const [allCctvData, setAllCctvData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [locationGroups, setLocationGroups] = useState([]);
    const hasShownErrorRef = useRef(false);

    // State for modals
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
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

    const statistics = useMemo(() => {
        const total = allCctvData.length;
        const online = allCctvData.filter(cctv => cctv.is_streaming === true).length;
        const offline = total - online;
        return { total, online, offline };
    }, [allCctvData]);

    const handlePageChange = useCallback((pageId, path) => navigate(path), [navigate]);
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

    const hasActiveFilters = searchTerm || statusFilter || locationFilter;

    return (
        <>
            <MainLayout 
                Sidebar={(props) => (
                    <Sidebar 
                        {...props}
                        onPageChange={handlePageChange}
                    />
                )}
            >
                <div className="space-y-6">
                    {/* Statistics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <StatCard 
                            label="Online Kamera" 
                            value={String(statistics.online)}
                            icon={SignalIcon}
                            color="green"
                            loading={loading}
                        />
                        <StatCard 
                            label="Offline Kamera" 
                            value={String(statistics.offline)}
                            icon={SignalSlashIcon}
                            color="red"
                            loading={loading}
                        />
                        <div className="md:col-span-2">
                            <StatCardWithAction 
                                label="Total Kamera" 
                                value={String(statistics.total)}
                                icon={VideoCameraIcon}
                                buttonText="Tambah Kamera"
                                buttonIcon={PlusIcon}
                                onButtonClick={handleAddCCTV}
                                loading={loading}
                                color="blue"
                            />
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="bg-white dark:bg-slate-900/70 backdrop-blur-sm p-6 rounded-xl border border-gray-300 dark:border-slate-700/50">
                        <div className="flex flex-col lg:flex-row gap-4 items-end">
                            <div className="flex-1">
                                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Cari CCTV</label>
                                <SearchInput 
                                    value={searchTerm} 
                                    onChange={handleSearch} 
                                    placeholder="Cari berdasarkan titik letak atau IP..." 
                                />
                            </div>
                            <div className="w-full lg:w-48">
                                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Status</label>
                                <CustomStatusSelect 
                                    value={statusFilter} 
                                    onChange={handleStatusFilter} 
                                    disabled={loading} 
                                />
                            </div>
                            <div className="w-full lg:w-48">
                                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Lokasi</label>
                                <CustomLocationSelect 
                                    value={locationFilter} 
                                    onChange={handleLocationFilter} 
                                    disabled={loading} 
                                    locations={locationGroups} 
                                />
                            </div>
                            {hasActiveFilters && (
                                <div className="w-full lg:w-auto">
                                    <button
                                        onClick={handleClearFilters}
                                        disabled={loading}
                                        className="w-full bg-gray-300 hover:bg-gray-400 dark:bg-slate-700 dark:hover:bg-slate-600 disabled:bg-gray-200 dark:disabled:bg-slate-800 text-gray-800 dark:text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 text-sm">
                                        Clear
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* CCTV List Component */}
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

                    {/* Results Count */}
                    {!loading && allCctvData.length > 0 && (
                        <div className="text-sm text-gray-500 dark:text-gray-400 text-center">
                            Menampilkan {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, filteredCctvData.length)} dari {filteredCctvData.length} CCTV yang difilter ({allCctvData.length} total).
                        </div>
                    )}
                </div>
            </MainLayout>

            {/* Modals and Dialogs */}
            <CCTVCreateModal 
                isOpen={showCreateModal} 
                onClose={handleModalClose} 
                onCCTVCreated={handleCCTVCreated} 
                locationGroups={locationGroups} 
            />
            <CCTVEditModal 
                isOpen={showEditModal} 
                onClose={handleModalClose} 
                cctvToEdit={editingCCTV} 
                onCCTVUpdated={handleCCTVUpdated} 
                locationGroups={locationGroups} 
            />
            <ConfirmDialog 
                isOpen={confirmDialog.isOpen} 
                onClose={handleCloseConfirmDialog} 
                onConfirm={handleConfirmAction} 
                title={confirmDialog.title}
                message={confirmDialog.message}
                confirmText={confirmDialog.confirmText || 'Iya'}
                cancelText={confirmDialog.cancelText || 'Tidak'}
                type={confirmDialog.type}
                loading={confirmDialog.loading}
            />
        </>
    );
};

export default CCTVPage;