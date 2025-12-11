import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import HLSVideoPlayer from './HLSVideoPlayer';
import RecordingControls from './RecordingControls';

 
const LiveMonitoringModal = React.memo(({ camera, onClose }) => {
    const [playerState, setPlayerState] = useState('loading');
    const videoRef = useRef(null);
    const mountedRef = useRef(true);
    
 
    const streamUrl = useMemo(() => 
        camera?.streamUrls?.hls_url || camera?.stream_urls?.hls_url,
        [camera?.streamUrls, camera?.stream_urls]
    );
    
    const hasStreamUrls = useMemo(() => 
        Boolean(streamUrl),
        [streamUrl]
    );

 
    const cameraKey = useMemo(() => 
        camera?.id || camera?.id_cctv,
        [camera?.id, camera?.id_cctv]
    );

    // Prevent body scroll when modal is open
    useEffect(() => {
        mountedRef.current = true;
        
        if (camera) {
            document.body.style.overflow = 'hidden';
            return () => {
                document.body.style.overflow = 'unset';
                mountedRef.current = false;
            };
        }
    }, [camera]);

    // Handle ESC key to close modal
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

 
    const handleLoadStart = useCallback(() => {
        if (!mountedRef.current) return;
        setPlayerState('loading');
    }, []);

    const handleLoadComplete = useCallback((success) => {
        if (!mountedRef.current) return;
        setPlayerState(success ? 'ready' : 'error');
    }, []);

    const handleError = useCallback((error) => {
        if (!mountedRef.current) return;
        setPlayerState('error');
    }, []);

 
    const isPlayerReady = useMemo(() => 
        playerState === 'ready' && hasStreamUrls,
        [playerState, hasStreamUrls]
    );

 
    if (!camera) {
        return null;
    }

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center p-6"
            onClick={onClose}
        >
            {/* Close Button */}
            <button
                onClick={onClose}
                className="fixed top-8 right-8 z-[60] bg-white/10 hover:bg-white/20 text-white p-3 rounded-full backdrop-blur-sm transition-all"
                aria-label="Tutup"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>

            {/* Modal Container */}
            <div
                className="relative w-full bg-gray-900 rounded-lg flex flex-col overflow-hidden shadow-2xl"
                style={{ maxWidth: '1100px', maxHeight: '90vh' }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Video Container */}
                <div
                    className="bg-black relative w-full flex-shrink-0"
                    style={{
                        height: 'calc(90vh - 150px)',
                        maxHeight: '550px'
                    }}
                >
                    <div className="w-full h-full relative">
                        {!hasStreamUrls ? (
                            // Offline camera display
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
                                key={`modal-player-${cameraKey}`}
                                ref={videoRef}
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

                {/* Info Panel */}
                <div className="bg-gray-800 p-5 rounded-b-lg flex-shrink-0" style={{ height: '140px' }}>
                    <div className="flex justify-between items-center">
                        {/* Left Column: Text Details */}
                        <div className="flex-1 pr-4">
                            <h3 className="text-lg font-semibold text-white mb-1.5">
                                {camera?.name || camera?.titik_letak}
                            </h3>
                            {camera?.viewMode !== 'custom' && (camera?.location || camera?.location_name) && (
                                <p className="text-gray-400 text-sm mb-1">
                                    {camera?.location || camera?.location_name}
                                </p>
                            )}
                            <p className="text-xs text-gray-500">IP: {camera?.ip_address || 'N/A'}</p>
                        </div>

                        {/* Right Column: Status + Recording in one row */}
                        <div className="flex items-center space-x-3">
                            {/* ✅ Recording Controls dengan stable props */}
                            <RecordingControls
                                videoRef={videoRef}
                                cameraName={camera?.name || camera?.titik_letak}
                                isPlayerReady={isPlayerReady}
                            />

                            {/* Status Indicators */}
                            <div className="flex items-center space-x-2">
                                {/* Online/Offline Badge */}
                                <div className="flex items-center space-x-2 bg-gray-700/50 px-3 py-1.5 rounded-lg">
                                    <div className={`w-2.5 h-2.5 rounded-full ${hasStreamUrls ? 'bg-green-400' : 'bg-red-400'}`}></div>
                                    <span className="text-gray-200 text-sm font-medium">
                                        {hasStreamUrls ? (playerState === 'ready' ? 'Online' : 'Connecting') : 'Offline'}
                                    </span>
                                </div>

                                {/* Live Badge */}
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
        </div>
    );
});

 
LiveMonitoringModal.displayName = 'LiveMonitoringModal';

export default LiveMonitoringModal;