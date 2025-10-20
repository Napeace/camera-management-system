import React, { useRef, useEffect, useState } from 'react';
import Hls from 'hls.js';

const HLSVideoPlayer = ({ 
  streamUrls, 
  cameraName, 
  className = '',
  autoPlay = true,
  controls = true,
  muted = true,
  onError,
  onLoadStart,
  onLoadComplete 
}) => {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const retryTimeoutRef = useRef(null);
  const [playerStatus, setPlayerStatus] = useState('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !streamUrls?.hls_url) {
      setPlayerStatus('no-stream');
      return;
    }

    console.log(`🎥 [${cameraName}] Initializing HLS player`);
    console.log(`🎥 [${cameraName}] Stream URL:`, streamUrls.hls_url);
    
    setPlayerStatus('loading');
    setErrorMessage('');
    onLoadStart && onLoadStart();

    // Cleanup previous instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (Hls.isSupported()) {
      console.log(`✅ [${cameraName}] HLS.js supported`);
      
      const hls = new Hls({
        debug: false,
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90,
        maxBufferLength: 30,
        maxMaxBufferLength: 60,
        manifestLoadingTimeOut: 15000, // Increased timeout
        manifestLoadingMaxRetry: 5, // More retries
        levelLoadingTimeOut: 15000,
        fragLoadingTimeOut: 15000,
        manifestLoadingRetryDelay: 1000,
        levelLoadingRetryDelay: 1000,
        fragLoadingRetryDelay: 1000,
      });

      hlsRef.current = hls;

      // ============ Event Listeners ============
      
      hls.on(Hls.Events.MEDIA_ATTACHED, () => {
        console.log(`✅ [${cameraName}] Media attached`);
      });

      hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
        console.log(`✅ [${cameraName}] Manifest parsed`, data.levels?.length, 'quality levels');
        setPlayerStatus('playing');
        setRetryCount(0);
        onLoadComplete && onLoadComplete(true);
        
        if (autoPlay) {
          const playPromise = video.play();
          if (playPromise !== undefined) {
            playPromise
              .then(() => {
                console.log(`✅ [${cameraName}] Autoplay started`);
              })
              .catch(e => {
                console.log(`⚠️ [${cameraName}] Autoplay prevented:`, e.message);
                // Autoplay blocked but stream is ready - not an error
              });
          }
        }
      });

      hls.on(Hls.Events.FRAG_LOADED, (event, data) => {
        if (playerStatus === 'loading') {
          console.log(`✅ [${cameraName}] First fragment loaded`);
          setPlayerStatus('playing');
        }
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        console.error(`❌ [${cameraName}] HLS error:`, data.type, data.details, data.fatal);
        
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.log(`🔄 [${cameraName}] Network error, attempting recovery...`);
              
              // Don't show error immediately, try to recover
              if (retryCount < 3) {
                setRetryCount(prev => prev + 1);
                retryTimeoutRef.current = setTimeout(() => {
                  if (hlsRef.current) {
                    console.log(`🔄 [${cameraName}] Retrying... (${retryCount + 1}/3)`);
                    hls.startLoad();
                  }
                }, 2000 * (retryCount + 1)); // Exponential backoff
              } else {
                // After 3 retries, show error
                const errorMsg = 'Masalah koneksi jaringan';
                setPlayerStatus('error');
                setErrorMessage(errorMsg);
                onError && onError(errorMsg);
              }
              break;
              
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.log(`🔄 [${cameraName}] Media error, attempting recovery...`);
              hls.recoverMediaError();
              break;
              
            default:
              console.log(`❌ [${cameraName}] Fatal error, cannot recover`);
              const errorMsg = getErrorMessage(data);
              setPlayerStatus('error');
              setErrorMessage(errorMsg);
              onError && onError(errorMsg);
              hls.destroy();
              hlsRef.current = null;
              break;
          }
        } else {
          // Non-fatal errors - just log them
          console.warn(`⚠️ [${cameraName}] Non-fatal error:`, data.details);
        }
      });

      // Load and attach
      hls.loadSource(streamUrls.hls_url);
      hls.attachMedia(video);

    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Native HLS support (Safari)
      console.log(`✅ [${cameraName}] Using native HLS support`);
      
      video.src = streamUrls.hls_url;
      
      video.addEventListener('loadstart', () => {
        setPlayerStatus('loading');
      });

      video.addEventListener('loadeddata', () => {
        console.log(`✅ [${cameraName}] Native HLS loaded`);
        setPlayerStatus('playing');
        onLoadComplete && onLoadComplete(true);
      });

      video.addEventListener('error', (e) => {
        console.error(`❌ [${cameraName}] Native video error:`, e);
        setPlayerStatus('error');
        setErrorMessage('Gagal memuat stream video');
        onError && onError('Gagal memuat stream video');
      });

      if (autoPlay) {
        video.play().catch(e => {
          console.log(`⚠️ [${cameraName}] Autoplay prevented:`, e.message);
        });
      }

    } else {
      console.error(`❌ [${cameraName}] HLS not supported in this browser`);
      setPlayerStatus('error');
      setErrorMessage('Browser tidak mendukung HLS streaming');
      onError && onError('Browser tidak mendukung HLS streaming');
    }

    // Cleanup on unmount
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
      if (hlsRef.current) {
        console.log(`🧹 [${cameraName}] Cleaning up HLS instance`);
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [streamUrls?.hls_url, cameraName]);

  const getErrorMessage = (data) => {
    switch (data.type) {
      case Hls.ErrorTypes.NETWORK_ERROR:
        return 'Masalah koneksi jaringan';
      case Hls.ErrorTypes.MEDIA_ERROR:
        return 'Masalah media stream';
      case Hls.ErrorTypes.OTHER_ERROR:
        return 'Masalah teknis lainnya';
      default:
        return 'Gagal memuat stream';
    }
  };

  const handleVideoClick = () => {
    const video = videoRef.current;
    if (!video || !controls) return;

    if (video.paused) {
      video.play().catch(e => console.log(`⚠️ [${cameraName}] Play failed:`, e));
    } else {
      video.pause();
    }
  };

  const handleRetry = () => {
    console.log(`🔄 [${cameraName}] Manual retry triggered`);
    setRetryCount(0);
    setPlayerStatus('loading');
    setErrorMessage('');
    
    if (hlsRef.current) {
      hlsRef.current.startLoad();
    } else {
      // Re-initialize
      window.location.reload();
    }
  };

  // Render different states
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
      />
      
      {/* Loading Overlay */}
      {playerStatus === 'loading' && (
        <div className="absolute inset-0 bg-black flex items-center justify-center">
          <div className="text-center text-white">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white mx-auto mb-3"></div>
            <p className="text-sm">Loading stream...</p>
            {retryCount > 0 && (
              <p className="text-xs text-gray-400 mt-1">Retry {retryCount}/3</p>
            )}
          </div>
        </div>
      )}

      {/* Error Overlay */}
      {playerStatus === 'error' && (
        <div className="absolute inset-0 bg-black flex items-center justify-center">
          <div className="text-center text-white p-4 max-w-md">
            <svg className="w-12 h-12 mx-auto mb-3 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm mb-1 font-medium">{errorMessage}</p>
            <p className="text-xs text-gray-400 mb-3">
              Pastikan kamera online dan jaringan stabil
            </p>
            <button 
              onClick={handleRetry}
              className="text-sm bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Coba Lagi
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HLSVideoPlayer;