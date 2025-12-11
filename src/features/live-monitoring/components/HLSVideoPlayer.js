import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import Hls from 'hls.js';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const HLSVideoPlayer = forwardRef(({ 
  streamUrls, 
  cameraName, 
  className = '',
  autoPlay = true,
  controls = true,
  muted = true,
  onError,
  onLoadStart,
  onLoadComplete 
}, ref) => {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const retryTimeoutRef = useRef(null);
  const [playerStatus, setPlayerStatus] = useState('loading');
  const [errorMessage, setErrorMessage] = useState('');
  
 
  const isLoadingRef = useRef(false);
  const mountedRef = useRef(true);
  const currentUrlRef = useRef(null);
  const hasLoadedRef = useRef(false);
  const hasNotifiedParentRef = useRef(false); 

  useImperativeHandle(ref, () => videoRef.current);

  useEffect(() => {
    mountedRef.current = true;
    
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    const streamUrl = streamUrls?.hls_url;
    
 
    // 1. No video element
    // 2. No stream URL
    // 3. Component unmounted
    if (!video || !streamUrl || !mountedRef.current) {
      if (!streamUrl) {
        setPlayerStatus('no-stream');
      }
      return;
    }

 
    // This allows multiple different cameras to load simultaneously
    if (currentUrlRef.current === streamUrl && hasLoadedRef.current && isLoadingRef.current) {
      return;
    }

 
    if (isLoadingRef.current && currentUrlRef.current === streamUrl) {
      return;
    }

    // Mark as loading
    isLoadingRef.current = true;
    currentUrlRef.current = streamUrl;
    hasLoadedRef.current = false;
    hasNotifiedParentRef.current = false; 

    setPlayerStatus('loading');
    setErrorMessage('');
    onLoadStart && onLoadStart();

 
    if (hlsRef.current) {
      try {
        hlsRef.current.destroy();
      } catch (e) {
        // Ignore destroy errors
      }
      hlsRef.current = null;
    }

 
    if (Hls.isSupported()) {
      const hls = new Hls({
        debug: false,
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90,
        maxBufferLength: 30,
        maxMaxBufferLength: 60,
        manifestLoadingTimeOut: 10000, 
        manifestLoadingMaxRetry: 2, 
        levelLoadingTimeOut: 10000,
        fragLoadingTimeOut: 10000,
        manifestLoadingRetryDelay: 1000,
        levelLoadingRetryDelay: 1000,
        fragLoadingRetryDelay: 1000,
 
        capLevelToPlayerSize: true,
        maxMaxBufferLength: 60,
      });

      hlsRef.current = hls;

 
      hls.on(Hls.Events.MEDIA_ATTACHED, () => {
        if (!mountedRef.current) return;
      });

      hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
        if (!mountedRef.current) return;
        
        setPlayerStatus('playing');
        hasLoadedRef.current = true;
        isLoadingRef.current = false;
        
        onLoadComplete && onLoadComplete(true);
        
        if (autoPlay) {
          const playPromise = video.play();
          if (playPromise !== undefined) {
            playPromise
              .then(() => {
                // Video started playing
              })
              .catch(e => {
                // Autoplay prevented, user interaction needed
              });
          }
        }
      });

      hls.on(Hls.Events.FRAG_LOADED, (event, data) => {
        if (!mountedRef.current) return;
        
        if (playerStatus === 'loading') {
          setPlayerStatus('playing');
          hasLoadedRef.current = true;
          isLoadingRef.current = false;
        }
      });

 
      hls.on(Hls.Events.ERROR, (event, data) => {
        if (!mountedRef.current) return;
        
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              const errorMsg = 'Camera Offline';
              setPlayerStatus('error');
              setErrorMessage(errorMsg);
              isLoadingRef.current = false;
              
 
              if (!hasNotifiedParentRef.current) {
                hasNotifiedParentRef.current = true;
                onError && onError(errorMsg);
              }
              
 
              if (hlsRef.current) {
                try {
                  hlsRef.current.destroy();
                } catch (e) {
                  // Ignore
                }
                hlsRef.current = null;
              }
              break;
              
            case Hls.ErrorTypes.MEDIA_ERROR:
 
              try {
                hls.recoverMediaError();
              } catch (e) {
                setPlayerStatus('error');
                setErrorMessage('Media error');
                isLoadingRef.current = false;
              }
              break;
              
            default:
              const defaultErrorMsg = getErrorMessage(data);
              setPlayerStatus('error');
              setErrorMessage(defaultErrorMsg);
              isLoadingRef.current = false;
              
 
              if (!hasNotifiedParentRef.current) {
                hasNotifiedParentRef.current = true;
                onError && onError(defaultErrorMsg);
              }
              
              try {
                hls.destroy();
              } catch (e) {
                // Ignore
              }
              hlsRef.current = null;
              break;
          }
        }
 
      });

 
      try {
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
      } catch (error) {
        setPlayerStatus('error');
        setErrorMessage('Failed to load stream');
        isLoadingRef.current = false;
        onError && onError('Failed to load stream');
      }

    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
 
      video.src = streamUrl;
      
      const handleLoadStart = () => {
        if (!mountedRef.current) return;
        setPlayerStatus('loading');
      };

      const handleLoadedData = () => {
        if (!mountedRef.current) return;
        setPlayerStatus('playing');
        hasLoadedRef.current = true;
        isLoadingRef.current = false;
        onLoadComplete && onLoadComplete(true);
      };

      const handleError = (e) => {
        if (!mountedRef.current) return;
        setPlayerStatus('error');
        setErrorMessage('Camera Offline');
        isLoadingRef.current = false;
        onError && onError('Camera Offline');
      };

      video.addEventListener('loadstart', handleLoadStart);
      video.addEventListener('loadeddata', handleLoadedData);
      video.addEventListener('error', handleError);

      if (autoPlay) {
        video.play().catch(e => {
          // Autoplay prevented
        });
      }

 
      return () => {
        video.removeEventListener('loadstart', handleLoadStart);
        video.removeEventListener('loadeddata', handleLoadedData);
        video.removeEventListener('error', handleError);
      };

    } else {
      setPlayerStatus('error');
      setErrorMessage('Browser tidak mendukung HLS streaming');
      isLoadingRef.current = false;
      onError && onError('Browser tidak mendukung HLS streaming');
    }

 
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
      
      if (hlsRef.current) {
        try {
          hlsRef.current.destroy();
        } catch (e) {
          // Ignore destroy errors
        }
        hlsRef.current = null;
      }
      
      isLoadingRef.current = false;
    };
  }, [streamUrls?.hls_url, cameraName, autoPlay, onLoadStart, onLoadComplete, onError]);

  const getErrorMessage = (data) => {
    switch (data.type) {
      case Hls.ErrorTypes.NETWORK_ERROR:
        return 'Camera Offline';
      case Hls.ErrorTypes.MEDIA_ERROR:
        return 'Masalah media stream';
      case Hls.ErrorTypes.OTHER_ERROR:
        return 'Masalah teknis lainnya';
      default:
        return 'Camera Offline';
    }
  };

  const handleVideoClick = () => {
    const video = videoRef.current;
    if (!video || !controls) return;

    if (video.paused) {
      video.play().catch(e => {});
    } else {
      video.pause();
    }
  };

 
  if (playerStatus === 'no-stream') {
    return (
      <div className={`relative bg-gray-900 flex items-center justify-center ${className}`}>
        <div className="text-center text-gray-400">
          <svg className="w-12 h-12 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <p className="text-sm">No stream available</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative bg-black ${className}`}>
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        controls={controls}
        muted={muted}
        playsInline
        onClick={handleVideoClick}
        crossOrigin="anonymous"
      />
      
      {/* ✅ STABILIZED: Loading overlay */}
      {playerStatus === 'loading' && (
        <div className="absolute inset-0 bg-black flex items-center justify-center">
          <div className="text-center text-white">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white mx-auto mb-3"></div>
            <p className="text-sm">Loading stream...</p>
          </div>
        </div>
      )}

      {/* ✅ STABILIZED: Error overlay */}
      {playerStatus === 'error' && (
        <div className="absolute inset-0 bg-black flex items-center justify-center">
          <div className="text-center text-white p-4 max-w-md">
            <ExclamationTriangleIcon className="w-12 h-12 mx-auto mb-3 text-red-500" />
            <p className="text-sm mb-1 font-medium">{errorMessage}</p>
            <p className="text-xs text-gray-400 mb-3">
              Kamera sedang offline
            </p>
          </div>
        </div>
      )}
    </div>
  );
});

HLSVideoPlayer.displayName = 'HLSVideoPlayer';

export default HLSVideoPlayer;