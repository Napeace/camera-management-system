import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import MainLayout from '../components/layout/MainLayout';
import Sidebar from '../components/layout/Sidebar';
import SearchInput from '../components/common/SearchInput';
import cctvService from '../services/cctvService';
import CCTVCreateModal from '../features/cctv/CCTVCreateModal';
import CCTVEditModal from '../features/cctv/CCTVEditModal';
import CCTVList from '../features/cctv/CCTVList';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { PlusIcon, VideoCameraIcon, SignalIcon, SignalSlashIcon } from '@heroicons/react/24/outline';


// Komponen Select dengan tema gelap
const ThemedSelect = React.memo(({ children, ...props }) => (
    <select 
        {...props}
        className="block w-full p-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
    >
        {children}
    </select>
));

const StatusSelect = React.memo(({ value, onChange, disabled }) => (
    <ThemedSelect value={value} onChange={onChange} disabled={disabled}>
        <option value="">Semua Status</option>
        <option value="online">Online</option>
        <option value="offline">Offline</option>
    </ThemedSelect>
));

const LocationSelect = React.memo(({ value, onChange, disabled, locations }) => (
    <ThemedSelect value={value} onChange={onChange} disabled={disabled}>
        <option value="">Semua Lokasi</option>
        {locations.map((location) => (
            <option key={location.id_location} value={location.id_location}>
                {location.nama_lokasi}
            </option>
        ))}
    </ThemedSelect>
));

// Kartu Statistik dengan tema gelap
const StatCard = ({ label, value, icon, colorClass }) => (
    <div className="bg-slate-800/50 backdrop-blur-sm p-4 rounded-xl border border-slate-600/30 flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-400">{label}</p>
        <p className={`text-2xl font-bold ${colorClass}`}>{value}</p>
      </div>
      <div className={`text-2xl ${colorClass}`}>
        {icon}
      </div>
    </div>
);

const CCTVPage = () => {
    const { user, logout } = useAuth();
    const { showSuccess, showError, showInfo } = useToast();
    const navigate = useNavigate();

    // State for CCTV data
    const [allCctvData, setAllCctvData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [locationGroups, setLocationGroups] = useState([]);

    // State for modals
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingCCTV, setEditingCCTV] = useState(null);

    // State for filters
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [locationFilter, setLocationFilter] = useState('');

    // Confirm dialog states
    const [confirmDialog, setConfirmDialog] = useState({
        isOpen: false,
        type: 'danger',
        title: '',
        message: '',
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
            showError('Load Failed', errorMessage);
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
            filtered = filtered.filter(cctv => cctv.status === isOnline);
        }
        if (locationFilter) {
            filtered = filtered.filter(cctv => cctv.id_location == locationFilter);
        }
        return filtered;
    }, [allCctvData, searchTerm, statusFilter, locationFilter]);

    const statistics = useMemo(() => {
        const total = allCctvData.length;
        const online = allCctvData.filter(cctv => cctv.status === true).length;
        const offline = total - online;
        return { total, online, offline };
    }, [allCctvData]);

    const handleLogout = useCallback(() => {
        setConfirmDialog({ action: 'logout' /* ...lainnya */ });
    }, []);

    const handlePageChange = useCallback((pageId, path) => navigate(path), [navigate]);
    const handleSearch = useCallback((e) => setSearchTerm(e.target.value), []);
    const handleStatusFilter = useCallback((e) => setStatusFilter(e.target.value), []);
    const handleLocationFilter = useCallback((e) => setLocationFilter(e.target.value), []);
    
    const handleClearFilters = useCallback(() => {
        setSearchTerm('');
        setStatusFilter('');
        setLocationFilter('');
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
            title: 'Delete CCTV',
            message: 'This CCTV will be permanently removed. This action cannot be undone.',
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
                case 'logout':
                    logout();
                    window.location.href = '/login';
                    break;
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
    }, [confirmDialog, logout, fetchAllData, showSuccess, showError]);

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

    const getConfirmButtonText = () => {
        if (confirmDialog.action === 'delete') return 'Delete';
        if (confirmDialog.action === 'logout') return 'Logout';
        return 'Confirm';
    };

    return (
        <>
            <MainLayout user={user} Sidebar={(props) => (<Sidebar {...props} user={user} onLogout={handleLogout} onPageChange={handlePageChange} />)}>
                <div className="space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-white">Manajemen CCTV</h1>
                            <p className="text-gray-400 mt-1">Kelola data kamera keamanan rumah sakit</p>
                        </div>
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={handleAddCCTV}
                                disabled={loading}
                                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2">
                                <PlusIcon className="w-5 h-5" />
                                Tambah CCTV
                            </button>
                        </div>
                    </div>

                    {/* Statistics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <StatCard label="Total CCTV" value={statistics.total} colorClass="text-white" icon={<VideoCameraIcon className="w-6 h-6"/>} />
                        <StatCard label="Online" value={statistics.online} colorClass="text-green-400" icon={<SignalIcon className="w-6 h-6"/>} />
                        <StatCard label="Offline" value={statistics.offline} colorClass="text-red-400" icon={<SignalSlashIcon className="w-6 h-6"/>} />
                    </div>

                    {/* Filters */}
                    <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-xl border border-slate-600/30">
                        <div className="flex flex-col lg:flex-row gap-4 items-end">
                            <div className="flex-1">
                                <label className="block text-sm font-medium mb-2 text-gray-300">Cari CCTV</label>
                                <SearchInput value={searchTerm} onChange={handleSearch} placeholder="Cari berdasarkan titik letak atau IP..." />
                            </div>
                            <div className="w-full lg:w-48">
                                <label className="block text-sm font-medium mb-2 text-gray-300">Status</label>
                                <StatusSelect value={statusFilter} onChange={handleStatusFilter} disabled={loading} />
                            </div>
                            <div className="w-full lg:w-48">
                                <label className="block text-sm font-medium mb-2 text-gray-300">Lokasi</label>
                                <LocationSelect value={locationFilter} onChange={handleLocationFilter} disabled={loading} locations={locationGroups} />
                            </div>
                            {hasActiveFilters && (
                                <div className="w-full lg:w-auto">
                                    <button
                                        onClick={handleClearFilters}
                                        disabled={loading}
                                        className="w-full bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 text-sm">
                                        Clear
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* CCTV List Component */}
                    <CCTVList
                        cctvData={filteredCctvData}
                        loading={loading}
                        error={error}
                        onRefresh={handleRefresh}
                        onEdit={handleEditCCTV}
                        onDelete={handleDeleteCCTV}
                        locationGroups={locationGroups}
                    />

                    {/* Results Count */}
                    {!loading && allCctvData.length > 0 && (
                        <div className="text-sm text-gray-400 text-center">
                            Menampilkan {filteredCctvData.length} dari {allCctvData.length} total CCTV.
                        </div>
                    )}
                </div>
            </MainLayout>

            {/* Modals and Dialogs */}
            <CCTVCreateModal isOpen={showCreateModal} onClose={handleModalClose} onCCTVCreated={handleCCTVCreated} locationGroups={locationGroups} />
            <CCTVEditModal isOpen={showEditModal} onClose={handleModalClose} cctvToEdit={editingCCTV} onCCTVUpdated={handleCCTVUpdated} locationGroups={locationGroups} />
            <ConfirmDialog 
                isOpen={confirmDialog.isOpen} 
                onClose={handleCloseConfirmDialog} 
                onConfirm={handleConfirmAction} 
                title={confirmDialog.title}
                message={confirmDialog.message}
                confirmText={getConfirmButtonText()}
                cancelText="Cancel"
                type={confirmDialog.type}
                loading={confirmDialog.loading}
            />
        </>
    );
};

export default CCTVPage;