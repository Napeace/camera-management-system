import React, { useState, useEffect } from 'react';

const CCTVLiveMonitoring = () => {
  const [cctvData, setCctvData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCamera, setSelectedCamera] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Mock CCTV data with 16 cameras
  useEffect(() => {
    const mockCCTVData = [
      { id: 1, name: 'Lobby Utama', location: 'Lantai 1', status: 'online', ip: '192.168.1.101' },
      { id: 2, name: 'IGD Emergency', location: 'Lantai 1', status: 'online', ip: '192.168.1.102' },
      { id: 3, name: 'Area Parkir', location: 'Outdoor', status: 'offline', ip: '192.168.1.103' },
      { id: 4, name: 'ICU Ward', location: 'Lantai 2', status: 'online', ip: '192.168.1.104' },
      { id: 5, name: 'Pintu Masuk', location: 'Lantai 1', status: 'offline', ip: '192.168.1.105' },
      { id: 6, name: 'Apotek', location: 'Lantai 1', status: 'online', ip: '192.168.1.106' },
      { id: 7, name: 'Ruang Operasi', location: 'Lantai 2', status: 'online', ip: '192.168.1.107' },
      { id: 8, name: 'Koridor Lt. 2', location: 'Lantai 2', status: 'offline', ip: '192.168.1.108' },
      { id: 9, name: 'Ruang VIP', location: 'Lantai 3', status: 'online', ip: '192.168.1.109' },
      { id: 10, name: 'Cafeteria', location: 'Lantai 1', status: 'online', ip: '192.168.1.110' },
      { id: 11, name: 'Lab Patologi', location: 'Lantai B1', status: 'online', ip: '192.168.1.111' },
      { id: 12, name: 'Radiologi', location: 'Lantai 1', status: 'online', ip: '192.168.1.112' },
      { id: 13, name: 'Koridor Lt. 3', location: 'Lantai 3', status: 'online', ip: '192.168.1.113' },
      { id: 14, name: 'Ruang Tunggu', location: 'Lantai 2', status: 'offline', ip: '192.168.1.114' },
      { id: 15, name: 'Tangga Darurat', location: 'Multi Floor', status: 'online', ip: '192.168.1.115' },
      { id: 16, name: 'Pos Security', location: 'Lantai 1', status: 'online', ip: '192.168.1.116' }
    ];

    // Simulate loading
    setTimeout(() => {
      setCctvData(mockCCTVData);
      setLoading(false);
    }, 1500);
  }, []);

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleCameraClick = (camera) => {
    if (camera.status === 'online') {
      setSelectedCamera(camera);
    }
  };

  const handleFullscreen = (camera) => {
    if (camera.status === 'online') {
      setSelectedCamera(camera);
      setIsFullscreen(true);
    }
  };

  const closeModal = () => {
    setSelectedCamera(null);
    setIsFullscreen(false);
  };

  const getStatusColor = (status) => {
    return status === 'online' ? 'text-green-500' : 'text-red-500';
  };

  const getStatusBg = (status) => {
    return status === 'online' ? 'bg-green-500' : 'bg-red-500';
  };

  // Camera placeholder component
  const CameraPlaceholder = ({ camera }) => {
    const isOnline = camera.status === 'online';
    
    return (
      <div 
        className={`relative bg-black rounded-lg overflow-hidden border-2 ${
          isOnline ? 'border-green-500 cursor-pointer hover:border-green-400' : 'border-red-500'
        } transition-all duration-200`}
        onClick={() => handleCameraClick(camera)}
      >
        {/* Status indicator */}
        <div className={`absolute top-2 left-2 z-10 w-3 h-3 ${getStatusBg(camera.status)} rounded-full animate-pulse`}></div>
        
        {/* Camera info */}
        <div className="absolute top-2 right-2 z-10">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              handleFullscreen(camera);
            }}
            className={`p-1 rounded ${isOnline ? 'text-white hover:bg-white/20' : 'text-gray-500'}`}
            disabled={!isOnline}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
          </button>
        </div>

        {/* Video placeholder */}
        <div className="aspect-video flex items-center justify-center">
          {isOnline ? (
            <div className="relative w-full h-full bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900">
              {/* Simulated video noise */}
              <div className="absolute inset-0 opacity-20">
                <div className="w-full h-full bg-black animate-pulse"></div>
              </div>
              {/* Camera icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <svg className="w-12 h-12 text-green-400 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              {/* Live indicator */}
              <div className="absolute bottom-2 left-2 flex items-center space-x-1">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-white font-medium">LIVE</span>
              </div>
            </div>
          ) : (
            <div className="relative w-full h-full bg-gray-900 flex items-center justify-center">
              <div className="text-center">
                <svg className="w-12 h-12 text-gray-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                </svg>
                <p className="text-xs text-gray-500">OFFLINE</p>
              </div>
            </div>
          )}
        </div>

        {/* Camera label */}
        <div className="absolute bottom-0 left-0 right-0 bg-black/80 text-white p-2">
          <p className="text-sm font-medium truncate">{camera.name}</p>
          <div className="flex justify-between items-center">
            <p className="text-xs text-gray-300 truncate">{camera.location}</p>
            <p className={`text-xs font-medium ${getStatusColor(camera.status)}`}>
              {camera.status.toUpperCase()}
            </p>
          </div>
        </div>
      </div>
    );
  };

  // Statistics
  const onlineCameras = cctvData.filter(camera => camera.status === 'online').length;
  const offlineCameras = cctvData.filter(camera => camera.status === 'offline').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading CCTV Feeds...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Live CCTV Monitoring</h1>
            <p className="text-gray-600">Real-time monitoring dari seluruh kamera keamanan rumah sakit</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-semibold text-gray-900">
              {currentTime.toLocaleTimeString('id-ID')}
            </p>
            <p className="text-sm text-gray-600">
              {currentTime.toLocaleDateString('id-ID', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg mr-3">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Cameras</p>
                <p className="text-xl font-bold text-gray-900">{cctvData.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-lg mr-3">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Online</p>
                <p className="text-xl font-bold text-green-600">{onlineCameras}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="flex items-center justify-center w-10 h-10 bg-red-100 rounded-lg mr-3">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Offline</p>
                <p className="text-xl font-bold text-red-600">{offlineCameras}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="flex items-center justify-center w-10 h-10 bg-purple-100 rounded-lg mr-3">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Uptime</p>
                <p className="text-xl font-bold text-purple-600">{Math.round((onlineCameras/cctvData.length)*100)}%</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CCTV Grid */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {cctvData.map((camera) => (
          <CameraPlaceholder key={camera.id} camera={camera} />
        ))}
      </div>

      {/* Modal for selected camera */}
      {selectedCamera && (
        <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 ${isFullscreen ? 'bg-opacity-90' : ''}`}>
          <div className={`bg-white rounded-lg overflow-hidden ${isFullscreen ? 'w-full h-full' : 'max-w-4xl w-full max-h-[90vh]'}`}>
            {/* Modal Header */}
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{selectedCamera.name}</h3>
                <p className="text-sm text-gray-600">{selectedCamera.location} • {selectedCamera.ip}</p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isFullscreen ? "M6 18L18 6M6 6l12 12" : "M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"} />
                  </svg>
                </button>
                <button
                  onClick={closeModal}
                  className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className={`bg-black flex items-center justify-center ${isFullscreen ? 'h-full' : 'aspect-video'}`}>
              <div className="relative w-full h-full bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900">
                {/* Simulated video content */}
                <div className="absolute inset-0 opacity-30">
                  <div className="w-full h-full bg-black animate-pulse"></div>
                </div>
                
                {/* Large camera icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <svg className="w-24 h-24 text-green-400 opacity-60 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <p className="text-white text-lg font-semibold">Live Feed - {selectedCamera.name}</p>
                    <p className="text-green-400 text-sm">Recording • HD Quality</p>
                  </div>
                </div>

                {/* Live indicator */}
                <div className="absolute top-4 left-4 flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-white font-medium">LIVE</span>
                </div>

                {/* Timestamp */}
                <div className="absolute bottom-4 right-4 text-white bg-black/50 px-3 py-1 rounded">
                  {currentTime.toLocaleString('id-ID')}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CCTVLiveMonitoring;