import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // Asumsi path ini benar
import MainLayout from '../components/layout/MainLayout';
import Sidebar from '../components/layout/Sidebar';
import cctvService from '../services/cctvService';

const LiveMonitoringPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // DIUBAH KEMBALI: State menggunakan DVR Group, bukan location
  const [selectedDVR, setSelectedDVR] = useState('');
  const [dvrGroups, setDvrGroups] = useState([]);
  const [cctvCameras, setCctvCameras] = useState([]);
  const [loading, setLoading] = useState(false);

  // State untuk UI
  const [fullscreenCamera, setFullscreenCamera] = useState(null);
  const [gridLayout, setGridLayout] = useState('4x4'); // Pilihan: 4x4, 3x3, 2x2

  // DIUBAH: Muat data berdasarkan DVR Group
  useEffect(() => {
    const groups = cctvService.getDVRGroups();
    setDvrGroups(groups);

    const cameraIdFromUrl = searchParams.get('camera');
    if (cameraIdFromUrl) {
      const allCctv = cctvService.getAllCCTV().data;
      const foundCamera = allCctv.find(c => c.id.toString() === cameraIdFromUrl);
      if (foundCamera) {
        setSelectedDVR(foundCamera.dvr_group);
        setFullscreenCamera(foundCamera);
      }
    } else if (groups.length > 0) {
      setSelectedDVR(groups[0]);
    }
  }, [searchParams]);

  // Muat kamera setiap kali DVR yang dipilih berubah
  useEffect(() => {
    if (selectedDVR) {
      setLoading(true);
      const result = cctvService.getCCTVByDVRGroup(selectedDVR);
      setCctvCameras(result.data);
      setLoading(false);
    }
  }, [selectedDVR]);

  // --- Handlers ---

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
      window.location.href = '/login';
    }
  };

  const handlePageChange = (pageId, path) => {
    navigate(path);
  };

  const handleDVRChange = (e) => {
    setSelectedDVR(e.target.value);
    setFullscreenCamera(null); // Tutup fullscreen saat ganti DVR
  };

  const handleCameraClick = (camera) => {
    if (camera.status) {
      setFullscreenCamera(camera);
    } else {
      alert('Kamera sedang offline');
    }
  };

  const handleCloseFullscreen = () => {
    setFullscreenCamera(null);
  };

  const handleGridLayoutChange = (layout) => {
    setGridLayout(layout);
  };

  // --- Helper Functions ---

  const getGridClass = () => {
    switch (gridLayout) {
      case '2x2': return 'grid-cols-2';
      case '3x3': return 'grid-cols-3';
      case '4x4': return 'grid-cols-4';
      default: return 'grid-cols-4';
    }
  };

  const getMaxCameras = () => {
    switch (gridLayout) {
      case '2x2': return 4;
      case '3x3': return 9;
      case '4x4': return 16;
      default: return 16;
    }
  };

  // --- Sub-Components ---

  const CameraFeedPlaceholder = ({ camera, onClick, isSmall = false }) => (
    <div 
      className={`bg-gray-900 rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all aspect-video`}
      onClick={() => onClick(camera)}
    >
      <div className="h-full flex flex-col">
        {/* Placeholder Video */}
        <div className="flex-1 bg-black flex items-center justify-center">
          {camera.status ? (
            <div className="text-center text-white">
              <svg className="w-12 h-12 mx-auto text-gray-400 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <p className="text-xs text-gray-400 mt-2">Loading...</p>
            </div>
          ) : (
            <div className="text-center text-gray-500">
              <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
              <p className="text-xs">Offline</p>
            </div>
          )}
        </div>
        
        {/* Info Kamera */}
        <div className="bg-gray-800 p-2">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className={`${isSmall ? 'text-xs' : 'text-sm'} font-medium text-white truncate`}>
                {camera.name}
              </p>
              <p className={`${isSmall ? 'text-xs' : 'text-xs'} text-gray-400 truncate`}>
                {camera.location}
              </p>
            </div>
            <div className={`w-2 h-2 rounded-full ml-2 ${camera.status ? 'bg-green-400' : 'bg-red-400'}`}></div>
          </div>
        </div>
      </div>
    </div>
  );

  const LiveMonitoringContent = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Live Monitoring</h1>
          <p className="text-gray-600 mt-1">Monitor kamera keamanan secara real-time</p>
        </div>
        <div className="flex items-center space-x-3 bg-gray-100 rounded-lg p-1">
          {['2x2', '3x3', '4x4'].map(layout => (
             <button
                key={layout}
                onClick={() => handleGridLayoutChange(layout)}
                className={`px-3 py-1 text-sm rounded ${gridLayout === layout ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-200'}`}
             >
               {layout}
             </button>
          ))}
        </div>
      </div>

      {/* Filter DVR Group */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700">Filter DVR Group:</label>
          <select value={selectedDVR} onChange={handleDVRChange} className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500">
            <option value="">Pilih DVR Group</option>
            {dvrGroups.map((group) => (
              <option key={group} value={group}>{group}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid Kamera */}
      {loading ? (
        <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>
      ) : (
        <div className={`grid ${getGridClass()} gap-4`}>
          {cctvCameras.slice(0, getMaxCameras()).map((camera) => (
            <CameraFeedPlaceholder key={camera.id} camera={camera} onClick={handleCameraClick} isSmall={gridLayout === '4x4'}/>
          ))}
          {/* Slot Kosong */}
          {Array.from({ length: Math.max(0, getMaxCameras() - cctvCameras.length) }).map((_, index) => (
            <div key={`empty-${index}`} className="bg-gray-200 rounded-lg aspect-video flex items-center justify-center">
              <p className="text-gray-400 text-sm">Slot Kosong</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
  
  const FullscreenModal = () => {
    if (!fullscreenCamera) return null;
    return (
      <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
        <div className="relative w-full h-full max-w-6xl">
          <button onClick={handleCloseFullscreen} className="absolute top-2 right-2 z-10 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
          <div className="bg-gray-900 rounded-lg h-full flex flex-col">
            <div className="flex-1 bg-black rounded-t-lg flex items-center justify-center text-white">
              {/* Di sini nanti letak player video HLS.js */}
              Placeholder untuk Live Feed #{fullscreenCamera.id}
            </div>
            <div className="bg-gray-800 p-4 rounded-b-lg">
                <h3 className="text-lg font-medium text-white">{fullscreenCamera.name}</h3>
                <p className="text-gray-400">{fullscreenCamera.location}</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <MainLayout 
        user={user} 
        Sidebar={(props) => (
          <Sidebar 
            {...props}
            user={user}
            onLogout={handleLogout}
            onPageChange={handlePageChange}
          />
        )}
      >
        <LiveMonitoringContent />
      </MainLayout>
      <FullscreenModal />
    </>
  );
};

export default LiveMonitoringPage;

