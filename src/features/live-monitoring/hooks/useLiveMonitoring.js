import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import liveMonitoringService from '../../../services/liveMonitoringService';
import cctvService from '../../../services/cctvService';
import useCCTVStats from '../../../hooks/useCCTVStats';

const useLiveMonitoring = () => {
    const [searchParams] = useSearchParams();
    const bottomRef = useRef(null);
    const hasShownErrorRef = useRef(false);

    // State for CCTV data
    const [cctvCameras, setCctvCameras] = useState([]);
    const [allCctvData, setAllCctvData] = useState([]);
    
    // NEW: State for all CCTV data (for stats calculation - from cctvService)
    const [allCctvForStats, setAllCctvForStats] = useState([]);
    
    const [locationGroups, setLocationGroups] = useState([]);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);

    // State for fullscreen modal
    const [fullscreenCamera, setFullscreenCamera] = useState(null);
    
    // State for grid layout
    const [gridLayout, setGridLayout] = useState('auto');

    // State for filters
    const [statusFilter, setStatusFilter] = useState('');
    const [locationFilter, setLocationFilter] = useState('');

    // State for pagination
    const [currentPage, setCurrentPage] = useState(1);

    // NEW: Calculate stats using the same hook as CCTVPage
    const allStats = useCCTVStats(allCctvForStats);

    // NEW: State for custom camera selection
    const [viewMode, setViewMode] = useState('location'); // 'location' | 'custom'
    const [selectedCameraIds, setSelectedCameraIds] = useState([]); // max 16 camera IDs
    const [allAvailableCameras, setAllAvailableCameras] = useState([]); // all cameras for selector
    const [isCameraSelectorOpen, setIsCameraSelectorOpen] = useState(false);

    // Auto-scroll when pagination changes
    useEffect(() => {
        if (bottomRef.current && !loading) {
            setTimeout(() => {
                bottomRef.current.scrollIntoView({
                    behavior: 'smooth',
                    block: 'end',
                    inline: 'nearest'
                });
            }, 100);
        }
    }, [currentPage, loading]);

    // Load initial data
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                setInitialLoading(true);
                hasShownErrorRef.current = false;
                
                // Get location groups for dropdown
                const groups = await liveMonitoringService.getLocationGroups();
                setLocationGroups(groups);

                // NEW: Load all available cameras for selector (basic data only, no streaming check)
                const allCamerasResult = await liveMonitoringService.getAllCamerasForSelector();
                if (allCamerasResult.success) {
                    setAllAvailableCameras(allCamerasResult.data);
                    console.log('✅ Loaded all available cameras for selector:', allCamerasResult.data.length);
                }

                // NEW: Fetch all CCTV data for stats calculation (same as CCTVPage)
                const cctvResult = await cctvService.getAllCCTV();
                if (cctvResult.success && cctvResult.data) {
                    setAllCctvForStats(cctvResult.data);
                    console.log('✅ Loaded all CCTV for stats:', cctvResult.data.length);
                }

                // Check if camera ID in URL params (for deep linking)
                const cameraIdFromUrl = searchParams.get('camera');
                if (cameraIdFromUrl) {
                    const cameraResult = await liveMonitoringService.findCameraById(cameraIdFromUrl);
                    if (cameraResult.success && cameraResult.data) {
                        setFullscreenCamera(cameraResult.data);
                    }
                } else if (groups.length > 0) {
                    // Auto-select first location if no camera in URL
                    setLocationFilter(groups[0].id_location.toString());
                }
            } catch (error) {
                console.error('Error loading initial data:', error);
                setLocationGroups([]);
                setAllCctvForStats([]);
            } finally {
                setInitialLoading(false);
            }
        };
        loadInitialData();
    }, [searchParams]);

     
    useEffect(() => {
        if (locationFilter && viewMode === 'location') {
            setStatusFilter(''); // Reset status filter to show all cameras
            setCurrentPage(1);   // Reset to first page
        }
    }, [locationFilter, viewMode]);

    // Load streams for location (LOCATION MODE)
    useEffect(() => {
        const loadStreamsForLocation = async () => {
            if (locationFilter && viewMode === 'location') {
                try {
                    setLoading(true);
                    setAllCctvData([]);
                    setCctvCameras([]);
                    
                    console.log('🔵 [useLiveMonitoring] Fetching streams for location:', locationFilter);
                    const locationData = await liveMonitoringService.getStreamsByLocation(locationFilter);
                    
                    console.log('🟢 [useLiveMonitoring] Location data received:', locationData);
                    console.log('🟢 [useLiveMonitoring] Cameras count:', locationData.cameras?.length);
                    
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
                        stream_status: cam.stream_status,
                    }));
                    
                    console.log('🟡 [useLiveMonitoring] Transformed cameras:', transformedCameras);
                    
                    // Store full data
                    setAllCctvData(transformedCameras);
                    
                    // Apply filter immediately in the same effect
                    let filtered = transformedCameras;
                    if (statusFilter) {
                        const isOnline = statusFilter === 'online';
                        filtered = transformedCameras.filter(cctv => cctv.is_streaming === isOnline);
                        console.log('🔍 [useLiveMonitoring] Filtered by status:', statusFilter, '→', filtered.length);
                    }
                    
                    // Set filtered cameras
                    setCctvCameras(filtered);
                    setCurrentPage(1);
                    
                    console.log('✅ [useLiveMonitoring] State updated - cctvCameras:', filtered.length);
                } catch (error) {
                    console.error('❌ [useLiveMonitoring] Error loading streams:', error);
                    setAllCctvData([]);
                    setCctvCameras([]);
                } finally {
                    setLoading(false);
                }
            } else if (viewMode === 'location') {
                // Clear data when no location selected
                setAllCctvData([]);
                setCctvCameras([]);
            }
        };
        loadStreamsForLocation();
    }, [locationFilter, statusFilter, viewMode]);

    // NEW: Handle custom mode - fetch streams from backend using /streams/batch
    useEffect(() => {
        const loadCustomStreams = async () => {
            if (viewMode === 'custom' && selectedCameraIds.length > 0) {
                try {
                    setLoading(true);
                    setAllCctvData([]);
                    setCctvCameras([]);
                    
                    console.log('🎯 [Custom Mode] Fetching streams for selected cameras:', selectedCameraIds);
                    
                    // Call backend /streams/batch endpoint
                    const result = await liveMonitoringService.getStreamsByCctvIds(selectedCameraIds);
                    
                    if (!result.success) {
                        console.error('❌ [Custom Mode] Failed to fetch streams:', result.error);
                        alert(`Gagal memuat streams: ${result.error}`);
                        setAllCctvData([]);
                        setCctvCameras([]);
                        setLoading(false);
                        return;
                    }
                    
                    console.log('🟢 [Custom Mode] Batch streams received:', result);
                    console.log('🟢 [Custom Mode] Cameras count:', result.data.length);
                    console.log('🟢 [Custom Mode] MediaMTX status:', result.mediamtx_status);
                    
                    // Store full data
                    setAllCctvData(result.data);
                    
                    // Apply status filter if active
                    let filtered = result.data;
                    if (statusFilter) {
                        const isOnline = statusFilter === 'online';
                        filtered = result.data.filter(cam => cam.is_streaming === isOnline);
                        console.log('🔍 [Custom Mode] Filtered by status:', statusFilter, '→', filtered.length);
                    }
                    
                    setCctvCameras(filtered);
                    setCurrentPage(1);
                    
                    console.log('✅ [Custom Mode] Displaying cameras:', filtered.length);
                    
                    // Show warning if some cameras not found
                    if (result.total_requested !== result.total_found) {
                        console.warn(`⚠️ Requested ${result.total_requested} cameras, but only found ${result.total_found}`);
                    }
                    
                } catch (error) {
                    console.error('❌ [Custom Mode] Error loading custom streams:', error);
                    setAllCctvData([]);
                    setCctvCameras([]);
                    alert('Terjadi kesalahan saat memuat streams kamera');
                } finally {
                    setLoading(false);
                }
            } else if (viewMode === 'custom') {
                // Clear data when no cameras selected
                setAllCctvData([]);
                setCctvCameras([]);
            }
        };
        
        loadCustomStreams();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [viewMode, selectedCameraIds.join(','), statusFilter]);

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (fullscreenCamera) {
            document.body.classList.add('overflow-hidden');
            return () => {
                document.body.classList.remove('overflow-hidden');
            };
        }
    }, [fullscreenCamera]);

    // Handlers
    const handleStatusFilter = (e) => setStatusFilter(e.target.value);
    
    const handleLocationFilter = (e) => {
        setLocationFilter(e.target.value);
        // Reset to location mode when changing location
        if (viewMode === 'custom') {
            setViewMode('location');
            setSelectedCameraIds([]);
        }
    };
    
    const handleCameraClick = (camera) => {
        console.log('🖱️ [handleCameraClick] Camera clicked:', camera);
        setFullscreenCamera({
            id: camera.id,
            id_cctv: camera.id_cctv || camera.id,
            name: camera.name || camera.titik_letak,
            titik_letak: camera.titik_letak || camera.name,
            location: camera.location || camera.location_name,
            location_name: camera.location_name || camera.location,
            ip_address: camera.ip_address,
            status: camera.is_streaming,
            streamUrls: camera.streamUrls || camera.stream_urls,
            stream_urls: camera.stream_urls || camera.streamUrls,
            viewMode: viewMode, // ✅ Pass viewMode ke modal
        });
    };
    
    const handleCloseFullscreen = () => setFullscreenCamera(null);
    
    const handleGridLayoutChange = (layout) => {
        setGridLayout(layout);
        setCurrentPage(1);
    };
    
    const handlePaginationChange = (page) => setCurrentPage(page);

    // NEW: Custom camera selection handlers
    const handleOpenCameraSelector = () => {
        setIsCameraSelectorOpen(true);
    };

    const handleCloseCameraSelector = () => {
        setIsCameraSelectorOpen(false);
    };

    const handleApplyCustomSelection = (cameraIds) => {
        console.log('🎯 [handleApplyCustomSelection] Applying custom camera selection:', cameraIds);
        
        if (cameraIds.length === 0) {
            alert('Pilih minimal 1 kamera');
            return;
        }
        
        setSelectedCameraIds(cameraIds);
        setViewMode('custom');
        setIsCameraSelectorOpen(false);
        setCurrentPage(1);
        setStatusFilter(''); // Reset status filter when applying custom selection
        
        // The useEffect for custom mode will automatically fetch streams
        console.log('✅ [handleApplyCustomSelection] Custom mode activated, streams will be fetched');
    };

    const handleResetCustomSelection = () => {
        console.log('🔄 [handleResetCustomSelection] Resetting to location mode');
        
        setSelectedCameraIds([]);
        setViewMode('location');
        setIsCameraSelectorOpen(false);
        setCurrentPage(1);
        setStatusFilter(''); // Reset status filter
        
        // Re-trigger location filter if a location was selected
        if (locationFilter) {
            // Force re-fetch by toggling locationFilter
            const currentLocation = locationFilter;
            setLocationFilter('');
            setTimeout(() => setLocationFilter(currentLocation), 0);
        }
        
        console.log('✅ [handleResetCustomSelection] Reset complete, back to location mode');
    };

    // Grid layout helpers
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
            '4x4': 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
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

    const gridKey = `grid-${locationFilter}-${statusFilter}-${gridLayout}-${currentPage}-${viewMode}-${selectedCameraIds.join(',')}`;

    return {
        // Data & Loading
        paginatedCameras,
        cctvCameras,
        allCctvData,
        locationGroups,
        loading,
        initialLoading,
        allStats, // ✅ Now calculated from allCctvForStats using useCCTVStats hook
        bottomRef,
        
        // Filters
        statusFilter,
        locationFilter,
        handleStatusFilter,
        handleLocationFilter,
        
        // Grid Layout
        gridLayout,
        handleGridLayoutChange,
        getGridClass,
        
        // Pagination
        currentPage,
        totalPages,
        itemsPerPage,
        handlePaginationChange,
        gridKey,
        
        // Fullscreen Modal
        fullscreenCamera,
        handleCameraClick,
        handleCloseFullscreen,

        // NEW: Custom Camera Selection
        viewMode,
        selectedCameraIds,
        allAvailableCameras,
        isCameraSelectorOpen,
        handleOpenCameraSelector,
        handleCloseCameraSelector,
        handleApplyCustomSelection,
        handleResetCustomSelection,
    };
};

export default useLiveMonitoring;