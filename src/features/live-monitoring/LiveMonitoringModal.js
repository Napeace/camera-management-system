import React, { useEffect, useState } from 'react';
import HLSVideoPlayer from '../../components/common/HLSVideoPlayer';

const LiveMonitoringModal = ({ camera, onClose }) => {
    const [playerState, setPlayerState] = useState('loading');

    // ✅ SEMUA HOOKS DIPINDAHKAN KE ATAS SINI
    // Prevent body scroll when modal is open
    useEffect(() => {
        // Hanya jalankan jika modalnya tampil (ada data camera)
        if (camera) {
            document.body.style.overflow = 'hidden';
            return () => {
                document.body.style.overflow = 'unset';
            };
        }
    }, [camera]); // Tambahkan `camera` sebagai dependency

    // Handle ESC key to close modal
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    // ✅ KONDISI DITEMPATKAN SETELAH SEMUA HOOKS
    if (!camera) {
        return null;
    }

    const handleLoadStart = () => {
        console.log('🎬 Modal: Load start');
        setPlayerState('loading');
    };

    const handleLoadComplete = (success) => {
        console.log('🎬 Modal: Load complete', success);
        setPlayerState(success ? 'ready' : 'error');
    };

    const handleError = (error) => {
        console.log('🎬 Modal: Error', error);
        setPlayerState('error');
    };

    const hasStreamUrls = camera?.streamUrls?.hls_url || camera?.stream_urls?.hls_url;
    const streamUrl = camera?.streamUrls?.hls_url || camera?.stream_urls?.hls_url;

    console.log('🎬 Modal Render:', {
        camera: camera?.name,
        hasStreamUrls,
        streamUrl,
        status: camera?.status
    });

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center p-6"
            onClick={onClose}
        >
            {/* Tombol Close - di luar modal */}
            <button
                onClick={onClose}
                className="fixed top-8 right-8 z-[60] bg-white/10 hover:bg-white/20 text-white p-3 rounded-full backdrop-blur-sm transition-all"
                aria-label="Tutup"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>

            {/* Container utama modal - ukuran lebih kecil dan terkontrol */}
            <div
                className="relative w-full bg-gray-900 rounded-lg flex flex-col overflow-hidden shadow-2xl"
                style={{ maxWidth: '1100px', maxHeight: '90vh' }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Video Container - aspect ratio 16:9 dengan max height */}
                <div
                    className="bg-black relative w-full flex-shrink-0"
                    style={{
                        height: 'calc(90vh - 150px)',
                        maxHeight: '550px'
                    }}
                >
                    <div className="w-full h-full relative">
                        {!hasStreamUrls ? (
                            // Tampilan untuk kamera offline
                            <div className="w-full h-full flex items-center justify-center text-white bg-gray-900">
                                <div className="text-center">
                                    <svg className="w-16 h-16 mx-auto mb-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636" />
                                    </svg>
                                    <p className="text-xl font-semibold mb-2">Kamera Offline</p>
                                    <p className="text-sm text-gray-400">Stream tidak tersedia saat ini</p>
                                </div>
                            </div>
                        ) : (
                            <HLSVideoPlayer
                                streamUrls={{
                                    hls_url: streamUrl
                                }}
                                cameraName={camera?.name || camera?.titik_letak}
                                className="w-full h-full"
                                controls={true}
                                muted={false}
                                autoPlay={true}
                                onLoadStart={handleLoadStart}
                                onLoadComplete={handleLoadComplete}
                                onError={handleError}
                            />
                        )}
                    </div>
                </div>

                {/* Info Panel - fixed height */}
                <div className="bg-gray-800 p-5 rounded-b-lg flex-shrink-0" style={{ height: '140px' }}>
                    <div className="flex justify-between items-center">
                        {/* Kolom Kiri: Detail Teks */}
                        <div className="flex-1 pr-4">
                            <h3 className="text-lg font-semibold text-white mb-1.5">
                                {camera?.name || camera?.titik_letak}
                            </h3>
                            <p className="text-gray-400 text-sm mb-1">
                                {camera?.location || camera?.location_name}
                            </p>
                            <p className="text-xs text-gray-500">IP: {camera?.ip_address}</p>
                        </div>

                        {/* Kolom Kanan: Indikator Status */}
                        <div className="flex flex-col items-end space-y-2.5">
                            <div className="flex items-center space-x-2 bg-gray-700/50 px-3 py-1.5 rounded-lg">
                                <div className={`w-2.5 h-2.5 rounded-full ${hasStreamUrls ? 'bg-green-400' : 'bg-red-400'}`}></div>
                                <span className="text-gray-200 text-sm font-medium">
                                    {hasStreamUrls ? (playerState === 'ready' ? 'Online' : 'Connecting') : 'Offline'}
                                </span>
                            </div>
                            {hasStreamUrls && playerState === 'ready' && (
                                <div className="flex items-center space-x-2 bg-red-900/40 px-3 py-1.5 rounded-lg">
                                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                                    <span className="font-semibold text-red-400 text-sm">LIVE</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LiveMonitoringModal;