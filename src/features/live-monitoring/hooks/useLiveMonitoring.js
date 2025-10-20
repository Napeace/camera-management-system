import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import liveMonitoringService from '../../../services/liveMonitoringService';

const useLiveMonitoring = () => {
    const [searchParams] = useSearchParams();
    const bottomRef = useRef(null);
    const hasShownErrorRef = useRef(false);

    // State for CCTV data
    const [cctvCameras, setCctvCameras] = useState([]);
    const [allCctvData, setAllCctvData] = useState([]);
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

    // State for all stats
    const [allStats, setAllStats] = useState({ total: 0, online: 0, offline: 0 });

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
            } finally {
                setInitialLoading(false);
            }
        };
        loadInitialData();
    }, [searchParams]);

    // ✅ FIXED: Reset status filter when location changes
    useEffect(() => {
        if (locationFilter) {
            setStatusFilter(''); // Reset status filter to show all cameras
            setCurrentPage(1);   // Reset to first page
        }
    }, [locationFilter]);

    // ✅ Load streams + Apply filter
    useEffect(() => {
        const loadStreamsForLocation = async () => {
            if (locationFilter) {
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
                    console.log('🟡 [useLiveMonitoring] First camera sample:', transformedCameras[0]);
                    
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
            } else {
                // Clear data when no location selected
                setAllCctvData([]);
                setCctvCameras([]);
            }
        };
        loadStreamsForLocation();
    }, [locationFilter, statusFilter]);

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (fullscreenCamera) {
            document.body.classList.add('overflow-hidden');
            return () => {
                document.body.classList.remove('overflow-hidden');
            };
        }
    }, [fullscreenCamera]);

    // Calculate all stats from all locations
    useEffect(() => {
        const calculateAllStats = async () => {
            try {
                const stats = await liveMonitoringService.getStatistics();
                setAllStats(stats);
            } catch (error) {
                console.error('Error calculating stats:', error);
                setAllStats({ total: 0, online: 0, offline: 0 });
            }
        };
        calculateAllStats();
    }, []);

    // Handlers
    const handleStatusFilter = (e) => setStatusFilter(e.target.value);
    const handleLocationFilter = (e) => setLocationFilter(e.target.value);
    
    const handleCameraClick = (camera) => {
        setFullscreenCamera({
            id: camera.id,
            name: camera.name || camera.titik_letak,
            location: camera.location || camera.location_name,
            ip_address: camera.ip_address,
            status: camera.is_streaming,
            streamUrls: camera.streamUrls || camera.stream_urls,
        });
    };
    
    const handleCloseFullscreen = () => setFullscreenCamera(null);
    
    const handleGridLayoutChange = (layout) => {
        setGridLayout(layout);
        setCurrentPage(1);
    };
    
    const handlePaginationChange = (page) => setCurrentPage(page);

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

    const gridKey = `grid-${locationFilter}-${statusFilter}-${gridLayout}-${currentPage}`;

    return {
        // Data & Loading
        paginatedCameras,
        cctvCameras,
        allCctvData,
        locationGroups,
        loading,
        initialLoading,
        allStats,
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
        handleCloseFullscreen
    };
};

export default useLiveMonitoring;