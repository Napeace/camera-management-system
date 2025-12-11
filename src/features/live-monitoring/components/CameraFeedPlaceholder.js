import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import HLSVideoPlayer from '../components/HLSVideoPlayer';

 
const CameraFeedPlaceholder = React.memo(({ camera, onClick }) => {
    const [playerState, setPlayerState] = useState('idle');
    const mountedRef = useRef(true);
    const loadStartTimeRef = useRef(null);
    const isTransitioningRef = useRef(false); 
    
 
    const streamUrl = useMemo(() => 
        camera.streamUrls?.hls_url || camera.stream_urls?.hls_url,
        [camera.streamUrls, camera.stream_urls]
    );
    
    const hasStreamUrls = useMemo(() => 
        Boolean(streamUrl),
        [streamUrl]
    );

 
    const cameraKey = useMemo(() => 
        camera.id || camera.id_cctv,
        [camera.id, camera.id_cctv]
    );

    // Reset state on camera change
    useEffect(() => {
        mountedRef.current = true;
        setPlayerState('idle');
        loadStartTimeRef.current = null;
        isTransitioningRef.current = false;
        
        return () => {
            mountedRef.current = false;
        };
    }, [cameraKey]);

 
    const handleLoadStart = () => {
        if (!mountedRef.current) return;
        
 
        if (!isTransitioningRef.current) {
            loadStartTimeRef.current = Date.now();
            setPlayerState('loading');
        }
    };

    const handleLoadComplete = (success) => {
        if (!mountedRef.current) return;
        
        if (success) {
 
            isTransitioningRef.current = true;
            
 
            const elapsed = Date.now() - (loadStartTimeRef.current || 0);
            const minDisplayTime = 500; // Minimum 500ms untuk stability
            const delay = Math.max(0, minDisplayTime - elapsed);
            
            setTimeout(() => {
                if (mountedRef.current) {
                    setPlayerState('ready');
                    // Keep locked for another 200ms to prevent re-trigger
                    setTimeout(() => {
                        isTransitioningRef.current = false;
                    }, 200);
                }
            }, delay);
        } else {
            setPlayerState('error');
            isTransitioningRef.current = false;
        }
    };

    const handleError = (error) => {
        if (!mountedRef.current) return;
        
 
        if (!isTransitioningRef.current) {
            setPlayerState('error');
        }
    };

 
    const statusInfo = useMemo(() => {
        if (!hasStreamUrls) {
            return {
                color: 'red',
                text: 'Offline',
                dot: 'bg-red-500'
            };
        }
        
        switch (playerState) {
            case 'loading':
                return {
                    color: 'yellow',
                    text: 'Connecting',
                    dot: 'bg-yellow-500 animate-pulse'
                };
            case 'ready':
                return {
                    color: 'green',
                    text: 'Live',
                    dot: 'bg-green-500 animate-pulse'
                };
            case 'error':
                return {
                    color: 'red',
                    text: 'Error',
                    dot: 'bg-red-500'
                };
            default:
                return {
                    color: 'yellow',
                    text: 'Ready',
                    dot: 'bg-yellow-500'
                };
        }
    }, [hasStreamUrls, playerState]);

 
    const handleClick = () => {
        onClick(camera);
    };

    return (
        <motion.div
            variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
        >
            <div
                className="bg-gray-100 dark:bg-gray-900 rounded-xl overflow-hidden cursor-pointer hover:ring-2 hover:ring-blue-500 dark:hover:ring-blue-400 transition-all aspect-video shadow-sm hover:shadow-md"
                onClick={handleClick}
            >
                <div className="h-full flex flex-col">
                    {/* Video Container */}
                    <div className="flex-1 bg-black relative">
                        {hasStreamUrls ? (
                            <>
                                {/* ✅ HLS Video Player dengan stable props */}
                                <HLSVideoPlayer
                                    key={`player-${cameraKey}`}
                                    streamUrls={{
                                        hls_url: streamUrl
                                    }}
                                    cameraName={camera.name || camera.titik_letak}
                                    className="w-full h-full"
                                    controls={false}
                                    muted={true}
                                    autoPlay={true}
                                    onLoadStart={handleLoadStart}
                                    onLoadComplete={handleLoadComplete}
                                    onError={handleError}
                                />
                                
                                {/* ✅ Connecting Overlay - STABLE, NO FLICKER, NO CSS NEEDED */}
                                {playerState === 'loading' && (
                                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-10 transition-opacity duration-300">
                                        <div className="text-center">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-t-2 border-yellow-500 mx-auto mb-2"></div>
                                            <p className="text-yellow-400 text-sm font-medium">Connecting...</p>
                                        </div>
                                    </div>
                                )}
                                
                                {/* ✅ NO "Connected" overlay - langsung muncul video saja */}
                            </>
                        ) : (
                            // No stream URL available
                            <div className="w-full h-full flex flex-col items-center justify-center text-gray-500">
                                <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636" />
                                </svg>
                                <p className="text-sm">No Stream Available</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
});

 
CameraFeedPlaceholder.displayName = 'CameraFeedPlaceholder';

export default CameraFeedPlaceholder;