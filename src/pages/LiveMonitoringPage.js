import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import Sidebar from '../components/layout/Sidebar';
import cctvService from '../services/cctvService';
import HLSVideoPlayer from '../components/common/HLSVideoPlayer'; 
import LiveMonitoringModal from '../features/cctv/LiveMonitoringModal';
import CustomStatusSelect from '../components/common/CustomStatusSelect';
import CustomLocationSelect from '../components/common/CustomLocationSelect';
import Pagination from '../components/common/Pagination';
import { VideoCameraIcon } from '@heroicons/react/24/outline';

const LiveMonitoringPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [cctvCameras, setCctvCameras] = useState([]);
  const [allCctvData, setAllCctvData] = useState([]);
  const [locationGroups, setLocationGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingGroups, setLoadingGroups] = useState(true);
  const hasShownErrorRef = useRef(false);

  const [fullscreenCamera, setFullscreenCamera] = useState(null);
  const [gridLayout, setGridLayout] = useState('auto');
  
  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  // Load initial data - locations and handle URL camera
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoadingGroups(true);
        hasShownErrorRef.current = false;
        
        const groups = await cctvService.getLocationGroups();
        setLocationGroups(groups);

        // Handle camera from URL
        const cameraIdFromUrl = searchParams.get('camera');
        if (cameraIdFromUrl) {
          const allCctvResult = await cctvService.getAllCCTV();
          const allCctv = allCctvResult.data;
          const foundCamera = allCctv.find(c => c.id_cctv?.toString() === cameraIdFromUrl);
          
          if (foundCamera) {
            // Format data kamera dengan lengkap
            setFullscreenCamera({
              id: foundCamera.id_cctv,
              name: foundCamera.titik_letak,
              location: foundCamera.location_name || 'Unknown Location',
              ip_address: foundCamera.ip_address,
              status: foundCamera.is_streaming,
              streamUrls: foundCamera.stream_urls
            });
          }
        } else if (groups.length > 0) {
          // Auto-select first location on initial load
          setLocationFilter(groups[0].id_location.toString());
        }
      } catch (error) {
        console.error('Error loading initial data:', error);
        setLocationGroups([]);
      } finally {
        setLoadingGroups(false);
      }
    };
    loadInitialData();
  }, [searchParams]);

  // Load streams for selected location
  useEffect(() => {
    const loadStreamsForLocation = async () => {
      if (locationFilter && !loadingGroups) {
        try {
          setLoading(true);
          setAllCctvData([]);
          
          const locationData = await cctvService.getStreamsByLocation(locationFilter);
          
          const transformedCameras = locationData.cameras.map(cam => ({
            id: cam.cctv_id,
            id_cctv: cam.cctv_id,
            name: cam.titik_letak,
            titik_letak: cam.titik_letak,
            location: locationData.location_name,
            location_name: locationData.location_name,
            is_streaming: cam.is_streaming,
            ip_address: cam.ip_address,
            id_location: locationFilter,
            streamUrls: cam.stream_urls,
            stream_urls: cam.stream_urls,
            stream_status: cam.stream_status
          }));
          
          console.log('Transformed cameras:', transformedCameras);
          console.log('Online cameras:', transformedCameras.filter(c => c.is_streaming).length);
          console.log('Offline cameras:', transformedCameras.filter(c => !c.is_streaming).length);
          
          setAllCctvData(transformedCameras);
          setCurrentPage(1); // Reset ke halaman 1 saat ganti lokasi
        } catch (error) {
          console.error('Error loading streams for location:', error);
          setAllCctvData([]);
        } finally {
          setLoading(false);
        }
      }
    };
    loadStreamsForLocation();
  }, [locationFilter, loadingGroups]);

  // Filter cameras by status (frontend filtering)
  useEffect(() => {
    let filtered = [...allCctvData];

    // Filter by status
    if (statusFilter) {
      const isOnline = statusFilter === 'online';
      filtered = filtered.filter(cctv => cctv.is_streaming === isOnline);
    }

    setCctvCameras(filtered);
    setCurrentPage(1); // Reset ke halaman 1 saat filter berubah
  }, [allCctvData, statusFilter]);

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

  // Calculate statistics from ALL cameras across all locations
  const [allStats, setAllStats] = useState({ total: 0, online: 0, offline: 0 });

  useEffect(() => {
    const calculateAllStats = async () => {
      try {
        const allCctvResult = await cctvService.getAllCCTV();
        const allCctv = allCctvResult.data || [];
        setAllStats({
          total: allCctv.length,
          online: allCctv.filter(c => c.is_streaming).length,
          offline: allCctv.filter(c => !c.is_streaming).length
        });
      } catch (error) {
        console.error('Error calculating stats:', error);
      }
    };
    
    if (!loadingGroups) {
      calculateAllStats();
    }
  }, [loadingGroups]);

  // --- Handlers ---
  const handlePageChange = (pageId, path) => navigate(path);
  const handleStatusFilter = (e) => setStatusFilter(e.target.value);
  const handleLocationFilter = (e) => setLocationFilter(e.target.value);
  const handleCameraClick = (camera) => {
    if (!camera.is_streaming) {
      alert('Kamera sedang offline atau stream belum siap.');
      return;
    }
    
    // Pastikan semua data lengkap saat dikirim ke modal
    setFullscreenCamera({
      id: camera.id,
      name: camera.name || camera.titik_letak,
      location: camera.location || camera.location_name,
      ip_address: camera.ip_address,
      status: camera.is_streaming,
      streamUrls: camera.streamUrls || camera.stream_urls
    });
  };
  const handleCloseFullscreen = () => setFullscreenCamera(null);
  const handleGridLayoutChange = (layout) => {
    setGridLayout(layout);
    setCurrentPage(1); // Reset ke halaman 1 saat layout berubah
  };
  const handlePaginationChange = (page) => setCurrentPage(page);

  // --- Helper Functions ---
  const getAutoGridLayout = () => {
    const totalCameras = cctvCameras.length;
    if (totalCameras < 5) return '2x2';
    if (totalCameras < 10) return '3x3';
    return '4x4';
  };

  const getGridClass = () => {
    const layout = gridLayout === 'auto' ? getAutoGridLayout() : gridLayout;
    return { 
      '2x2': 'grid-cols-1 md:grid-cols-2', 
      '3x3': 'grid-cols-2 md:grid-cols-3', 
      '4x4': 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4' 
    }[layout] || 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4';
  };
  
  const getItemsPerPage = () => {
    const layout = gridLayout === 'auto' ? getAutoGridLayout() : gridLayout;
    return { '2x2': 4, '3x3': 9, '4x4': 16 }[layout] || 16;
  };

  // Pagination calculations
  const itemsPerPage = getItemsPerPage();
  const totalPages = Math.ceil(cctvCameras.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCameras = cctvCameras.slice(startIndex, endIndex);

  // --- Sub-Components ---
  const CameraFeedPlaceholder = ({ camera, onClick, isSmall = false }) => (
    <div 
      className="bg-gray-100 dark:bg-gray-900 rounded-xl overflow-hidden cursor-pointer hover:ring-2 hover:ring-blue-500 dark:hover:ring-blue-400 transition-all aspect-video shadow-sm hover:shadow-md"
      onClick={() => onClick(camera)}
    >
      <div className="h-full flex flex-col">
        <div className="flex-1 bg-black relative">
          {camera.is_streaming && camera.streamUrls ? (
            <HLSVideoPlayer 
              streamUrls={camera.streamUrls} 
              cameraName={camera.name} 
              className="w-full h-full" 
              controls={false} 
              muted={true} 
            />
          ) : camera.is_streaming ? (
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
              {camera.is_streaming && camera.streamUrls && (
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                </div>
              )}
              <div className={`w-2 h-2 rounded-full ${camera.is_streaming ? 'bg-green-500' : 'bg-red-500'}`}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const LiveMonitoringContent = () => (
    <div className="space-y-6">
      {/* Filter Section with Grid Layout Buttons */}
      <div className="flex gap-4">
        {/* Filter Card */}
        <div className="flex-1 bg-white dark:bg-slate-900/70 backdrop-blur-sm p-6 rounded-xl border border-gray-300 dark:border-slate-700/50 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            {/* Info & Filters */}
            <div className="flex flex-col md:flex-row md:items-center gap-4 flex-1">
              {/* Static Info */}
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  CCTV RS. Citra Husada
                </label>
                <div className="flex flex-wrap items-center gap-3 text-sm">
                  {/* Total Card */}
                  <div className="relative overflow-hidden flex items-center gap-2 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm px-6 py-3 rounded-2xl border-2 border-indigo-500">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 via-indigo-500/10 to-transparent dark:from-indigo-900/30 dark:via-indigo-900/15 dark:to-transparent pointer-events-none"></div>
                    <span className="relative z-10 text-sm text-gray-900 dark:text-white">{allStats.total}</span>
                    <span className="relative z-10 text-sm text-gray-900 dark:text-white">Total</span>
                  </div>
                  {/* Online Card */}
                  <div className="relative overflow-hidden flex items-center gap-2 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm px-6 py-3 rounded-2xl border-2 border-green-500">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 via-green-500/10 to-transparent dark:from-green-900/30 dark:via-green-900/15 dark:to-transparent pointer-events-none"></div>
                    <span className="relative z-10 text-sm text-gray-900 dark:text-white">{allStats.online}</span>
                    <span className="relative z-10 text-sm text-gray-900 dark:text-white">Online</span>
                  </div>
                  {/* Offline Card */}
                  <div className="relative overflow-hidden flex items-center gap-2 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm px-6 py-3 rounded-2xl border-2 border-red-500">
                    <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 via-red-500/10 to-transparent dark:from-red-900/30 dark:via-red-900/15 dark:to-transparent pointer-events-none"></div>
                    <span className="relative z-10 text-sm text-gray-900 dark:text-white">{allStats.offline}</span>
                    <span className="relative z-10 text-sm text-gray-900 dark:text-white">Offline</span>
                  </div>
                </div>
              </div>

              {/* Filter Status */}
              <div className="flex-1 min-w-0">
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Pilih Status</label>
                <CustomStatusSelect 
                  value={statusFilter} 
                  onChange={handleStatusFilter} 
                  disabled={loading} 
                />
              </div>

              {/* Filter Lokasi */}
              <div className="flex-1 min-w-0">
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Pilih Lokasi</label>
                <CustomLocationSelect 
                  value={locationFilter} 
                  onChange={handleLocationFilter} 
                  disabled={loading} 
                  locations={locationGroups} 
                />
              </div>
            </div>
          </div>
        </div>

        {/* Grid Layout Buttons */}
        <div className="grid grid-cols-2 gap-2">
          {['auto', '2x2', '3x3', '4x4'].map(layout => (
            <button 
              key={layout} 
              onClick={() => handleGridLayoutChange(layout)} 
              className={`w-12 h-12 text-xs font-semibold rounded-xl transition-all ${
                gridLayout === layout 
                  ? 'bg-blue-600 text-white shadow-lg' 
                  : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 border border-gray-300 dark:border-slate-600'
              }`}
            >
              {layout === 'auto' ? 'Auto' : layout}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      {loadingGroups ? (
        <div className="flex flex-col items-center justify-center h-96 bg-white dark:bg-slate-900/70 rounded-xl border border-gray-300 dark:border-slate-700/50">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading locations...</p>
        </div>
      ) : loading ? (
        <div className="flex flex-col items-center justify-center h-96 bg-white dark:bg-slate-900/70 rounded-xl border border-gray-300 dark:border-slate-700/50">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading cameras...</p>
        </div>
      ) : !locationFilter ? (
        <div className="text-center py-20 bg-white dark:bg-slate-900/70 rounded-xl border border-gray-300 dark:border-slate-700/50">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
              <VideoCameraIcon className="w-8 h-8 text-gray-400 dark:text-gray-500" />
            </div>
            <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">Pilih Lokasi</p>
            <p className="text-gray-600 dark:text-gray-400">Pilih lokasi untuk melihat kamera yang tersedia</p>
          </div>
        </div>
      ) : cctvCameras.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-slate-900/70 rounded-xl border border-gray-300 dark:border-slate-700/50">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
              <VideoCameraIcon className="w-8 h-8 text-gray-400 dark:text-gray-500" />
            </div>
            <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">Tidak Ada Kamera</p>
            <p className="text-gray-600 dark:text-gray-400">
              {statusFilter 
                ? 'Tidak ada kamera yang sesuai dengan filter status'
                : 'Belum ada kamera yang terdaftar di lokasi ini'}
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900/70 rounded-xl border border-gray-300 dark:border-slate-700/50 overflow-hidden">
          {/* Grid Cameras */}
          <div className="p-4">
            <div className={`grid ${getGridClass()} gap-4`}>
              {paginatedCameras.map((camera) => (
                <CameraFeedPlaceholder 
                  key={camera.id} 
                  camera={camera} 
                  onClick={handleCameraClick} 
                  isSmall={gridLayout === '4x4'} 
                />
              ))}
              {/* Fill empty slots untuk konsistensi grid */}
              {Array.from({ 
                length: Math.max(0, itemsPerPage - paginatedCameras.length) 
              }).map((_, index) => (
                <div 
                  key={`empty-${index}`} 
                  className="bg-gray-100 dark:bg-gray-800/50 rounded-xl aspect-video flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-700"
                >
                  <p className="text-gray-400 dark:text-gray-500 text-sm">Slot Kosong</p>
                </div>
              ))}
            </div>
          </div>
          
          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={cctvCameras.length}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePaginationChange}
            itemName="kamera"
            showFirstLast={true}
          />
        </div>
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