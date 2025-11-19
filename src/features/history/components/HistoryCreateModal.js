// features/history/components/HistoryCreateModal.js
import React, { useState, useEffect } from 'react';
import historyService from '../../../services/historyService';
import cctvService from '../../../services/cctvService';
import { XMarkIcon, ExclamationCircleIcon, VideoCameraIcon } from '@heroicons/react/24/outline';
import CustomCCTVSelect from './CustomCCTVSelect';

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
                            <h2 className="text-xl text-gray-900 dark:text-white font-semibold">Tambah History</h2>
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

                        {/* CCTV Select */}
                        <div>
                            <label htmlFor="id_cctv" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                                CCTV <span className="text-red-500">*</span>
                            </label>
                            <CustomCCTVSelect
                                value={formData.id_cctv}
                                onChange={handleInputChange}
                                disabled={loading || loadingCCTV}
                                cctvList={cctvList}
                                loading={loadingCCTV}
                            />
                            <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                                {loadingCCTV ? 'Memuat data CCTV...' : `${cctvList.length} CCTV tersedia untuk dilaporkan`}
                            </p>
                        </div>

                        {/* Note */}
                        <div>
                            <label htmlFor="note" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                                Catatan <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                id="note" 
                                name="note" 
                                required
                                rows={4}
                                value={formData.note} 
                                onChange={handleInputChange} 
                                disabled={loading}
                                className="block w-full px-4 py-3 bg-gray-50 dark:bg-white/15 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-gray-100  placeholder-gray-400 dark:placeholder-white/50 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 disabled:opacity-50 transition-all resize-none"
                                placeholder="Masukkan catatan terkait masalah yang terjadi (min. 5 karakter)"
                            />
                        </div>
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
                        disabled={loading || loadingCCTV}
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
    );
};

export default HistoryCreateModal;