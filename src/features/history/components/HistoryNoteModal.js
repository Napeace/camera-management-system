// features/history/components/HistoryNoteModal.js - Fixed Validation
import React, { useState, useEffect, useRef } from 'react';
import historyService from '../../../services/historyService';
import { XMarkIcon, VideoCameraIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

const HistoryNoteModal = ({ isOpen, onClose, historyItem }) => {
    const [error, setError] = useState('');
    const [isAnimating, setIsAnimating] = useState(false);
    const [shouldShow, setShouldShow] = useState(false);
    const [note, setNote] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [showSavedIndicator, setShowSavedIndicator] = useState(false);
    const [originalNote, setOriginalNote] = useState(''); // Track original note
    const saveTimeoutRef = useRef(null);

    // Initialize note when modal opens
    useEffect(() => {
        if (isOpen && historyItem) {
            const initialNote = historyItem.note || '';
            setNote(initialNote);
            setOriginalNote(initialNote); // Save original note
            setError('');
            setShowSavedIndicator(false);
        }
    }, [isOpen, historyItem]);

    // Handle animation
    useEffect(() => {
        if (isOpen) {
            setIsAnimating(true);
            setTimeout(() => setShouldShow(true), 10);
        } else {
            setShouldShow(false);
            const timer = setTimeout(() => setIsAnimating(false), 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    // Auto-save dengan debounce
    useEffect(() => {
        if (!isOpen || !historyItem) return;

        // Clear previous timeout
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }

        // Skip if note hasn't changed from original
        if (note === (historyItem.note || '')) {
            return;
        }

        // Set timeout untuk auto-save (1 detik setelah berhenti mengetik)
        saveTimeoutRef.current = setTimeout(async () => {
            await handleAutoSave();
        }, 1000);

        // Cleanup
        return () => {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }
        };
    }, [note, isOpen, historyItem]);

    const handleAutoSave = async () => {
        if (!historyItem) return;

        // Skip if note hasn't changed from original
        if (note === (historyItem.note || '')) {
            return;
        }

        const trimmedNote = note.trim();
        const hadOriginalNote = originalNote && originalNote.trim().length > 0;

        // ✅ VALIDASI: Jika awalnya ada isi, tidak boleh dihapus atau < 5 karakter
        if (hadOriginalNote) {
            if (trimmedNote.length === 0) {
                setError('Catatan tidak boleh dikosongkan. Minimal 5 karakter.');
                setShowSavedIndicator(false);
                return;
            }
            
            if (trimmedNote.length < 5) {
                setError('Isi catatan minimal 5 karakter');
                setShowSavedIndicator(false);
                return;
            }
        }

        // Validasi maksimal 255 karakter
        if (trimmedNote.length > 255) {
            setError('Catatan maksimal 255 karakter');
            setShowSavedIndicator(false);
            return;
        }

        setIsSaving(true);
        setError('');
        setShowSavedIndicator(false);

        try {
            const updateData = {
                service: historyItem.service,
                note: trimmedNote.length > 0 ? trimmedNote : null
            };

            console.log('💾 Auto-saving note for history:', historyItem.id_history, updateData);

            const response = await historyService.updateHistory(
                historyItem.id_history,
                updateData
            );

            console.log('✅ Note auto-saved successfully:', response);

            // Show saved indicator
            setShowSavedIndicator(true);

            // Hide indicator after 3 seconds
            setTimeout(() => {
                setShowSavedIndicator(false);
            }, 3000);
        } catch (error) {
            console.error('❌ Auto-save error:', error);

            let errorMessage = 'Gagal menyimpan catatan. Silakan coba lagi.';

            if (error.response?.data?.detail) {
                if (typeof error.response.data.detail === 'string') {
                    errorMessage = error.response.data.detail;
                } else if (Array.isArray(error.response.data.detail)) {
                    errorMessage = error.response.data.detail
                        .map(err => err.msg || err.message)
                        .join(', ');
                }
            } else if (error.message && typeof error.message === 'string') {
                errorMessage = error.message;
            }

            setError(errorMessage);
            setShowSavedIndicator(false);
        } finally {
            setIsSaving(false);
        }
    };

    const handleInputChange = (e) => {
        setNote(e.target.value);
        if (error) setError('');
        setShowSavedIndicator(false);
    };

    const handleClose = () => {
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }
        onClose();
    };

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            handleClose();
        }
    };

    if (!isOpen && !isAnimating) return null;
    if (!historyItem) return null;

    return (
        <div
            onClick={handleBackdropClick}
            className={`fixed inset-0 bg-black/70 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-300 ${
                shouldShow ? 'opacity-100' : 'opacity-0'
            }`}
        >
            <div
                className={`bg-gradient-to-b from-slate-50 via-blue-50 to-blue-100 dark:from-slate-950 dark:via-indigo-950 dark:to-indigo-800 rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden transform transition-all duration-300 ${
                    shouldShow ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
                }`}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-6 mx-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                            <VideoCameraIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h2 className="text-2xl text-gray-900 dark:text-white font-semibold">Detail Riwayat</h2>
                    </div>
                    <button
                        onClick={handleClose}
                        className="text-gray-600 hover:text-gray-900 dark:text-white/70 dark:hover:text-white transition-colors"
                    >
                        <XMarkIcon className="w-7 h-7" />
                    </button>
                </div>

                {/* Border */}
                <div className="mx-6 h-1 bg-gray-300 dark:bg-white/10"></div>

                {/* Content */}
                <div className="p-6 space-y-5">
                    {/* Camera Info */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
                            Kamera
                        </label>
                        <div className="block w-full px-4 py-3 bg-gray-100 dark:bg-white/5 backdrop-blur-sm border border-gray-300 dark:border-white/10 rounded-xl text-gray-900 dark:text-white">
                            {historyItem.cctv_name || 'Unknown Camera'}
                        </div>
                    </div>

                    {/* IP Address */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
                            IP Address
                        </label>
                        <div className="block w-full px-4 py-3 bg-gray-100 dark:bg-white/5 backdrop-blur-sm border border-gray-300 dark:border-white/10 rounded-xl text-gray-900 dark:text-white">
                            {historyItem.cctv_ip || '-'}
                        </div>
                    </div>

                    {/* Location */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
                            Lokasi
                        </label>
                        <div className="block w-full px-4 py-3 bg-gray-100 dark:bg-white/5 backdrop-blur-sm border border-gray-300 dark:border-white/10 rounded-xl text-gray-900 dark:text-white">
                            {historyItem.location_name || '-'}
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-100 dark:bg-red-500/20 border border-red-300 dark:border-red-400/40 rounded-xl p-3 backdrop-blur-sm">
                            <p className="text-sm text-red-700 dark:text-red-200">{error}</p>
                        </div>
                    )}

                    {/* Note - Editable with Auto-save */}
                    <div className="relative">
                        <label htmlFor="note" className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
                            Catatan
                        </label>
                        <div className="relative">
                            <textarea
                                id="note"
                                name="note"
                                rows={4}
                                value={note}
                                onChange={handleInputChange}
                                className="block w-full px-4 py-3 pb-8 bg-white dark:bg-white/10 backdrop-blur-sm border border-gray-300 dark:border-white/20 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/50 focus:ring-2 focus:ring-blue-500 dark:focus:ring-white/30 focus:border-blue-500 dark:focus:border-white/30 transition-all resize-none"
                                placeholder="Jelaskan masalah yang terjadi pada CCTV (opsional)"
                            />

                            {/* Auto-save Indicators */}
                            <div className="absolute bottom-2 right-3 flex items-center gap-2">
                                {isSaving && (
                                    <div className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 px-2 py-1 rounded-md shadow-sm">
                                        <svg className="animate-spin h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span>Menyimpan...</span>
                                    </div>
                                )}

                                {showSavedIndicator && !isSaving && (
                                    <div className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400 px-2 py-1 rounded-md shadow-sm">
                                        <CheckCircleIcon className="h-4 w-4" />
                                        <span>Catatan tersimpan otomatis</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Character Counter */}
                        <div className="mt-2">
                            <p className="text-xs text-gray-500 dark:text-white/50">
                                {note.length}/255 karakter
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HistoryNoteModal;