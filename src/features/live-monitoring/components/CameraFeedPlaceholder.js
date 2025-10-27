import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import HLSVideoPlayer from '../components/HLSVideoPlayer';

const CameraFeedPlaceholder = ({ camera, onClick }) => {
    const [playerState, setPlayerState] = useState('idle'); // idle, loading, ready, error
    const [showOverlay, setShowOverlay] = useState(true);
    
    // Check if stream URLs exist
    const hasStreamUrls = camera.streamUrls?.hls_url || camera.stream_urls?.hls_url;
    const streamUrl = camera.streamUrls?.hls_url || camera.stream_urls?.hls_url;

    // Reset overlay on camera change
    useEffect(() => {
        setShowOverlay(true);
        setPlayerState('idle');
    }, [camera.id]);

    const handleLoadStart = () => {
        console.log(`📹 [${camera.name}] Load start`);
        setPlayerState('loading');
    };

    const handleLoadComplete = (success) => {
        console.log(`📹 [${camera.name}] Load complete:`, success);
        if (success) {
            setPlayerState('ready');
            // Hide overlay after video loads
            setTimeout(() => {
                setShowOverlay(false);
            }, 1000);
        }
    };

    const handleError = (error) => {
        console.log(`📹 [${camera.name}] Error:`, error);
        setPlayerState('error');
        setShowOverlay(true);
    };

    const getStatusInfo = () => {
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
    };

    const statusInfo = getStatusInfo();

    return (
        <motion.div
            variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
        >
            <div
                className="bg-gray-100 dark:bg-gray-900 rounded-xl overflow-hidden cursor-pointer hover:ring-2 hover:ring-blue-500 dark:hover:ring-blue-400 transition-all aspect-video shadow-sm hover:shadow-md"
                onClick={() => onClick(camera)}
            >
                <div className="h-full flex flex-col">
                    {/* Video Container */}
                    <div className="flex-1 bg-black relative">
                        {hasStreamUrls ? (
                            <>
                                {/* HLS Video Player */}
                                <HLSVideoPlayer
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
                                
                                {/* Connecting Overlay - Only show when loading and overlay visible */}
                                {showOverlay && playerState === 'loading' && (
                                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-10">
                                        <div className="text-center">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500 mx-auto mb-2"></div>
                                            <p className="text-yellow-400 text-sm font-medium">Connecting...</p>
                                        </div>
                                    </div>
                                )}
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
};

export default CameraFeedPlaceholder;