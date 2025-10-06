import React, { useState, useEffect } from 'react';
import cctvService from '../../services/cctvService';
import { XMarkIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import CustomLocationSelect from '../../components/common/CustomLocationSelect';

const CCTVCreateModal = ({ isOpen, onClose, onCCTVCreated, locationGroups = [] }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isAnimating, setIsAnimating] = useState(false);
    const [shouldShow, setShouldShow] = useState(false);
    const [formData, setFormData] = useState({
        titik_letak: '',
        ip_address: '',
        id_location: '',
        status: true,
    });

    // Handle animation
    useEffect(() => {
        if (isOpen) {
            setIsAnimating(true);
            setFormData({
                titik_letak: '',
                ip_address: '',
                id_location: '',
                status: true,
            });
            setError('');
            // Small delay to trigger enter animation
            setTimeout(() => setShouldShow(true), 10);
        } else {
            setShouldShow(false);
            // Delay cleanup to allow exit animation
            const timer = setTimeout(() => setIsAnimating(false), 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (error) setError('');
    };

    const validateForm = () => {
        const { titik_letak, ip_address, id_location } = formData;
        if (!titik_letak.trim()) {
            setError('Titik Letak wajib diisi');
            return false;
        }
        if (titik_letak.trim().length < 3) {
            setError('Titik Letak harus memiliki minimal 3 karakter');
            return false;
        }
        if (!ip_address.trim()) {
            setError('IP Address wajib diisi');
            return false;
        }
        const ipPattern = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
        if (!ipPattern.test(ip_address.trim())) {
            setError('Format IP Address tidak valid (contoh: 192.168.1.1)');
            return false;
        }
        if (!id_location) {
            setError('Lokasi wajib dipilih');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            return;
        }

        setLoading(true);
        setError('');

        try {
            const cctvData = {
                titik_letak: formData.titik_letak.trim(),
                ip_address: formData.ip_address.trim(),
                id_location: parseInt(formData.id_location),
                status: formData.status
            };
            console.log('Submitting CCTV data:', cctvData);
            const newCCTV = await cctvService.createCCTV(cctvData);
            console.log('CCTV created successfully:', newCCTV);
            if (onCCTVCreated) {
                await onCCTVCreated({
                    titik_letak: cctvData.titik_letak,
                    ip_address: cctvData.ip_address,
                    id_location: cctvData.id_location,
                    status: cctvData.status
                });
            }
            onClose();
        } catch (error) {
            console.error('Create CCTV error:', error);
            setError(error.message || 'Gagal membuat CCTV. Silakan coba lagi.');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => !loading && onClose();

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget && !loading) {
            onClose();
        }
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
                className={`bg-gradient-to-b from-slate-50 via-blue-50 to-blue-100 dark:from-slate-950 dark:via-indigo-950 dark:to-indigo-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden transform transition-all duration-300 ${
                    shouldShow ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
                }`}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-6 mx-4">
                    <h2 className="text-2xl text-gray-900 dark:text-white font-semibold">Tambah CCTV Baru</h2>
                    <button 
                        onClick={handleClose} 
                        disabled={loading} 
                        className="text-gray-600 hover:text-gray-900 dark:text-white/70 dark:hover:text-white disabled:opacity-50 transition-colors"
                    >
                        <XMarkIcon className="w-7 h-7" />
                    </button>
                </div>
                
                {/* Border persegi panjang setelah header */}
                <div className="mx-6 h-1 bg-gray-300 dark:bg-white/10"></div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {error && (
                        <div className="bg-red-100 dark:bg-red-500/20 border border-red-300 dark:border-red-400/40 rounded-xl p-4 backdrop-blur-sm">
                            <div className="flex items-center">
                                <ExclamationCircleIcon className="w-5 h-5 text-red-600 dark:text-red-300 mr-2 flex-shrink-0" />
                                <p className="text-sm text-red-700 dark:text-red-200">{error}</p>
                            </div>
                        </div>
                    )}

                    {/* Titik Letak */}
                    <div>
                        <label htmlFor="titik_letak" className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
                            Titik letak
                        </label>
                        <input
                            type="text" 
                            id="titik_letak" 
                            name="titik_letak" 
                            required
                            value={formData.titik_letak} 
                            onChange={handleInputChange} 
                            disabled={loading}
                            className="block w-full px-4 py-3 bg-white dark:bg-white/10 backdrop-blur-sm border border-gray-300 dark:border-white/20 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/50 focus:ring-2 focus:ring-blue-500 dark:focus:ring-white/30 focus:border-blue-500 dark:focus:border-white/30 disabled:opacity-50 transition-all"
                            placeholder="Pos Satpam 2"
                        />
                    </div>

                    {/* IP Address */}
                    <div>
                        <label htmlFor="ip_address" className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
                            IP Address
                        </label>
                        <input
                            type="text" 
                            id="ip_address" 
                            name="ip_address" 
                            required
                            value={formData.ip_address} 
                            onChange={handleInputChange} 
                            disabled={loading}
                            className="block w-full px-4 py-3 bg-white dark:bg-white/10 backdrop-blur-sm border border-gray-300 dark:border-white/20 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/50 focus:ring-2 focus:ring-blue-500 dark:focus:ring-white/30 focus:border-blue-500 dark:focus:border-white/30 disabled:opacity-50 transition-all"
                            placeholder="192.168.10.202"
                        />
                    </div>

                    {/* Lokasi */}
                    <div>
                        <label htmlFor="id_location" className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
                            Lokasi DVR
                        </label>
                        <CustomLocationSelect
                            value={formData.id_location}
                            onChange={handleInputChange}
                            disabled={loading}
                            locations={locationGroups}
                        />
                    </div>

                    {/* Border persegi panjang sebelum button */}
                    <div className="h-1 bg-gray-300 dark:bg-white/10 mb-6"></div>
                    
                    {/* Buttons */}
                    <div className="pb-6">
                        <div className="flex gap-3 justify-end">
                            <button
                                type="button" 
                                onClick={handleClose} 
                                disabled={loading}
                                className="w-28 px-1 py-3 bg-gray-200 dark:bg-white/10 backdrop-blur-sm border border-gray-300 dark:border-white/20 rounded-xl text-gray-700 dark:text-white font-medium hover:bg-gray-300 dark:hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                Batal
                            </button>
                            <button
                                type="submit" 
                                disabled={loading}
                                className="w-48 px-1 py-3 bg-blue-600 dark:bg-white/10 backdrop-blur-sm border border-blue-600 dark:border-white/20 rounded-xl text-white font-medium hover:bg-blue-700 dark:hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                            >
                                {loading && (
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                )}
                                {loading ? 'Menyimpan...' : 'Simpan'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CCTVCreateModal;