import React from 'react';
import HLSVideoPlayer from '../../components/common/HLSVideoPlayer';

const LiveMonitoringModal = ({ camera, onClose }) => {
  if (!camera) return null;

  console.log('LiveMonitoringModal - Camera data:', camera); // Debug log

  return (
    <div className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center p-6">
      
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
      >

        {/* Video Container - aspect ratio 16:9 dengan max height */}
        <div 
          className="bg-black relative w-full flex-shrink-0"
          style={{ 
            height: 'calc(90vh - 150px)',
            maxHeight: '550px'
          }}
        >
          <div className="w-full h-full">
            {camera.streamUrls || camera.stream_urls ? (
              <HLSVideoPlayer
                streamUrls={camera.streamUrls || camera.stream_urls}
                cameraName={camera.name}
                className="w-full h-full"
                controls={true}
                muted={false}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
                  <p className="text-lg">Loading stream...</p>
                  <p className="text-sm text-gray-400 mt-2">Kamera: {camera.name}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Info Panel - fixed height */}
        <div className="bg-gray-800 p-5 rounded-b-lg flex-shrink-0" style={{ height: '140px' }}>
          <div className="flex justify-between items-center">
            {/* Kolom Kiri: Detail Teks */}
            <div className="flex-1 pr-4">
              <h3 className="text-lg font-semibold text-white mb-1.5">{camera.name}</h3>
              <p className="text-gray-400 text-sm mb-1">{camera.location}</p>
              <p className="text-xs text-gray-500">IP: {camera.ip_address}</p>
            </div>

            {/* Kolom Kanan: Indikator Status */}
            <div className="flex flex-col items-end space-y-2.5">
              <div className="flex items-center space-x-2 bg-gray-700/50 px-3 py-1.5 rounded-lg">
                <div className={`w-2.5 h-2.5 rounded-full ${camera.status ? 'bg-green-400' : 'bg-red-400'}`}></div>
                <span className="text-gray-200 text-sm font-medium">
                  {camera.status ? 'Online' : 'Offline'}
                </span>
              </div>
              {(camera.streamUrls || camera.stream_urls) && (
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