// features/history/components/HistoryCreateModal.js
import React, { useState, useEffect } from 'react';
import historyService from '../../services/historyService';
import cctvService from '../../services/cctvService';
import { XMarkIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import CustomCCTVSelect from './components/CustomCCTVSelect';

const HistoryCreateModal = ({ isOpen, onClose, onHistoryCreated }) => {
    const [loading, setLoading] = useState(false);
    const [loadingCCTV, setLoadingCCTV] = useState(true);
    const [error, setError] = useState('');
    const [isAnimating, setIsAnimating] = useState(false);
    const [shouldShow, setShouldShow] = useState(false);
    const [cctvList, setCctvList] = useState([]);
    const [formData, setFormData] = useState({
        id_cctv: '',
        note: '',
    });

    // Fetch CCTV data when modal opens
    useEffect(() => {
        const fetchCCTVData = async () => {
            if (isOpen) {
                setLoadingCCTV(true);
                try {
                    console.log('🔍 Fetching CCTV data...');
                    
                    const response = await cctvService.getAllCCTV({
                        skip: 0,
                        limit: 500
                    });
                    
                    console.log('✅ CCTV Response:', response);
                    
                    // Filter: hanya CCTV yang belum dihapus (deleted_at === null)
                    const availableCCTVs = response.data.filter(cctv => 
                        cctv.deleted_at === null || cctv.deleted_at === undefined
                    );
                    
                    console.log('✅ Available CCTVs (not deleted):', availableCCTVs.length);
                    console.log('📊 CCTV Details:', availableCCTVs);
                    
                    setCctvList(availableCCTVs);
                } catch (err) {
                    console.error('❌ Error fetching CCTV data:', err);
                    setError('Gagal memuat data CCTV: ' + err.message);
                } finally {
                    setLoadingCCTV(false);
                }
            }
        };

        fetchCCTVData();
    }, [isOpen]);

    // Handle animation
    useEffect(() => {
        if (isOpen) {
            setIsAnimating(true);
            setFormData({
                id_cctv: '',
                note: '',
            });
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

    const validateForm = () => {
        const { id_cctv, note } = formData;
        
        if (!id_cctv) {
            setError('CCTV wajib dipilih');
            return false;
        }
        
        if (!note.trim()) {
            setError('Note wajib diisi');
            return false;
        }
        
        if (note.trim().length < 5) {
            setError('Note harus memiliki minimal 5 karakter');
            return false;
        }
        
        if (note.trim().length > 255) {
            setError('Note maksimal 255 karakter');
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
            const historyData = {
                id_cctv: parseInt(formData.id_cctv),
                note: formData.note.trim(),
            };
            
            console.log('Submitting history data:', historyData);
            
            const newHistory = await historyService.createHistory(historyData);
            
            console.log('History created successfully:', newHistory);
            
            if (onHistoryCreated) {
                await onHistoryCreated(newHistory);
            }
            
            onClose();
        } catch (error) {
            console.error('Create history error:', error);
            setError(error.message || 'Gagal membuat history. Silakan coba lagi.');
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
                    <h2 className="text-2xl text-gray-900 dark:text-white font-semibold">Tambah History</h2>
                    <button 
                        onClick={handleClose} 
                        disabled={loading} 
                        className="text-gray-600 hover:text-gray-900 dark:text-white/70 dark:hover:text-white disabled:opacity-50 transition-colors"
                    >
                        <XMarkIcon className="w-7 h-7" />
                    </button>
                </div>
                
                {/* Border */}
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

                    {/* CCTV Select */}
                    <div>
                        <label htmlFor="id_cctv" className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
                            CCTV <span className="text-red-500">*</span>
                        </label>
                        <CustomCCTVSelect
                            value={formData.id_cctv}
                            onChange={handleInputChange}
                            disabled={loading || loadingCCTV}
                            cctvList={cctvList}
                            loading={loadingCCTV}
                        />
                        <p className="mt-1.5 text-xs text-gray-500 dark:text-white/50">
                            {loadingCCTV ? 'Memuat data CCTV...' : `${cctvList.length} CCTV tersedia untuk dilaporkan`}
                        </p>
                    </div>

                    {/* Note */}
                    <div>
                        <label htmlFor="note" className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
                            Note <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            id="note" 
                            name="note" 
                            required
                            rows={4}
                            value={formData.note} 
                            onChange={handleInputChange} 
                            disabled={loading}
                            className="block w-full px-4 py-3 bg-white dark:bg-white/10 backdrop-blur-sm border border-gray-300 dark:border-white/20 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/50 focus:ring-2 focus:ring-blue-500 dark:focus:ring-white/30 focus:border-blue-500 dark:focus:border-white/30 disabled:opacity-50 transition-all resize-none"
                            placeholder="Jelaskan masalah yang terjadi pada CCTV (min. 5 karakter)"
                        />
                        <p className="mt-1.5 text-xs text-gray-500 dark:text-white/50">
                            {formData.note.length}/255 karakter
                        </p>
                    </div>

                    {/* Border */}
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
                                disabled={loading || loadingCCTV}
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

export default HistoryCreateModal;