import React, { useState, useEffect } from 'react';
import cctvService from '../../services/cctvService';
import { XMarkIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';

const CCTVCreateModal = ({ isOpen, onClose, onCCTVCreated, locationGroups = [] }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        titik_letak: '',
        ip_address: '',
        id_location: '',
        status: true,
    });

    // Reset form saat modal terbuka
    useEffect(() => {
        if (isOpen) {
            setFormData({
                titik_letak: '',
                ip_address: '',
                id_location: '',
                status: true,
            });
            setError('');
        }
    }, [isOpen]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        if (error) setError('');
    };

    // CLIENT-SIDE VALIDATION with proper Indonesian messages
    const validateForm = () => {
        const { titik_letak, ip_address, id_location } = formData;
        if (!titik_letak.trim()) {
            setError('Titik Letak wajib diisi');
            return false;
        }
        if (titik_letak.trim().length < 5) {
            setError('Titik Letak harus memiliki minimal 5 karakter');
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

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-xl shadow-xl max-w-md w-full max-h-[90vh] flex flex-col border border-slate-600/50">
                <div className="flex items-center justify-between p-6 border-b border-slate-600/50 flex-shrink-0">
                    <h2 className="text-xl font-semibold text-white">Tambah CCTV Baru</h2>
                    <button onClick={handleClose} disabled={loading} className="text-gray-400 hover:text-white disabled:opacity-50">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                            <div className="flex items-center">
                                <ExclamationCircleIcon className="w-5 h-5 text-red-400 mr-2 flex-shrink-0" />
                                <p className="text-sm text-red-300">{error}</p>
                            </div>
                        </div>
                    )}

                    <div>
                        <label htmlFor="titik_letak" className="block text-sm font-medium text-gray-300 mb-1">Titik Letak *</label>
                        <input
                            type="text" id="titik_letak" name="titik_letak" required
                            value={formData.titik_letak} onChange={handleInputChange} disabled={loading}
                            className="block w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 disabled:bg-slate-900"
                            placeholder="Contoh: Pintu Masuk Utama" minLength="5"
                        />
                        <p className="text-xs text-gray-400 mt-1">Minimal 5 karakter</p>
                    </div>

                    <div>
                        <label htmlFor="ip_address" className="block text-sm font-medium text-gray-300 mb-1">IP Address *</label>
                        <input
                            type="text" id="ip_address" name="ip_address" required
                            value={formData.ip_address} onChange={handleInputChange} disabled={loading}
                            className="block w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 disabled:bg-slate-900"
                            placeholder="192.168.1.100"
                            pattern="^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$"
                        />
                        <p className="text-xs text-gray-400 mt-1">Format: 192.168.1.1</p>
                    </div>

                    <div>
                        <label htmlFor="id_location" className="block text-sm font-medium text-gray-300 mb-1">Lokasi *</label>
                        <select
                            id="id_location" name="id_location" required
                            value={formData.id_location} onChange={handleInputChange} disabled={loading}
                            className="block w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 disabled:bg-slate-900"
                        >
                            <option value="">-- Pilih Lokasi --</option>
                            {locationGroups.map((location) => (
                                <option key={location.id_location} value={location.id_location}>
                                    {location.nama_lokasi}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <div className="flex items-center">
                            <input
                                type="checkbox" id="status" name="status"
                                checked={formData.status} onChange={handleInputChange} disabled={loading}
                                className="h-4 w-4 text-blue-500 focus:ring-blue-500 bg-slate-700 border-slate-600 rounded disabled:opacity-50"
                            />
                            <label htmlFor="status" className="ml-2 block text-sm text-gray-300">CCTV aktif/online</label>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">Centang jika CCTV sedang aktif</p>
                    </div>
                </form>

                <div className="flex justify-end space-x-3 p-6 border-t border-slate-600/50 flex-shrink-0">
                    <button
                        type="button" onClick={handleClose} disabled={loading}
                        className="px-4 py-2 border border-slate-600 rounded-lg text-gray-300 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Batal
                    </button>
                    <button
                        type="submit" disabled={loading} onClick={handleSubmit}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {loading && (
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        )}
                        {loading ? 'Menyimpan...' : 'Simpan CCTV'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CCTVCreateModal;