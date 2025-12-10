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

   
  useImperativeHandle(ref, () => videoRef.current);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !streamUrls?.hls_url) {
      setPlayerStatus('no-stream');
      return;
    }
      setPlayerStatus('loading');
    setErrorMessage('');
    onLoadStart && onLoadStart();

    // Cleanup previous instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
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
        manifestLoadingTimeOut: 5000,
        manifestLoadingMaxRetry: 1,
        levelLoadingTimeOut: 5000,
        fragLoadingTimeOut: 5000,
        manifestLoadingRetryDelay: 500,
        levelLoadingRetryDelay: 500,
        fragLoadingRetryDelay: 500,
      });

      hlsRef.current = hls;

      hls.on(Hls.Events.MEDIA_ATTACHED, () => {
       });

      hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
         setPlayerStatus('playing');
        onLoadComplete && onLoadComplete(true);
        
        if (autoPlay) {
          const playPromise = video.play();
          if (playPromise !== undefined) {
            playPromise
              .then(() => {
               })
              .catch(e => {
               });
          }
        }
      });

      hls.on(Hls.Events.FRAG_LOADED, (event, data) => {
        if (playerStatus === 'loading') {
           setPlayerStatus('playing');
        }
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        // console.error(`❌ [${cameraName}] HLS error:`, data.type, data.details, data.fatal); // Dihapus
        
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
               const errorMsg = 'Camera Offline';
              setPlayerStatus('error');
              setErrorMessage(errorMsg);
              onError && onError(errorMsg);
              
              if (hlsRef.current) {
                hlsRef.current.destroy();
                hlsRef.current = null;
              }
              break;
              
            case Hls.ErrorTypes.MEDIA_ERROR:
               hls.recoverMediaError();
              break;
              
            default:
               const defaultErrorMsg = getErrorMessage(data);
              setPlayerStatus('error');
              setErrorMessage(defaultErrorMsg);
              onError && onError(defaultErrorMsg);
              hls.destroy();
              hlsRef.current = null;
              break;
          }
        } else {
          // console.warn(`⚠️ [${cameraName}] Non-fatal error:`, data.details); // Dihapus
        }
      });

      hls.loadSource(streamUrls.hls_url);
      hls.attachMedia(video);

    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
       video.src = streamUrls.hls_url;
      
      video.addEventListener('loadstart', () => {
        setPlayerStatus('loading');
      });

      video.addEventListener('loadeddata', () => {
         setPlayerStatus('playing');
        onLoadComplete && onLoadComplete(true);
      });

      video.addEventListener('error', (e) => {
        // console.error(`❌ [${cameraName}] Native video error:`, e); // Dihapus
        setPlayerStatus('error');
        setErrorMessage('Camera Offline');
        onError && onError('Camera Offline');
      });

      if (autoPlay) {
        video.play().catch(e => {
         });
      }

    } else {
      setPlayerStatus('error');
      setErrorMessage('Browser tidak mendukung HLS streaming');
      onError && onError('Browser tidak mendukung HLS streaming');
    }

    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
      if (hlsRef.current) {
         hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [streamUrls?.hls_url, cameraName, autoPlay, onLoadStart, onLoadComplete, onError, playerStatus]);

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
      video.play().catch(e => {}); // Dihapus
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
      
      {playerStatus === 'loading' && (
        <div className="absolute inset-0 bg-black flex items-center justify-center">
          <div className="text-center text-white">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white mx-auto mb-3"></div>
            <p className="text-sm">Loading stream...</p>
          </div>
        </div>
      )}

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