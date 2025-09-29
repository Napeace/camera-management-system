import React from 'react';
import HLSVideoPlayer from '../../components/common/HLSVideoPlayer';

const LiveMonitoringModal = ({ camera, onClose }) => {
  if (!camera) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center p-4">
      
      {/* Container utama modal, kita atur tingginya agar tidak melebihi layar */}
      <div className="relative w-full max-w-6xl bg-gray-900 rounded-lg flex flex-col max-h-full overflow-hidden">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 z-10 bg-black bg-opacity-70 text-white p-3 rounded-full hover:bg-opacity-90 transition-all"
          aria-label="Tutup"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        {/* ================================================================= */}
        {/* == PERUBAHAN DI SINI: Area Video dibuat 80% dari tinggi modal == */}
        {/* ================================================================= */}
        <div className="h-4/5 bg-black relative">
          {camera.streamUrls ? (
            <HLSVideoPlayer
              streamUrls={camera.streamUrls}
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
        
        {/* ================================================================= */}
        {/* == PERUBAHAN DI SINI: Area Info dibuat 20% dari tinggi modal  == */}
        {/* ================================================================= */}
        <div className="h-1/5 bg-gray-800 p-4 rounded-b-lg flex items-center">
          <div className="w-full flex justify-between items-center">
            {/* Kolom Kiri: Detail Teks */}
            <div>
              <h3 className="text-lg font-medium text-white">{camera.name}</h3>
              <p className="text-gray-400">{camera.location}</p>
              <p className="text-sm text-gray-500 mt-1">IP Address: {camera.ip_address}</p>
            </div>

            {/* Kolom Kanan: Indikator Status */}
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${camera.status ? 'bg-green-400' : 'bg-red-400'}`}></div>
                <span className="text-gray-300">
                  {camera.status ? 'Online' : 'Offline'}
                </span>
              </div>
              {camera.streamUrls && (
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                  <span className="font-medium text-red-400">LIVE</span>
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