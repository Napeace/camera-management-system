import React, { useState, useEffect } from 'react';
import cctvService from '../../services/cctvService';
import { XMarkIcon, ExclamationCircleIcon, VideoCameraIcon } from '@heroicons/react/24/outline';
import CustomLocationSelect from '../../components/common/CustomLocationSelect';

const CCTVCreateModal = ({ isOpen, onClose, onCCTVCreated, locationGroups = [] }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isAnimating, setIsAnimating] = useState(false);
    const [shouldShow, setShouldShow] = useState(false);
    
    // ✅ Toggle state untuk IP Address vs Analog
    const [isAnalogMode, setIsAnalogMode] = useState(false);
    
    // Form data untuk IP Address mode
    const [formData, setFormData] = useState({
        titik_letak: '',
        ip_address: '',
        id_location: '',
        status: true,
    });
    
    // ✅ Form data untuk Analog mode
    const [analogFormData, setAnalogFormData] = useState({
        nama_lokasi: '',
        ip_address: '',
    });

    // Handle animation
    useEffect(() => {
        if (isOpen) {
            setIsAnimating(true);
            // Reset form saat modal dibuka
            setFormData({
                titik_letak: '',
                ip_address: '',
                id_location: '',
                status: true,
            });
            setAnalogFormData({
                nama_lokasi: '',
                ip_address: '',
            });
            setIsAnalogMode(false); // Default ke IP Address mode
            setError('');
            setTimeout(() => setShouldShow(true), 10);
        } else {
            setShouldShow(false);
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
    
    // ✅ Handle input untuk form analog
    const handleAnalogInputChange = (e) => {
        const { name, value } = e.target;
        setAnalogFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (error) setError('');
    };

    // Validasi untuk IP Address mode
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
    
    // ✅ Validasi untuk Analog mode
    const validateAnalogForm = () => {
        const { nama_lokasi, ip_address } = analogFormData;
        
        if (!nama_lokasi.trim()) {
            setError('Nama Lokasi wajib diisi');
            return false;
        }
        if (nama_lokasi.trim().length < 5) {
            setError('Nama Lokasi harus memiliki minimal 5 karakter');
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
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // ✅ Validasi sesuai mode
        if (isAnalogMode) {
            if (!validateAnalogForm()) {
                return;
            }
        } else {
            if (!validateForm()) {
                return;
            }
        }

        setLoading(true);
        setError('');

        try {
            let newCCTV;
            
            // ✅ Submit sesuai mode
            if (isAnalogMode) {
                // Submit analog CCTV
                const analogData = {
                    nama_lokasi: analogFormData.nama_lokasi.trim(),
                    ip_address: analogFormData.ip_address.trim(),
                };
                console.log('Submitting Analog CCTV data:', analogData);
                newCCTV = await cctvService.createCCTVAnalog(analogData);
            } else {
                // Submit IP CCTV
                const cctvData = {
                    titik_letak: formData.titik_letak.trim(),
                    ip_address: formData.ip_address.trim(),
                    id_location: parseInt(formData.id_location),
                    status: formData.status
                };
                console.log('Submitting IP CCTV data:', cctvData);
                newCCTV = await cctvService.createCCTV(cctvData);
            }
            
            console.log('CCTV created successfully:', newCCTV);
            
            if (onCCTVCreated) {
                await onCCTVCreated(newCCTV);
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
            {/* Outer Container */}
            <div 
                className={`rounded-lg shadow-2xl max-w-md w-full overflow-hidden bg-white dark:bg-gradient-to-b dark:from-slate-950 dark:to-blue-800 border border-blue-300 dark:border-slate-800 p-5 transform transition-all duration-300 ${
                    shouldShow ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
                }`}
            >
                {/* Inner Container */}
                <div className="bg-gray-50/80 dark:bg-white/5 backdrop-blur-sm rounded-lg p-5 space-y-4">
                    
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 flex items-center justify-center bg-blue-100 dark:bg-blue-800/30 border border-blue-300 dark:border-blue-800/30 rounded-lg">
                                <VideoCameraIcon className="w-5 h-5 text-blue-600 dark:text-blue-800" />
                            </div>
                            <h2 className="text-xl text-gray-900 dark:text-white font-semibold">Tambah CCTV Baru</h2>
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

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="bg-red-100 dark:bg-red-500/20 border border-red-300 dark:border-red-400/40 rounded-lg p-4">
                                <div className="flex items-center">
                                    <ExclamationCircleIcon className="w-5 h-5 text-red-600 dark:text-red-300 mr-2 flex-shrink-0" />
                                    <p className="text-sm text-red-700 dark:text-red-200">{error}</p>
                                </div>
                            </div>
                        )}

                        {/* ✅ Conditional Form berdasarkan mode */}
                        {isAnalogMode ? (
                            // === FORM ANALOG MODE ===
                            <>
                                {/* Nama Lokasi dengan Toggle Button */}
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <label htmlFor="nama_lokasi" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                                            Nama Lokasi <span className="text-red-500">*</span>
                                        </label>
                                        
                                        {/* Toggle Button */}
                                        <div className="relative border border-green-700 rounded-lg px-1 py-1 w-[130px] h-[32px] flex items-center justify-between">

                                            {/* IP BUTTON */}
                                            <button
                                                type="button"
                                                onClick={() => setIsAnalogMode(false)}
                                                disabled={loading}
                                                className="relative w-[55px] h-full text-sm font-medium flex items-center justify-center"
                                            >
                                                {!isAnalogMode && (
                                                    <div className="
                                                        absolute inset-0 
                                                        rounded-md
                                                        border border-green-900
                                                        bg-green-500/10
                                                        pointer-events-none
                                                    " />
                                                )}
                                                <span className={!isAnalogMode ? "text-green-400" : "text-gray-400"}>
                                                    IP
                                                </span>
                                            </button>

                                            {/* ANALOG BUTTON */}
                                            <button
                                                type="button"
                                                onClick={() => setIsAnalogMode(true)}
                                                disabled={loading}
                                                className="relative w-[65px] h-full text-sm font-medium flex items-center justify-center"
                                            >
                                                {isAnalogMode && (
                                                    <div className="
                                                        absolute inset-0 
                                                        rounded-md
                                                        border border-green-900 
                                                        bg-green-500/10
                                                        pointer-events-none
                                                    " />
                                                )}
                                                <span className={isAnalogMode ? "text-green-400" : "text-gray-400"}>
                                                    Analog
                                                </span>
                                            </button>

                                        </div>
                                    </div>
                                    
                                    <input
                                        type="text" 
                                        id="nama_lokasi" 
                                        name="nama_lokasi" 
                                        required
                                        value={analogFormData.nama_lokasi} 
                                        onChange={handleAnalogInputChange} 
                                        disabled={loading}
                                        className="block w-full px-4 py-3 bg-gray-50 dark:bg-white/15 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-white/50 focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400 focus:border-orange-500 dark:focus:border-orange-400 disabled:opacity-50 transition-all"
                                        placeholder="Contoh: Ruang Server Utama"
                                    />
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        Minimal 5 karakter
                                    </p>
                                </div>

                                {/* IP Address Analog */}
                                <div>
                                    <label htmlFor="analog_ip_address" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                                        IP Address <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text" 
                                        id="analog_ip_address" 
                                        name="ip_address" 
                                        required
                                        value={analogFormData.ip_address} 
                                        onChange={handleAnalogInputChange} 
                                        disabled={loading}
                                        className="block w-full px-4 py-3 bg-gray-50 dark:bg-white/15 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-white/50 focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400 focus:border-orange-500 dark:focus:border-orange-400 disabled:opacity-50 transition-all"
                                        placeholder="192.168.10.180"
                                    />
                                </div>
                            </>
                        ) : (
                            // === FORM IP ADDRESS MODE (ORIGINAL) ===
                            <>
                                {/* Titik Letak dengan Toggle Button */}
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <label htmlFor="titik_letak" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                                            Titik Letak <span className="text-red-500">*</span>
                                        </label>
                                        
                                        {/* Toggle Button */}
                                        <div className="relative border border-green-700 rounded-lg px-1 py-1 w-[130px] h-[32px] flex items-center justify-between">

                                            {/* IP BUTTON */}
                                            <button
                                                type="button"
                                                onClick={() => setIsAnalogMode(false)}
                                                disabled={loading}
                                                className="relative w-[55px] h-full text-sm font-medium flex items-center justify-center"
                                            >
                                                {!isAnalogMode && (
                                                    <div className="
                                                        absolute inset-0 
                                                        rounded-md
                                                        border border-green-900 
                                                        bg-green-500/10
                                                        pointer-events-none
                                                    " />
                                                )}
                                                <span className={!isAnalogMode ? "text-green-400" : "text-gray-400"}>
                                                    IP
                                                </span>
                                            </button>

                                            {/* ANALOG BUTTON */}
                                            <button
                                                type="button"
                                                onClick={() => setIsAnalogMode(true)}
                                                disabled={loading}
                                                className="relative w-[65px] h-full text-sm font-medium flex items-center justify-center"
                                            >
                                                {isAnalogMode && (
                                                    <div className="
                                                        absolute inset-0 
                                                        rounded-md
                                                        border border-green-900 
                                                        bg-green-500/10
                                                        pointer-events-none
                                                    " />
                                                )}
                                                <span className={isAnalogMode ? "text-green-400" : "text-gray-400"}>
                                                    Analog
                                                </span>
                                            </button>

                                        </div>
                                    </div>
                                    
                                    <input
                                        type="text" 
                                        id="titik_letak" 
                                        name="titik_letak" 
                                        required
                                        value={formData.titik_letak} 
                                        onChange={handleInputChange} 
                                        disabled={loading}
                                        className="block w-full px-4 py-3 bg-gray-50 dark:bg-white/15 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-white/50 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 disabled:opacity-50 transition-all"
                                        placeholder="Pos Satpam 2"
                                    />
                                </div>

                                {/* IP Address */}
                                <div>
                                    <label htmlFor="ip_address" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                                        IP Address <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text" 
                                        id="ip_address" 
                                        name="ip_address" 
                                        required
                                        value={formData.ip_address} 
                                        onChange={handleInputChange} 
                                        disabled={loading}
                                        className="block w-full px-4 py-3 bg-gray-50 dark:bg-white/15 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-white/50 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 disabled:opacity-50 transition-all"
                                        placeholder="192.168.10.202"
                                    />
                                </div>

                                {/* Lokasi */}
                                <div>
                                    <label htmlFor="id_location" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                                        Lokasi <span className="text-red-500">*</span>
                                    </label>
                                    <CustomLocationSelect
                                        value={formData.id_location}
                                        onChange={handleInputChange}
                                        disabled={loading}
                                        locations={locationGroups}
                                        variant="form"
                                    />
                                </div>
                            </>
                        )}
                    </form>
                </div>

                {/* Buttons - Outside Inner Container */}
                <div className="flex gap-3 justify-end mt-4">
                    <button
                        type="button" 
                        onClick={handleClose} 
                        disabled={loading}
                        className="px-6 py-2.5 bg-gray-300 dark:bg-gray-400/30 rounded-lg text-gray-700 dark:text-gray-200 text-sm font-medium hover:bg-gray-400 dark:hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        Batal
                    </button>
                    <button
                        type="submit" 
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-8 py-2.5 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 bg-gray-300 dark:bg-gray-400/30 text-gray-700 dark:text-gray-200 hover:bg-gray-400 dark:hover:bg-blue-500"
                    >
                        {loading && (
                            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        )}
                        {loading ? 'Menyimpan...' : 'Simpan'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CCTVCreateModal;