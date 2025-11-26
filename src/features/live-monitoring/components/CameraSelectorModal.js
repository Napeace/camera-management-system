import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';

const CameraSelectorModal = ({ 
    isOpen, 
    onClose, 
    allCameras = [], 
    selectedCameraIds = [],
    onApply,
    onReset,
    maxSelection = 16 
}) => {
    const [tempSelectedIds, setTempSelectedIds] = useState([]);
    const [expandedLocations, setExpandedLocations] = useState({});
    const [searchQuery, setSearchQuery] = useState('');
    const [isAnimating, setIsAnimating] = useState(false);
    const [shouldShow, setShouldShow] = useState(false);

    // Initialize with current selection
    useEffect(() => {
        if (isOpen) {
            setIsAnimating(true);
            setTempSelectedIds([...selectedCameraIds]);            
            setExpandedLocations({}); 
            setSearchQuery('');
            setTimeout(() => setShouldShow(true), 10);
        } else {
            setShouldShow(false);
            const timer = setTimeout(() => setIsAnimating(false), 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen, selectedCameraIds]);

    // Group cameras by location
    const groupCamerasByLocation = (cameras) => {
        return cameras.reduce((acc, camera) => {
            const location = camera.location_name || camera.location || 'Unknown Location';
            if (!acc[location]) {
                acc[location] = [];
            }
            acc[location].push(camera);
            return acc;
        }, {});
    };

    // Filter cameras by search query
    const filterCameras = (cameras) => {
        if (!searchQuery.trim()) return cameras;
        const query = searchQuery.toLowerCase();
        return cameras.filter(cam => 
            cam.titik_letak?.toLowerCase().includes(query) ||
            cam.name?.toLowerCase().includes(query) ||
            cam.ip_address?.toLowerCase().includes(query)
        );
    };

    const groupedCameras = groupCamerasByLocation(filterCameras(allCameras));

    const handleCheckboxChange = (cameraId) => {
        setTempSelectedIds(prev => {
            if (prev.includes(cameraId)) {
                // Uncheck
                return prev.filter(id => id !== cameraId);
            } else {
                // Check - but enforce max limit
                if (prev.length >= maxSelection) {
                    alert(`Maksimal ${maxSelection} kamera dapat dipilih`);
                    return prev;
                }
                return [...prev, cameraId];
            }
        });
    };

    const toggleLocation = (location) => {
        setExpandedLocations(prev => ({
            ...prev,
            [location]: !prev[location]
        }));
    };

    const handleSelectAllInLocation = (location) => {
        const camerasInLocation = groupedCameras[location];
        const cameraIdsInLocation = camerasInLocation.map(cam => cam.id_cctv);
        
        // Check if all cameras in this location are already selected
        const allSelected = cameraIdsInLocation.every(id => tempSelectedIds.includes(id));
        
        if (allSelected) {
            // Deselect all in location
            setTempSelectedIds(prev => prev.filter(id => !cameraIdsInLocation.includes(id)));
        } else {
            // Select all in location (up to max limit)
            const remaining = maxSelection - tempSelectedIds.length;
            const toAdd = cameraIdsInLocation
                .filter(id => !tempSelectedIds.includes(id))
                .slice(0, remaining);
            
            if (toAdd.length < cameraIdsInLocation.filter(id => !tempSelectedIds.includes(id)).length) {
                alert(`Maksimal ${maxSelection} kamera. Hanya ${toAdd.length} kamera yang ditambahkan.`);
            }
            
            setTempSelectedIds(prev => [...prev, ...toAdd]);
        }
    };

    const handleApply = () => {
        if (tempSelectedIds.length === 0) {
            alert('Pilih minimal 1 kamera');
            return;
        }
        onApply(tempSelectedIds);
    };

    const handleReset = () => {
        if (window.confirm('Reset pilihan kamera dan kembali ke mode lokasi?')) {
            setTempSelectedIds([]);
            onReset();
        }
    };

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    if (!isOpen && !isAnimating) return null;

    return (
        <div 
            onClick={handleBackdropClick}
            className={`fixed inset-0 bg-black/70 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4 transition-opacity duration-300 ${
                shouldShow ? 'opacity-100' : 'opacity-0'
            }`}
        >
            {/* Outer Container */}
            <div 
                onClick={(e) => e.stopPropagation()}
                className={`rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden bg-white dark:bg-gradient-to-b dark:from-slate-950 dark:to-blue-800 border border-blue-300 dark:border-slate-800 p-5 transform transition-all duration-300 ${
                    shouldShow ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
                }`}
            >
                {/* Inner Container */}
                <div className="bg-gray-50/80 dark:bg-white/5 backdrop-blur-sm rounded-lg p-5 space-y-4 max-h-[calc(90vh-40px)] overflow-hidden flex flex-col">
                    
                    {/* Header */}
                    <div className="flex items-center justify-between flex-shrink-0">
                        <div>
                            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                                Pilih Kamera
                            </h2>
                            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                                Pilih maksimal {maxSelection} kamera untuk ditampilkan
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-600 dark:text-white/70 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-white/10 rounded-lg p-1.5 transition-all"
                        >
                            <XMarkIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                        </button>
                    </div>

                    {/* Border separator */}
                    <div className="h-px bg-gray-200 dark:bg-white/10 flex-shrink-0"></div>

                    {/* Counter & Search */}
                    <div className="space-y-3 flex-shrink-0">
                        <div className="flex items-center justify-between">
                            <div className={`text-xs sm:text-sm font-semibold ${
                                tempSelectedIds.length >= maxSelection 
                                    ? 'text-red-600 dark:text-red-400' 
                                    : 'text-blue-600 dark:text-blue-400'
                            }`}>
                                Dipilih: {tempSelectedIds.length} / {maxSelection}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                Total: {allCameras.length}
                            </div>
                        </div>

                        {/* Search Bar */}
                        <input
                            type="text"
                            placeholder="Cari kamera (nama, IP)..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full px-3 sm:px-4 py-2.5 text-sm border-2 border-gray-300 dark:border-white/10 rounded-lg bg-gray-50 dark:bg-white/15 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-all"
                        />
                    </div>

                    {/* Camera List - Scrollable */}
                    <div className="flex-1 overflow-y-auto space-y-2 sm:space-y-3 pr-2">
                        {Object.keys(groupedCameras).length === 0 ? (
                            <div className="text-center py-12 text-gray-500 dark:text-gray-400 text-sm">
                                {searchQuery ? 'Tidak ada kamera yang sesuai dengan pencarian' : 'Tidak ada kamera tersedia'}
                            </div>
                        ) : (
                            Object.entries(groupedCameras).map(([location, cameras]) => (
                                <div key={location} className="bg-white/50 dark:bg-white/5 backdrop-blur-sm border-2 border-gray-300 dark:border-white/10 rounded-lg overflow-hidden">
                                    {/* Location Header */}
                                    <div className="bg-gray-50/80 dark:bg-white/5 px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between">
                                        <button
                                            onClick={() => toggleLocation(location)}
                                            className="flex-1 flex items-center gap-2 text-left hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                        >
                                            {expandedLocations[location] ? (
                                                <ChevronUpIcon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 text-gray-600 dark:text-gray-400" />
                                            ) : (
                                                <ChevronDownIcon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 text-gray-600 dark:text-gray-400" />
                                            )}
                                            <span className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white truncate">
                                                {location}
                                            </span>
                                            <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 flex-shrink-0">
                                                ({cameras.length})
                                            </span>
                                        </button>
                                        <button
                                            onClick={() => handleSelectAllInLocation(location)}
                                            className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 hover:underline ml-2 flex-shrink-0 font-medium"
                                        >
                                            {cameras.every(cam => tempSelectedIds.includes(cam.id_cctv)) 
                                                ? 'Batalkan' 
                                                : 'Pilih Semua'}
                                        </button>
                                    </div>

                                    {/* Camera List in Location */}
                                    {expandedLocations[location] && (
                                        <div className="divide-y divide-gray-200 dark:divide-white/10">
                                            {cameras.map(camera => {
                                                const isSelected = tempSelectedIds.includes(camera.id_cctv);
                                                const isDisabled = !isSelected && tempSelectedIds.length >= maxSelection;
                                                
                                                return (
                                                    <label
                                                        key={camera.id_cctv}
                                                        className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 cursor-pointer transition-colors ${
                                                            isDisabled 
                                                                ? 'opacity-50 cursor-not-allowed' 
                                                                : 'hover:bg-gray-50/50 dark:hover:bg-white/5'
                                                        }`}
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={isSelected}
                                                            onChange={() => handleCheckboxChange(camera.id_cctv)}
                                                            disabled={isDisabled}
                                                            className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 rounded border-gray-300 dark:border-white/20 focus:ring-blue-500 disabled:opacity-50 flex-shrink-0"
                                                        />
                                                        <div className="flex-1 min-w-0">
                                                            <div className="font-medium text-sm sm:text-base text-gray-900 dark:text-white truncate">
                                                                {camera.titik_letak || camera.name}
                                                            </div>
                                                            <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2 flex-wrap">
                                                                <span className="truncate">{camera.ip_address}</span>
                                                                {camera.is_streaming ? (
                                                                    <span className="inline-flex items-center gap-1 text-green-600 dark:text-green-400 flex-shrink-0">
                                                                        <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full animate-pulse"></span>
                                                                        <span className="hidden sm:inline">Online</span>
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-red-600 dark:text-red-400 text-xs flex-shrink-0">
                                                                        <span className="hidden sm:inline">Offline</span>
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>

                    {/* Border separator */}
                    <div className="h-px bg-gray-200 dark:bg-white/10 flex-shrink-0"></div>

                    {/* Footer Actions - Responsive */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-3 flex-shrink-0">
                        <button
                            onClick={handleReset}
                            className="px-4 py-2.5 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-300 dark:bg-gray-400/30 hover:bg-gray-400 dark:hover:bg-blue-500 rounded-lg transition-all order-2 sm:order-1"
                        >
                            Reset ke Mode Lokasi
                        </button>
                        <div className="flex gap-2 sm:gap-3 order-1 sm:order-2">
                            <button
                                onClick={onClose}
                                className="flex-1 sm:flex-none px-4 sm:px-6 py-2.5 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-300 dark:bg-gray-400/30 hover:bg-gray-400 dark:hover:bg-blue-500 rounded-lg transition-all"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleApply}
                                disabled={tempSelectedIds.length === 0}
                                className="flex-1 sm:flex-none px-4 sm:px-6 py-2.5 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-300 dark:bg-gray-400/30 hover:bg-gray-400 dark:hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-all"
                            >
                                Terapkan ({tempSelectedIds.length})
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CameraSelectorModal;