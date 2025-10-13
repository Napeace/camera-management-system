import React, { useState, useEffect } from 'react';
import { XMarkIcon, ExclamationCircleIcon, PlusIcon, MapPinIcon, PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import locationService from '../../services/locationService';
import { useToast } from '../../contexts/ToastContext';

const LocationManagementModal = ({ isOpen, onClose, onLocationCreated }) => {
    const { showSuccess, showError, showInfo } = useToast();
    const [loading, setLoading] = useState(false);
    const [loadingLocations, setLoadingLocations] = useState(false);
    const [error, setError] = useState('');
    const [isAnimating, setIsAnimating] = useState(false);
    const [shouldShow, setShouldShow] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [locations, setLocations] = useState([]);
    const [formData, setFormData] = useState({
        nama_lokasi: ''
    });

    // Handle animation
    useEffect(() => {
        if (isOpen) {
            setIsAnimating(true);
            setShowForm(false);
            setFormData({ nama_lokasi: '' });
            setError('');
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
            console.log('🔍 Fetching locations...');
            const response = await locationService.getAllLocations(0, 100);
            console.log('✅ Response:', response);
            console.log('📦 Data:', response.data);
            setLocations(response.data || []);
        } catch (err) {
            console.error('❌ Error fetching locations:', err);
            console.error('Error response:', err.response);
            console.error('Error message:', err.message);
            
            // Extract detailed error message
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
            
            // Refresh locations list
            await fetchLocations();
            
            // Reset form
            setFormData({ nama_lokasi: '' });
            setShowForm(false);
            
            // Notify parent
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

    const handleEditLocation = (location) => {
        // TODO: Implement edit functionality when backend endpoint is ready
        showInfo('Fitur Belum Tersedia', 'Fitur edit lokasi akan segera hadir');
        console.log('Edit location:', location);
    };

    const handleDeleteLocation = (location) => {
        // Delete is not allowed by design
        showError('Fitur Belum Tersedia', 'Fitur hapus lokasi akan segera hadir');
        console.log('Attempted to delete location:', location);
    };

    const handleClose = () => {
        if (!loading) {
            setShowForm(false);
            onClose();
        }
    };

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget && !loading) {
            onClose();
        }
    };

    const toggleForm = () => {
        setShowForm(!showForm);
        setError('');
        setFormData({ nama_lokasi: '' });
    };

    if (!isOpen && !isAnimating) return null;

    return (
        <div 
            onClick={handleBackdropClick}
            className={`fixed inset-0 bg-black/70 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-300 ${
                shouldShow ? 'opacity-100' : 'opacity-0'
            }`}
        >
            <div 
                className={`bg-gradient-to-b from-slate-50 via-purple-50 to-purple-100 dark:from-slate-950 dark:via-purple-950 dark:to-purple-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden transform transition-all duration-300 ${
                    shouldShow ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
                }`}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-6 mx-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-purple-500/10 dark:bg-purple-900/30">
                            <MapPinIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                        </div>
                        <h2 className="text-2xl text-gray-900 dark:text-white font-semibold">Kelola Lokasi DVR</h2>
                    </div>
                    <button 
                        onClick={handleClose} 
                        disabled={loading} 
                        className="text-gray-600 hover:text-gray-900 dark:text-white/70 dark:hover:text-white disabled:opacity-50 transition-colors"
                    >
                        <XMarkIcon className="w-7 h-7" />
                    </button>
                </div>
                
                {/* Border separator */}
                <div className="mx-6 h-1 bg-gray-300 dark:bg-white/10"></div>

                {/* Content - Scrollable */}
                <div className="p-6 space-y-5 overflow-y-auto max-h-[calc(90vh-180px)]">
                    {/* Add Location Button */}
                    {!showForm && (
                        <button
                            onClick={toggleForm}
                            className="w-full bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 dark:from-purple-700 dark:to-purple-600 dark:hover:from-purple-800 dark:hover:to-purple-700 text-white px-4 py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
                        >
                            <PlusIcon className="w-5 h-5" />
                            Tambah Lokasi Baru
                        </button>
                    )}

                    {/* Form Section */}
                    {showForm && (
                        <div className="bg-white/50 dark:bg-white/5 backdrop-blur-sm border border-gray-300 dark:border-white/20 rounded-xl p-5 space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Tambah Lokasi Baru</h3>
                                <button
                                    onClick={toggleForm}
                                    disabled={loading}
                                    className="text-gray-600 hover:text-gray-900 dark:text-white/70 dark:hover:text-white disabled:opacity-50 transition-colors"
                                >
                                    <XMarkIcon className="w-5 h-5" />
                                </button>
                            </div>

                            {error && (
                                <div className="bg-red-100 dark:bg-red-500/20 border border-red-300 dark:border-red-400/40 rounded-xl p-4 backdrop-blur-sm">
                                    <div className="flex items-center">
                                        <ExclamationCircleIcon className="w-5 h-5 text-red-600 dark:text-red-300 mr-2 flex-shrink-0" />
                                        <p className="text-sm text-red-700 dark:text-red-200">{error}</p>
                                    </div>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label htmlFor="nama_lokasi" className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
                                        Nama Lokasi DVR
                                    </label>
                                    <input
                                        type="text" 
                                        id="nama_lokasi" 
                                        name="nama_lokasi" 
                                        required
                                        value={formData.nama_lokasi} 
                                        onChange={handleInputChange} 
                                        disabled={loading}
                                        className="block w-full px-4 py-3 bg-white dark:bg-white/10 backdrop-blur-sm border border-gray-300 dark:border-white/20 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/50 focus:ring-2 focus:ring-purple-500 dark:focus:ring-white/30 focus:border-purple-500 dark:focus:border-white/30 disabled:opacity-50 transition-all"
                                        placeholder="Server Monitoring Lantai 1"
                                        minLength={5}
                                        maxLength={200}
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
                                        className="px-6 py-2 bg-gray-200 dark:bg-white/10 backdrop-blur-sm border border-gray-300 dark:border-white/20 rounded-xl text-gray-700 dark:text-white font-medium hover:bg-gray-300 dark:hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit" 
                                        disabled={loading}
                                        className="px-6 py-2 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 dark:from-purple-700 dark:to-purple-600 dark:hover:from-purple-800 dark:hover:to-purple-700 text-white font-medium rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                                    >
                                        {loading && (
                                            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                        )}
                                        {loading ? 'Menyimpan...' : 'Simpan'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Locations List */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                            <span>Daftar Lokasi DVR</span>
                            <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-2 py-1 rounded-full">
                                {locations.length} lokasi
                            </span>
                        </h3>

                        {loadingLocations ? (
                            <div className="space-y-2">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="bg-white/50 dark:bg-white/5 backdrop-blur-sm border border-gray-300 dark:border-white/20 rounded-xl p-4 animate-pulse">
                                        <div className="h-5 bg-gray-300 dark:bg-white/10 rounded w-3/4"></div>
                                    </div>
                                ))}
                            </div>
                        ) : locations.length === 0 ? (
                            <div className="bg-white/50 dark:bg-white/5 backdrop-blur-sm border border-gray-300 dark:border-white/20 rounded-xl p-8 text-center">
                                <MapPinIcon className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-3" />
                                <p className="text-gray-600 dark:text-gray-400 text-sm">
                                    Belum ada lokasi DVR. Tambahkan lokasi baru untuk memulai.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
                                {locations.map((location) => (
                                    <div 
                                        key={location.id_location}
                                        className="bg-white/50 dark:bg-white/5 backdrop-blur-sm border border-gray-300 dark:border-white/20 rounded-xl p-4 hover:bg-white/70 dark:hover:bg-white/10 transition-all"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-lg bg-purple-500/10 dark:bg-purple-900/30">
                                                <MapPinIcon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-medium text-gray-900 dark:text-white">
                                                    {location.nama_lokasi}
                                                </p>
                                            </div>
                                            {/* Action Buttons */}
                                            <div className="flex items-center gap-2">
                                                {/* Edit Button */}
                                                <button
                                                    onClick={() => handleEditLocation(location)}
                                                    className="p-2 rounded-lg bg-blue-500/10 dark:bg-blue-900/30 hover:bg-blue-500/20 dark:hover:bg-blue-900/40 transition-all group"
                                                    title="Edit Lokasi"
                                                >
                                                    <PencilSquareIcon className="w-4 h-4 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform" />
                                                </button>
                                                {/* Delete Button */}
                                                <button
                                                    onClick={() => handleDeleteLocation(location)}
                                                    className="p-2 rounded-lg bg-red-500/10 dark:bg-red-900/30 hover:bg-red-500/20 dark:hover:bg-red-900/40 transition-all group"
                                                    title="Hapus Lokasi"
                                                >
                                                    <TrashIcon className="w-4 h-4 text-red-600 dark:text-red-400 group-hover:scale-110 transition-transform" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Border */}
                <div className="mx-6 h-1 bg-gray-300 dark:bg-white/10"></div>

                {/* Footer */}
                <div className="p-6">
                    <button
                        onClick={handleClose}
                        disabled={loading}
                        className="w-full px-4 py-3 bg-gray-200 dark:bg-white/10 backdrop-blur-sm border border-gray-300 dark:border-white/20 rounded-xl text-gray-700 dark:text-white font-medium hover:bg-gray-300 dark:hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        Tutup
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LocationManagementModal;