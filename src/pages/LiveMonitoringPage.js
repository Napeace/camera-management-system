import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import Sidebar from '../components/layout/Sidebar';
import cctvService from '../services/cctvService';
import HLSVideoPlayer from '../components/common/HLSVideoPlayer'; 
import LiveMonitoringModal from '../features/cctv/LiveMonitoringModal';
import CustomDVRSelect from '../components/common/CustomDVRSelect';
import { 
  VideoCameraIcon, 
  Squares2X2Icon
} from '@heroicons/react/24/outline';

const LiveMonitoringPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [selectedDVR, setSelectedDVR] = useState('');
  const [dvrGroups, setDvrGroups] = useState([]);
  const [cctvCameras, setCctvCameras] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingGroups, setLoadingGroups] = useState(true);
  const hasShownErrorRef = useRef(false);

  const [fullscreenCamera, setFullscreenCamera] = useState(null);
  const [gridLayout, setGridLayout] = useState('4x4');

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoadingGroups(true);
        hasShownErrorRef.current = false;
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
                // cctvService sudah map is_streaming ke status
                status: foundCamera.status,
                is_streaming: foundCamera.is_streaming,
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
          
          const transformedCameras = locationData.cameras.map(cam => {
            // cctvService sudah map is_streaming ke status
            const cameraData = {
              id: cam.cctv_id,
              name: cam.titik_letak,
              location: locationData.location_name,
              status: cam.status, // sudah di-map dari is_streaming di service
              is_streaming: cam.is_streaming,
              ip_address: cam.ip_address,
              dvr_group: selectedDVR,
              streamUrls: cam.stream_urls,
              stream_status: cam.stream_status
            };
            
            console.log('Camera data:', cameraData);
            return cameraData;
          });
          
          console.log('All transformed cameras:', transformedCameras);
          console.log('Online cameras:', transformedCameras.filter(c => c.status).length);
          console.log('Offline cameras:', transformedCameras.filter(c => !c.status).length);
          
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

  // Lock scroll when modal open
  useEffect(() => {
    if (fullscreenCamera) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, [fullscreenCamera]);

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
  const getGridClass = () => ({ 
    '2x2': 'grid-cols-1 md:grid-cols-2', 
    '3x3': 'grid-cols-2 md:grid-cols-3', 
    '4x4': 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4' 
  }[gridLayout] || 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4');
  
  const getMaxCameras = () => ({ '2x2': 4, '3x3': 9, '4x4': 16 }[gridLayout] || 16);

  // --- Sub-Components ---
  const CameraFeedPlaceholder = ({ camera, onClick, isSmall = false }) => (
    <div 
      className="bg-gray-100 dark:bg-gray-900 rounded-xl overflow-hidden cursor-pointer hover:ring-2 hover:ring-blue-500 dark:hover:ring-blue-400 transition-all aspect-video shadow-sm hover:shadow-md"
      onClick={() => onClick(camera)}
    >
      <div className="h-full flex flex-col">
        <div className="flex-1 bg-black relative">
          {camera.status && camera.streamUrls ? (
            <HLSVideoPlayer 
              streamUrls={camera.streamUrls} 
              cameraName={camera.name} 
              className="w-full h-full" 
              controls={false} 
              muted={true} 
            />
          ) : camera.status ? (
            <div className="w-full h-full flex flex-col items-center justify-center text-white">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mb-2"></div>
              <p className="text-sm">Loading stream...</p>
            </div>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-gray-500">
              <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
              <p className="text-sm">Offline</p>
            </div>
          )}
        </div>
        <div className="bg-white dark:bg-gray-800 p-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{camera.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{camera.location}</p>
            </div>
            <div className="flex items-center space-x-2 ml-2">
              {camera.status && camera.streamUrls && (
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                </div>
              )}
              <div className={`w-2 h-2 rounded-full ${camera.status ? 'bg-green-500' : 'bg-red-500'}`}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const LiveMonitoringContent = () => (
    <div className="space-y-6">

      {/* Filter Section */}
      <div className="bg-white dark:bg-slate-900/70 backdrop-blur-sm p-6 rounded-xl border border-gray-300 dark:border-slate-700/50 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

          {/* Kiri: DVR Select + Status */}
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <VideoCameraIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              DVR Group:
            </label>
            
            <CustomDVRSelect
              value={selectedDVR}
              onChange={handleDVRChange}
              disabled={loadingGroups}
              dvrGroups={dvrGroups}
              loading={loadingGroups}
            />

            {selectedDVR && (
              <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-2 bg-gray-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg">
                  <span className="font-medium text-gray-900 dark:text-white">{cctvCameras.length}</span>
                  <span>kamera</span>
                </div>
                <div className="flex items-center gap-2 bg-green-100 dark:bg-green-900/30 px-3 py-1.5 rounded-lg">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="font-medium text-green-800 dark:text-green-400">{cctvCameras.filter(c => c.status).length}</span>
                  <span className="text-green-700 dark:text-green-300">online</span>
                </div>
                <div className="flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 px-3 py-1.5 rounded-lg">
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                  <span className="font-medium text-blue-800 dark:text-blue-400">{cctvCameras.filter(c => c.streamUrls).length}</span>
                  <span className="text-blue-700 dark:text-blue-300">streaming</span>
                </div>
              </div>
            )}
          </div>

          {/* Kanan: Grid Layout Selector */}
          <div className="flex items-center space-x-2 bg-gray-100 dark:bg-slate-800/70 rounded-lg p-1 border border-gray-300 dark:border-slate-700">
            <Squares2X2Icon className="w-5 h-5 text-gray-600 dark:text-gray-400 ml-2" />
            {['2x2', '3x3', '4x4'].map(layout => (
              <button 
                key={layout} 
                onClick={() => handleGridLayoutChange(layout)} 
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                  gridLayout === layout 
                    ? 'bg-blue-600 text-white shadow-sm' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700'
                }`}
              >
                {layout}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content Area */}
      {loadingGroups ? (
        <div className="flex flex-col items-center justify-center h-96 bg-white dark:bg-slate-900/70 rounded-xl border border-gray-300 dark:border-slate-700/50">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading DVR groups...</p>
        </div>
      ) : loading ? (
        <div className="flex flex-col items-center justify-center h-96 bg-white dark:bg-slate-900/70 rounded-xl border border-gray-300 dark:border-slate-700/50">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading cameras...</p>
        </div>
      ) : !selectedDVR ? (
        <div className="text-center py-20 bg-white dark:bg-slate-900/70 rounded-xl border border-gray-300 dark:border-slate-700/50">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
              <VideoCameraIcon className="w-8 h-8 text-gray-400 dark:text-gray-500" />
            </div>
            <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">Pilih DVR Group</p>
            <p className="text-gray-600 dark:text-gray-400">Pilih DVR Group untuk melihat kamera yang tersedia</p>
          </div>
        </div>
      ) : cctvCameras.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-slate-900/70 rounded-xl border border-gray-300 dark:border-slate-700/50">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
              <VideoCameraIcon className="w-8 h-8 text-gray-400 dark:text-gray-500" />
            </div>
            <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">Tidak Ada Kamera</p>
            <p className="text-gray-600 dark:text-gray-400">Belum ada kamera yang terdaftar di DVR Group ini</p>
          </div>
        </div>
      ) : (
        <>
          <div className={`grid ${getGridClass()} gap-4`}>
            {cctvCameras.slice(0, getMaxCameras()).map((camera) => (
              <CameraFeedPlaceholder 
                key={camera.id} 
                camera={camera} 
                onClick={handleCameraClick} 
                isSmall={gridLayout === '4x4'} 
              />
            ))}
            {Array.from({ length: Math.max(0, getMaxCameras() - cctvCameras.length) }).map((_, index) => (
              <div 
                key={`empty-${index}`} 
                className="bg-gray-100 dark:bg-gray-800/50 rounded-xl aspect-video flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-700"
              >
                <p className="text-gray-400 dark:text-gray-500 text-sm">Slot Kosong</p>
              </div>
            ))}
          </div>
          
          {cctvCameras.length > getMaxCameras() && (
            <div className="text-center text-sm bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
              Menampilkan {getMaxCameras()} dari {cctvCameras.length} kamera. Gunakan layout yang lebih besar untuk melihat lebih banyak kamera.
            </div>
          )}
        </>
      )}
    </div>
  );

  return (
    <>
      <MainLayout 
        Sidebar={(props) => (
          <Sidebar 
            {...props} 
            onPageChange={handlePageChange} 
            />
          )}
          navbarTitle="Live Monitoring"
          navbarSubtitle="Monitor kamera keamanan secara real-time"
      >
        <LiveMonitoringContent />
      </MainLayout>

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