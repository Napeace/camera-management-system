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
  const [playerStatus, setPlayerStatus] = useState('loading'); // loading, playing, error, no-stream
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !streamUrls?.hls_url) {
      setPlayerStatus('no-stream');
      return;
    }

    // Reset status saat mulai load
    setPlayerStatus('loading');
    setErrorMessage('');
    onLoadStart && onLoadStart();

    // Cleanup previous HLS instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    // Check if HLS is supported
    if (Hls.isSupported()) {
      console.log('HLS.js supported, initializing player for:', cameraName);
      
      const hls = new Hls({
        debug: false,
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90,
        maxBufferLength: 30,
        maxMaxBufferLength: 60,
        manifestLoadingTimeOut: 10000,
        manifestLoadingMaxRetry: 3,
        levelLoadingTimeOut: 10000,
        fragLoadingTimeOut: 10000,
      });

      hlsRef.current = hls;

      // Event listeners
      hls.on(Hls.Events.MEDIA_ATTACHED, () => {
        console.log('HLS media attached for:', cameraName);
      });

      hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
        console.log('HLS manifest parsed for:', cameraName, data);
        setPlayerStatus('playing');
        onLoadComplete && onLoadComplete(true);
        
        if (autoPlay) {
          video.play().catch(e => {
            console.log('Autoplay prevented for:', cameraName, e);
            // Autoplay blocked, but stream is ready
          });
        }
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        console.error('HLS error for:', cameraName, data);
        
        if (data.fatal) {
          const errorMsg = getErrorMessage(data);
          setPlayerStatus('error');
          setErrorMessage(errorMsg);
          onError && onError(errorMsg);
          
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.log('Network error, attempting recovery for:', cameraName);
              setTimeout(() => {
                if (hlsRef.current) {
                  hls.startLoad();
                }
              }, 3000);
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.log('Media error, attempting recovery for:', cameraName);
              hls.recoverMediaError();
              break;
            default:
              console.log('Fatal error, destroying HLS instance for:', cameraName);
              hls.destroy();
              hlsRef.current = null;
              break;
          }
        }
      });

      hls.on(Hls.Events.FRAG_LOADED, () => {
        if (playerStatus === 'loading') {
          setPlayerStatus('playing');
        }
      });

      // Load and attach
      hls.loadSource(streamUrls.hls_url);
      hls.attachMedia(video);

    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Native HLS support (Safari)
      console.log('Native HLS support detected for:', cameraName);
      
      video.src = streamUrls.hls_url;
      
      video.addEventListener('loadstart', () => {
        setPlayerStatus('loading');
      });

      video.addEventListener('loadeddata', () => {
        console.log('Native HLS loaded for:', cameraName);
        setPlayerStatus('playing');
        onLoadComplete && onLoadComplete(true);
      });

      video.addEventListener('error', (e) => {
        console.error('Native video error for:', cameraName, e);
        setPlayerStatus('error');
        setErrorMessage('Gagal memuat stream video');
        onError && onError('Gagal memuat stream video');
      });

      if (autoPlay) {
        video.play().catch(e => {
          console.log('Autoplay prevented for:', cameraName, e);
        });
      }

    } else {
      console.error('HLS not supported in this browser');
      setPlayerStatus('error');
      setErrorMessage('Browser tidak mendukung HLS streaming');
      onError && onError('Browser tidak mendukung HLS streaming');
    }

    // Cleanup on unmount
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [streamUrls?.hls_url, cameraName, autoPlay]);

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
    if (!video) return;

    if (video.paused) {
      video.play().catch(e => console.log('Play failed:', e));
    } else {
      video.pause();
    }
  };

  const handleRetry = () => {
    if (hlsRef.current) {
      setPlayerStatus('loading');
      setErrorMessage('');
      hlsRef.current.startLoad();
    }
  };

  const renderPlayerContent = () => {
    switch (playerStatus) {
      case 'loading':
        return (
          <div className="absolute inset-0 bg-black flex items-center justify-center">
            <div className="text-center text-white">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
              <p className="text-sm">Loading stream...</p>
            </div>
          </div>
        );

      case 'error':
        return (
          <div className="absolute inset-0 bg-black flex items-center justify-center">
            <div className="text-center text-white p-4">
              <svg className="w-8 h-8 mx-auto mb-2 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm mb-2">{errorMessage}</p>
              <button 
                onClick={handleRetry}
                className="text-xs bg-blue-600 px-3 py-1 rounded hover:bg-blue-700"
              >
                Retry
              </button>
            </div>
          </div>
        );

      case 'no-stream':
        return (
          <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
            <div className="text-center text-gray-400">
              <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 002 2v8a2 2 0 002 2z" />
              </svg>
              <p className="text-sm">No stream available</p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`relative bg-black rounded-lg overflow-hidden ${className}`}>
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        controls={controls}
        muted={muted}
        playsInline
        onClick={handleVideoClick}
        style={{ display: playerStatus === 'playing' ? 'block' : 'none' }}
      />
      {renderPlayerContent()}
      
      {/* Stream Info Overlay */}
      {playerStatus === 'playing' && (
        <div className="absolute top-2 left-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
          LIVE
        </div>
      )}
    </div>
  );
};

export default HLSVideoPlayer;