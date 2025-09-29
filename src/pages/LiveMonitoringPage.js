import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import Sidebar from '../components/layout/Sidebar';
import cctvService from '../services/cctvService';
import HLSVideoPlayer from '../components/common/HLSVideoPlayer'; 
import LiveMonitoringModal from '../features/cctv/LiveMonitoringModal'; // 1. Import komponen modal baru

const LiveMonitoringPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [selectedDVR, setSelectedDVR] = useState('');
  const [dvrGroups, setDvrGroups] = useState([]);
  const [cctvCameras, setCctvCameras] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingGroups, setLoadingGroups] = useState(true);

  const [fullscreenCamera, setFullscreenCamera] = useState(null);
  const [gridLayout, setGridLayout] = useState('4x4');

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoadingGroups(true);
        const groups = await cctvService.getDVRGroups();
        setDvrGroups(groups);

        const cameraIdFromUrl = searchParams.get('camera');
        if (cameraIdFromUrl) {
          const allCctvResult = await cctvService.getAllCCTV();
          const allCctv = allCctvResult.data;
          const foundCamera = allCctv.find(c => c.id_cctv?.toString() === cameraIdFromUrl);
          
          if (foundCamera) {
            const cameraGroup = groups.find(group => group.id === foundCamera.id_location);
            if (cameraGroup) {
              setSelectedDVR(cameraGroup.id.toString());
              setFullscreenCamera({
                id: foundCamera.id_cctv,
                name: foundCamera.titik_letak,
                location: foundCamera.location_name || 'Unknown Location',
                status: foundCamera.status,
                ip_address: foundCamera.ip_address
              });
            }
          }
        } else if (groups.length > 0) {
          setSelectedDVR(groups[0].id.toString());
        }
      } catch (error) {
        console.error('Error loading initial data:', error);
        setDvrGroups([]);
      } finally {
        setLoadingGroups(false);
      }
    };
    loadInitialData();
  }, [searchParams]);
  
  // Load streams for selected DVR
  useEffect(() => {
    const loadStreamsForDVR = async () => {
      if (selectedDVR && !loadingGroups) {
        try {
          setLoading(true);
          setCctvCameras([]);
          const locationData = await cctvService.getStreamsByLocation(selectedDVR);
          const transformedCameras = locationData.cameras.map(cam => ({
            id: cam.cctv_id,
            name: cam.titik_letak,
            location: locationData.location_name,
            status: cam.is_streaming, 
            ip_address: cam.ip_address,
            dvr_group: selectedDVR,
            streamUrls: cam.stream_urls
          }));
          setCctvCameras(transformedCameras);
        } catch (error) {
          console.error('Error loading streams for DVR:', error);
          setCctvCameras([]);
        } finally {
          setLoading(false);
        }
      }
    };
    loadStreamsForDVR();
  }, [selectedDVR, loadingGroups]);


  // =================================================================
  // == PERBAIKAN SCROLL: Mengunci scroll background saat modal terbuka ==
  // =================================================================
  useEffect(() => {
    if (fullscreenCamera) {
      // Saat modal terbuka, tambahkan class ke body untuk mencegah scroll
      document.body.classList.add('overflow-hidden');
    } else {
      // Saat modal tertutup, hapus class tersebut
      document.body.classList.remove('overflow-hidden');
    }

    // Cleanup function untuk memastikan class dihapus saat komponen unmount
    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, [fullscreenCamera]);
  // =================================================================


  // --- Handlers ---
  const handlePageChange = (pageId, path) => navigate(path);
  const handleDVRChange = (e) => {
    setSelectedDVR(e.target.value);
    setFullscreenCamera(null);
  };
  const handleCameraClick = (camera) => {
    if (!camera.status) {
      alert('Kamera sedang offline atau stream belum siap.');
      return;
    }
    setFullscreenCamera(camera);
  };
  const handleCloseFullscreen = () => setFullscreenCamera(null);
  const handleGridLayoutChange = (layout) => setGridLayout(layout);

  // --- Helper Functions ---
  const getGridClass = () => ({ '2x2': 'grid-cols-2', '3x3': 'grid-cols-3', '4x4': 'grid-cols-4' }[gridLayout] || 'grid-cols-4');
  const getMaxCameras = () => ({ '2x2': 4, '3x3': 9, '4x4': 16 }[gridLayout] || 16);

  // --- Sub-Components ---
  const CameraFeedPlaceholder = ({ camera, onClick, isSmall = false }) => (
    <div 
      className="bg-gray-900 rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all aspect-video"
      onClick={() => onClick(camera)}
    >
      <div className="h-full flex flex-col">
        <div className="flex-1 bg-black relative">
          {camera.status && camera.streamUrls ? (
            <HLSVideoPlayer streamUrls={camera.streamUrls} cameraName={camera.name} className="w-full h-full" controls={false} muted={true} />
          ) : camera.status ? (
            <div className="w-full h-full flex items-center justify-center text-white">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mx-auto mb-2"></div><p className="text-xs">Loading stream...</p>
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-500">
              <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636" /></svg><p className="text-xs">Offline</p>
            </div>
          )}
        </div>
        <div className="bg-gray-800 p-2">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className={`${isSmall ? 'text-xs' : 'text-sm'} font-medium text-white truncate`}>{camera.name}</p>
              <p className={`${isSmall ? 'text-xs' : 'text-xs'} text-gray-400 truncate`}>{camera.location}</p>
            </div>
            <div className="flex items-center space-x-1">
              {camera.status && camera.streamUrls && <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div>}
              <div className={`w-2 h-2 rounded-full ${camera.status ? 'bg-green-400' : 'bg-red-400'}`}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const LiveMonitoringContent = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Live Monitoring</h1>
          <p className="text-gray-600 mt-1">Monitor kamera keamanan secara real-time</p>
        </div>
        <div className="flex items-center space-x-3 bg-gray-100 rounded-lg p-1">
          {['2x2', '3x3', '4x4'].map(layout => (
             <button key={layout} onClick={() => handleGridLayoutChange(layout)} className={`px-3 py-1 text-sm rounded ${gridLayout === layout ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-200'}`}>{layout}</button>
          ))}
        </div>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700">Filter DVR Group:</label>
          <select value={selectedDVR} onChange={handleDVRChange} disabled={loadingGroups} className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50">
            <option value="">{loadingGroups ? 'Loading groups...' : 'Pilih DVR Group'}</option>
            {dvrGroups.map((group) => <option key={group.id} value={group.id}>{group.name}</option>)}
          </select>
          {selectedDVR && (
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span>{cctvCameras.length} kamera ditemukan</span><span>•</span>
              <span>{cctvCameras.filter(c => c.status).length} online</span><span>•</span>
              <span>{cctvCameras.filter(c => c.streamUrls).length} streaming</span>
            </div>
          )}
        </div>
      </div>
      {loadingGroups ? (
        <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div><p className="text-gray-600 mt-2">Loading DVR groups...</p></div>
      ) : loading ? (
        <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div><p className="text-gray-600 mt-2">Loading cameras...</p></div>
      ) : !selectedDVR ? (
        <div className="text-center py-12"><svg className="w-12 h-12 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 002 2v8a2 2 0 002 2z" /></svg><p className="text-gray-600">Pilih DVR Group untuk melihat kamera</p></div>
      ) : (
        <div className={`grid ${getGridClass()} gap-4`}>
          {cctvCameras.slice(0, getMaxCameras()).map((camera) => <CameraFeedPlaceholder key={camera.id} camera={camera} onClick={handleCameraClick} isSmall={gridLayout === '4x4'} />)}
          {Array.from({ length: Math.max(0, getMaxCameras() - cctvCameras.length) }).map((_, index) => <div key={`empty-${index}`} className="bg-gray-200 rounded-lg aspect-video flex items-center justify-center"><p className="text-gray-400 text-sm">Slot Kosong</p></div>)}
        </div>
      )}
      {cctvCameras.length > getMaxCameras() && <div className="text-center text-sm text-gray-600 bg-yellow-50 p-3 rounded-lg border border-yellow-200">Menampilkan {getMaxCameras()} dari {cctvCameras.length} kamera. Gunakan layout yang lebih besar untuk melihat lebih banyak kamera.</div>}
    </div>
  );

  return (
    <>
      <MainLayout Sidebar={(props) => <Sidebar {...props} onPageChange={handlePageChange} />}>
        <LiveMonitoringContent />
      </MainLayout>

      {/* 2. Ganti pemanggilan modal lama dengan komponen baru */}
      {fullscreenCamera && (
        <LiveMonitoringModal 
          camera={fullscreenCamera} 
          onClose={handleCloseFullscreen} 
        />
      )}
    </>
  );
};

export default LiveMonitoringPage;