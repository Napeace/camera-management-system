import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import liveMonitoringService from '../../../services/liveMonitoringService';
import cctvService from '../../../services/cctvService';
import useCCTVStats from '../../../hooks/useCCTVStats';

const useLiveMonitoring = () => {
    const [searchParams] = useSearchParams();
    const bottomRef = useRef(null);
    const hasShownErrorRef = useRef(false);
    
 
    const isLoadingRef = useRef(false);
    const loadTimeoutRef = useRef(null);

    // State for CCTV data
    const [cctvCameras, setCctvCameras] = useState([]);
    const [allCctvData, setAllCctvData] = useState([]);
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

    // Calculate stats
    const allStats = useCCTVStats(allCctvForStats);

    // State for custom camera selection
    const [viewMode, setViewMode] = useState('location');
    const [selectedCameraIds, setSelectedCameraIds] = useState([]);
    const [allAvailableCameras, setAllAvailableCameras] = useState([]);
    const [isCameraSelectorOpen, setIsCameraSelectorOpen] = useState(false);

 
    const selectedCameraIdsKey = useMemo(() => 
        selectedCameraIds.join(','), 
        [selectedCameraIds]
    );

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
                
                const groups = await liveMonitoringService.getLocationGroups();
                setLocationGroups(groups);

                const allCamerasResult = await liveMonitoringService.getAllCamerasForSelector();
                if (allCamerasResult.success) {
                    setAllAvailableCameras(allCamerasResult.data);
                }

                const cctvResult = await cctvService.getAllCCTV();
                if (cctvResult.success && cctvResult.data) {
                    setAllCctvForStats(cctvResult.data);
                }

                const cameraIdFromUrl = searchParams.get('camera');
                if (cameraIdFromUrl) {
                    const cameraResult = await liveMonitoringService.findCameraById(cameraIdFromUrl);
                    if (cameraResult.success && cameraResult.data) {
                        setFullscreenCamera(cameraResult.data);
                    }
                } else if (groups.length > 0) {
                    setLocationFilter(groups[0].id_location.toString());
                }
            } catch (error) {
                setLocationGroups([]);
                setAllCctvForStats([]);
            } finally {
                setInitialLoading(false);
            }
        };
        loadInitialData();
    }, [searchParams]);

    // Reset filters when location changes
    useEffect(() => {
        if (locationFilter && viewMode === 'location') {
            setStatusFilter('');
            setCurrentPage(1);
        }
    }, [locationFilter, viewMode]);

 
    useEffect(() => {
        // Clear any pending timeout
        if (loadTimeoutRef.current) {
            clearTimeout(loadTimeoutRef.current);
        }

        const loadStreamsForLocation = async () => {
 
            if (isLoadingRef.current) {
                return;
            }

            if (locationFilter && viewMode === 'location') {
                try {
                    isLoadingRef.current = true;
                    setLoading(true);
                    
                    const locationData = await liveMonitoringService.getStreamsByLocation(locationFilter);
                    
                    const transformedCameras = locationData.cameras.map(cam => ({
                        id: cam.cctv_id,
                        id_cctv: cam.cctv_id,
                        name: cam.titik_letak,
                        titik_letak: cam.titik_letak,
                        location: locationData.location_name,
                        location_name: locationData.location_name,
                        is_streaming: !cam.is_streaming,
                        ip_address: cam.ip_address,
                        id_location: locationFilter,
                        streamUrls: cam.stream_urls,
                        stream_urls: cam.stream_urls,
                        stream_status: cam.stream_status,
                    }));
                    
 
                    setAllCctvData(transformedCameras);
                    
                    let filtered = transformedCameras;
                    if (statusFilter) {
                        if (statusFilter === 'online') {
                            filtered = transformedCameras.filter(cctv => cctv.is_streaming === true);
                        } else if (statusFilter === 'offline') {
                            filtered = transformedCameras.filter(cctv => cctv.is_streaming === false);
                        }
                    }
                    
                    setCctvCameras(filtered);
                    setCurrentPage(1);
                } catch (error) {
                    setAllCctvData([]);
                    setCctvCameras([]);
                } finally {
 
                    setTimeout(() => {
                        isLoadingRef.current = false;
                        setLoading(false);
                    }, 500); // 500ms cooldown
                }
            } else if (viewMode === 'location') {
                setAllCctvData([]);
                setCctvCameras([]);
            }
        };

 
        loadTimeoutRef.current = setTimeout(() => {
            loadStreamsForLocation();
        }, 300);

        return () => {
            if (loadTimeoutRef.current) {
                clearTimeout(loadTimeoutRef.current);
            }
        };
    }, [locationFilter, statusFilter, viewMode]);

 
    useEffect(() => {
        if (loadTimeoutRef.current) {
            clearTimeout(loadTimeoutRef.current);
        }

        const loadCustomStreams = async () => {
            if (isLoadingRef.current) {
                return;
            }

            if (viewMode === 'custom' && selectedCameraIds.length > 0) {
                try {
                    isLoadingRef.current = true;
                    setLoading(true);
                    
                    const result = await liveMonitoringService.getStreamsByCctvIds(selectedCameraIds);
                    
                    if (!result.success) {
                        alert(`Gagal memuat streams: ${result.error}`);
                        setAllCctvData([]);
                        setCctvCameras([]);
                        return;
                    }
                    
                    setAllCctvData(result.data);
                    
                    let filtered = result.data;
                    if (statusFilter) {
                        if (statusFilter === 'online') {
                            filtered = result.data.filter(cam => cam.is_streaming === true);
                        } else if (statusFilter === 'offline') {
                            filtered = result.data.filter(cam => cam.is_streaming === false);
                        }
                    }
                    
                    setCctvCameras(filtered);
                    setCurrentPage(1);
                    
                } catch (error) {
                    setAllCctvData([]);
                    setCctvCameras([]);
                    alert('Terjadi kesalahan saat memuat streams kamera');
                } finally {
                    setTimeout(() => {
                        isLoadingRef.current = false;
                        setLoading(false);
                    }, 500);
                }
            } else if (viewMode === 'custom') {
                setAllCctvData([]);
                setCctvCameras([]);
            }
        };
        
        loadTimeoutRef.current = setTimeout(() => {
            loadCustomStreams();
        }, 300);

        return () => {
            if (loadTimeoutRef.current) {
                clearTimeout(loadTimeoutRef.current);
            }
        };
    }, [viewMode, selectedCameraIdsKey, statusFilter]);

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (fullscreenCamera) {
            document.body.classList.add('overflow-hidden');
            return () => {
                document.body.classList.remove('overflow-hidden');
            };
        }
    }, [fullscreenCamera]);

 
    const handleStatusFilter = useCallback((e) => {
        setStatusFilter(e.target.value);
    }, []);
    
    const handleLocationFilter = useCallback((e) => {
        setLocationFilter(e.target.value);
        if (viewMode === 'custom') {
            setViewMode('location');
            setSelectedCameraIds([]);
        }
    }, [viewMode]);
    
    const handleCameraClick = useCallback((camera) => {
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
            viewMode: viewMode,
        });
    }, [viewMode]);
    
    const handleCloseFullscreen = useCallback(() => {
        setFullscreenCamera(null);
    }, []);
    
    const handleGridLayoutChange = useCallback((layout) => {
        setGridLayout(layout);
        setCurrentPage(1);
    }, []);
    
    const handlePaginationChange = useCallback((page) => {
        setCurrentPage(page);
    }, []);

    const handleOpenCameraSelector = useCallback(() => {
        setIsCameraSelectorOpen(true);
    }, []);

    const handleCloseCameraSelector = useCallback(() => {
        setIsCameraSelectorOpen(false);
    }, []);

    const handleApplyCustomSelection = useCallback((cameraIds) => {
        if (cameraIds.length === 0) {
            alert('Pilih minimal 1 kamera');
            return;
        }
        
        setSelectedCameraIds(cameraIds);
        setViewMode('custom');
        setIsCameraSelectorOpen(false);
        setCurrentPage(1);
        setStatusFilter('');
    }, []);

    const handleResetCustomSelection = useCallback(() => {
        setSelectedCameraIds([]);
        setViewMode('location');
        setIsCameraSelectorOpen(false);
        setCurrentPage(1);
        setStatusFilter('');
        
        if (locationFilter) {
            const currentLocation = locationFilter;
            setLocationFilter('');
            setTimeout(() => setLocationFilter(currentLocation), 0);
        }
    }, [locationFilter]);

    // Grid layout helpers - Memoized
    const getAutoGridLayout = useCallback(() => {
        const totalCameras = cctvCameras.length;
        if (totalCameras < 5) return '2x2';
        if (totalCameras < 10) return '3x3';
        return '4x4';
    }, [cctvCameras.length]);

    const getGridClass = useCallback(() => {
        const layout = gridLayout === 'auto' ? getAutoGridLayout() : gridLayout;
        return {
            '2x2': 'grid-cols-1 md:grid-cols-2',
            '3x3': 'grid-cols-2 md:grid-cols-3',
            '4x4': 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
        }[layout] || 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4';
    }, [gridLayout, getAutoGridLayout]);

    const getItemsPerPage = useCallback(() => {
        const layout = gridLayout === 'auto' ? getAutoGridLayout() : gridLayout;
        return { '2x2': 4, '3x3': 9, '4x4': 16 }[layout] || 16;
    }, [gridLayout, getAutoGridLayout]);

 
    const itemsPerPage = useMemo(() => getItemsPerPage(), [getItemsPerPage]);
    const totalPages = useMemo(() => Math.ceil(cctvCameras.length / itemsPerPage), [cctvCameras.length, itemsPerPage]);
    const paginatedCameras = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return cctvCameras.slice(startIndex, endIndex);
    }, [cctvCameras, currentPage, itemsPerPage]);

 
    const gridKey = useMemo(() => 
        `grid-${locationFilter}-${statusFilter}-${gridLayout}-${currentPage}-${viewMode}-${selectedCameraIdsKey}`,
        [locationFilter, statusFilter, gridLayout, currentPage, viewMode, selectedCameraIdsKey]
    );

    return {
        paginatedCameras,
        cctvCameras,
        allCctvData,
        locationGroups,
        loading,
        initialLoading,
        allStats,
        bottomRef,
        statusFilter,
        locationFilter,
        handleStatusFilter,
        handleLocationFilter,
        gridLayout,
        handleGridLayoutChange,
        getGridClass,
        currentPage,
        totalPages,
        itemsPerPage,
        handlePaginationChange,
        gridKey,
        fullscreenCamera,
        handleCameraClick,
        handleCloseFullscreen,
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