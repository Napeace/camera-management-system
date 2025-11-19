import React, { useState, useEffect } from 'react';
import { XMarkIcon, ExclamationCircleIcon, PlusIcon, MapPinIcon, PencilSquareIcon, TrashIcon, CheckIcon } from '@heroicons/react/24/outline';
import locationService from '../../../services/locationService';
import { useToast } from '../../../contexts/ToastContext';
import ConfirmDialog from '../../../components/common/ConfirmDialog';

const LocationManagementModal = ({ isOpen, onClose, onLocationCreated }) => {
    const { showSuccess, showError } = useToast();
    const [loading, setLoading] = useState(false);
    const [loadingLocations, setLoadingLocations] = useState(false);
    const [error, setError] = useState('');
    const [isAnimating, setIsAnimating] = useState(false);
    const [shouldShow, setShouldShow] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [locations, setLocations] = useState([]);
    const [editingLocationId, setEditingLocationId] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [formData, setFormData] = useState({
        nama_lokasi: ''
    });

    // Handle animation
    useEffect(() => {
        if (isOpen) {
            setIsAnimating(true);
            setShowForm(false);
            setEditingLocationId(null);
            setFormData({ nama_lokasi: '' });
            setError('');
            setDeleteConfirm(null);
            fetchLocations();
            setTimeout(() => setShouldShow(true), 10);
        } else {
            setShouldShow(false);
            const timer = setTimeout(() => setIsAnimating(false), 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    const fetchLocations = async () => {
        setLoadingLocations(true);
        try {
            const response = await locationService.getAllLocations(0, 100);
            setLocations(response.data || []);
        } catch (err) {
            console.error('Error fetching locations:', err);
            let errorMsg = 'Gagal memuat data lokasi';
            if (err.response?.data?.detail) {
                errorMsg = typeof err.response.data.detail === 'string' 
                    ? err.response.data.detail 
                    : JSON.stringify(err.response.data.detail);
            } else if (err.message) {
                errorMsg = err.message;
            }
            showError('Load Failed', errorMsg);
        } finally {
            setLoadingLocations(false);
        }
    };

    const handleInputChange = (e) => {
        const { value } = e.target;
        setFormData({ nama_lokasi: value });
        if (error) setError('');
    };

    const validateForm = () => {
        const { nama_lokasi } = formData;
        if (!nama_lokasi.trim()) {
            setError('Nama lokasi wajib diisi');
            return false;
        }
        if (nama_lokasi.trim().length < 5) {
            setError('Nama lokasi minimal 5 karakter');
            return false;
        }
        if (nama_lokasi.trim().length > 200) {
            setError('Nama lokasi maksimal 200 karakter');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setLoading(true);
        setError('');

        try {
            const newLocation = await locationService.createLocation({
                nama_lokasi: formData.nama_lokasi.trim()
            });
            
            showSuccess('Lokasi Berhasil Dibuat', `${formData.nama_lokasi} telah ditambahkan`);
            
            await fetchLocations();
            setFormData({ nama_lokasi: '' });
            setShowForm(false);
            
            if (onLocationCreated) {
                onLocationCreated(newLocation);
            }
        } catch (err) {
            console.error('Create location error:', err);
            const errorMessage = err.message || 'Gagal membuat lokasi. Silakan coba lagi.';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleStartEdit = (location) => {
        setEditingLocationId(location.id_location);
        setFormData({ nama_lokasi: location.nama_lokasi });
        setError('');
        setShowForm(false);
    };

    const handleCancelEdit = () => {
        setEditingLocationId(null);
        setFormData({ nama_lokasi: '' });
        setError('');
    };

    const handleUpdateLocation = async (locationId) => {
        if (!validateForm()) return;

        setLoading(true);
        setError('');

        try {
            await locationService.updateLocation(locationId, {
                nama_lokasi: formData.nama_lokasi.trim()
            });
            
            showSuccess('Lokasi Berhasil Diperbarui', `${formData.nama_lokasi} telah diupdate`);
            
            await fetchLocations();
            setEditingLocationId(null);
            setFormData({ nama_lokasi: '' });
            
            if (onLocationCreated) {
                onLocationCreated();
            }
        } catch (err) {
            console.error('Update location error:', err);
            const errorMessage = err.message || 'Gagal memperbarui lokasi. Silakan coba lagi.';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClick = (location) => {
        setDeleteConfirm(location);
    };

    const handleConfirmDelete = async () => {
        if (!deleteConfirm) return;

        setLoading(true);
        try {
            await locationService.deleteLocation(deleteConfirm.id_location);
            
            showSuccess('Lokasi Berhasil Dihapus', `${deleteConfirm.nama_lokasi} telah dihapus`);
            
            await fetchLocations();
            setDeleteConfirm(null);
            
            if (onLocationCreated) {
                onLocationCreated();
            }
        } catch (err) {
            console.error('Delete location error:', err);
            const errorMessage = err.message || 'Gagal menghapus lokasi. Silakan coba lagi.';
            showError('Hapus Gagal', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleCancelDelete = () => {
        setDeleteConfirm(null);
    };

    const handleClose = () => {
        if (!loading) {
            setShowForm(false);
            setEditingLocationId(null);
            setDeleteConfirm(null);
            onClose();
        }
    };

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget && !loading && !deleteConfirm) {
            onClose();
        }
    };

    const toggleForm = () => {
        setShowForm(!showForm);
        setEditingLocationId(null);
        setError('');
        setFormData({ nama_lokasi: '' });
    };

    if (!isOpen && !isAnimating) return null;

    return (
        <>
            <div 
                onClick={handleBackdropClick}
                className={`fixed inset-0 bg-black/70 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-300 ${
                    shouldShow ? 'opacity-100' : 'opacity-0'
                }`}
            >
                {/* Outer Container */}
                <div 
                    className={`rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden bg-white dark:bg-gradient-to-b dark:from-slate-950 dark:to-blue-800 border border-blue-300 dark:border-slate-800 p-5 transform transition-all duration-300 ${
                        shouldShow ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
                    }`}
                >
                    {/* Inner Container */}
                    <div className="bg-gray-50/80 dark:bg-white/5 backdrop-blur-sm rounded-lg p-5 space-y-4 max-h-[calc(90vh-40px)] overflow-y-auto">
                        
                        {/* Header */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 flex items-center justify-center bg-blue-100 dark:bg-blue-800/30 border border-blue-300 dark:border-blue-800/30 rounded-lg">
                                    <MapPinIcon className="w-5 h-5 text-blue-600 dark:text-blue-800" />
                                </div>
                                <h2 className="text-xl text-gray-900 dark:text-white font-semibold">Kelola Lokasi DVR</h2>
                            </div>
                            <button 
                                onClick={handleClose} 
                                disabled={loading} 
                                className="text-gray-600 dark:text-white/70 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-white/10 rounded-lg p-1.5 disabled:opacity-50 transition-all"
                            >
                                <XMarkIcon className="w-6 h-6" />
                            </button>
                        </div>
                        
                        {/* Border separator */}
                        <div className="h-px bg-gray-200 dark:bg-white/10"></div>

                        {/* Add Location Button */}
                        {!showForm && !editingLocationId && (
                            <button
                                onClick={toggleForm}
                                className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-600/80 dark:hover:bg-blue-600 text-white px-4 py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
                            >
                                <PlusIcon className="w-5 h-5" />
                                Tambah Lokasi Baru
                            </button>
                        )}

                        {/* Form Section */}
                        {showForm && (
                            <div className="bg-white/50 dark:bg-white/5 backdrop-blur-sm border-2 border-gray-300 dark:border-white/10 rounded-lg p-4 space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-base font-semibold text-gray-900 dark:text-white">Tambah Lokasi Baru</h3>
                                </div>

                                {error && (
                                    <div className="bg-red-100 dark:bg-red-500/20 border border-red-300 dark:border-red-400/40 rounded-lg p-4">
                                        <div className="flex items-center">
                                            <ExclamationCircleIcon className="w-5 h-5 text-red-600 dark:text-red-300 mr-2 flex-shrink-0" />
                                            <p className="text-sm text-red-700 dark:text-red-200">{error}</p>
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-4">
                                    <div>
                                        <label htmlFor="nama_lokasi" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                                            Nama Lokasi <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text" 
                                            id="nama_lokasi" 
                                            name="nama_lokasi" 
                                            value={formData.nama_lokasi} 
                                            onChange={handleInputChange} 
                                            disabled={loading}
                                            className="block w-full px-4 py-3 bg-gray-50 dark:bg-white/15 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-white/50 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 disabled:opacity-50 transition-all"
                                            placeholder="Server Monitoring Lantai 1"
                                        />
                                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                            Minimal 5 karakter, maksimal 200 karakter
                                        </p>
                                    </div>

                                    <div className="flex gap-3 justify-end pt-2">
                                        <button
                                            type="button" 
                                            onClick={toggleForm} 
                                            disabled={loading}
                                            className="px-6 py-2.5 bg-gray-300 dark:bg-gray-400/30 rounded-lg text-gray-700 dark:text-gray-200 text-sm font-medium hover:bg-gray-400 dark:hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                        >
                                            Batal
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleSubmit}
                                            disabled={loading}
                                            className="px-8 py-2.5 bg-gray-300 dark:bg-gray-400/30 rounded-lg text-gray-700 dark:text-gray-200 text-sm font-medium hover:bg-gray-400 dark:hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                                        >
                                            {loading && (
                                                <svg className="animate-spin h-5 w-5 text-gray-700 dark:text-gray-200" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                            )}
                                            {loading ? 'Menyimpan...' : 'Simpan'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Locations List */}
                        <div className="space-y-3">
                            <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-300 flex items-center gap-2">
                                <span>Daftar Lokasi</span>
                                <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full">
                                    {locations.length} lokasi
                                </span>
                            </h3>

                            {loadingLocations ? (
                                <div className="space-y-2">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="bg-white/50 dark:bg-white/5 backdrop-blur-sm border-2 border-gray-300 dark:border-white/10 rounded-lg p-4 animate-pulse">
                                            <div className="h-5 bg-gray-200 dark:bg-white/10 rounded w-3/4"></div>
                                        </div>
                                    ))}
                                </div>
                            ) : locations.length === 0 ? (
                                <div className="bg-white/50 dark:bg-white/5 backdrop-blur-sm border-2 border-gray-300 dark:border-white/10 rounded-lg p-8 text-center">
                                    <MapPinIcon className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-3" />
                                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                                        Belum ada lokasi. Tambahkan lokasi baru untuk memulai.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
                                    {locations.map((location) => (
                                        <div 
                                            key={location.id_location}
                                            className="bg-white/50 dark:bg-white/5 backdrop-blur-sm border-2 border-gray-300 dark:border-white/10 rounded-lg p-4 hover:bg-white/70 dark:hover:bg-white/10 transition-all"
                                        >
                                            {editingLocationId === location.id_location ? (
                                                <div className="space-y-3">
                                                    {error && (
                                                        <div className="bg-red-100 dark:bg-red-500/20 border border-red-300 dark:border-red-400/40 rounded-lg p-3 backdrop-blur-sm">
                                                            <div className="flex items-center">
                                                                <ExclamationCircleIcon className="w-4 h-4 text-red-600 dark:text-red-300 mr-2 flex-shrink-0" />
                                                                <p className="text-xs text-red-700 dark:text-red-200">{error}</p>
                                                            </div>
                                                        </div>
                                                    )}
                                                    <input
                                                        type="text"
                                                        value={formData.nama_lokasi}
                                                        onChange={handleInputChange}
                                                        disabled={loading}
                                                        className="block w-full px-3 py-2 bg-gray-50 dark:bg-white/15 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-white/50 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 disabled:opacity-50 transition-all text-sm"
                                                        placeholder="Nama lokasi"
                                                    />
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={handleCancelEdit}
                                                            disabled={loading}
                                                            className="flex-1 px-3 py-2 bg-gray-300 dark:bg-gray-400/30 rounded-lg text-gray-700 dark:text-gray-200 font-medium hover:bg-gray-400 dark:hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm"
                                                        >
                                                            Batal
                                                        </button>
                                                        <button
                                                            onClick={() => handleUpdateLocation(location.id_location)}
                                                            disabled={loading}
                                                            className="flex-1 px-3 py-2 bg-gray-300 dark:bg-gray-400/30 rounded-lg text-gray-700 dark:text-gray-200 font-medium hover:bg-gray-400 dark:hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 text-sm"
                                                        >
                                                            {loading ? (
                                                                <svg className="animate-spin h-4 w-4 text-gray-700 dark:text-gray-200" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                                </svg>
                                                            ) : (
                                                                <CheckIcon className="w-4 h-4" />
                                                            )}
                                                            {loading ? 'Menyimpan...' : 'Simpan'}
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 rounded-lg bg-blue-500/20">
                                                        <MapPinIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="font-medium text-gray-900 dark:text-white">
                                                            {location.nama_lokasi}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => handleStartEdit(location)}
                                                            disabled={loading}
                                                            className="p-2 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 transition-all group disabled:opacity-50"
                                                            title="Edit Lokasi"
                                                        >
                                                            <PencilSquareIcon className="w-4 h-4 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteClick(location)}
                                                            disabled={loading}
                                                            className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 transition-all group disabled:opacity-50"
                                                            title="Hapus Lokasi"
                                                        >
                                                            <TrashIcon className="w-4 h-4 text-red-600 dark:text-red-400 group-hover:scale-110 transition-transform" />
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                isOpen={deleteConfirm !== null}
                onClose={handleCancelDelete}
                onConfirm={handleConfirmDelete}
                title="Hapus Lokasi"
                message="Apakah Anda yakin ingin menghapus lokasi ini?"
                itemName={deleteConfirm?.nama_lokasi}
                confirmText="Iya"
                cancelText="Tidak"
                loading={loading}
            />
        </>
    );
};

export default LocationManagementModal;