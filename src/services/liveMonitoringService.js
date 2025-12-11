import apiClient from './api';

class LiveMonitoringService {
  /**
   * Get stream URLs for a specific CCTV camera
   * Used for: Single camera detail/fullscreen modal
   */
  async getStreamUrls(cctvId) {
    try {
       const token = localStorage.getItem('access_token');
      const params = new URLSearchParams();
      if (token) {
        params.append('token', token);
      }
      
      // Backend endpoint: /streams/cctv/{cctv_id}
      const response = await apiClient.get(`/streams/cctv/${cctvId}?${params.toString()}`);
       // Handle success_response wrapper
      let streamData;
      if (response.data && response.data.status === 'success') {
        streamData = response.data.data;
      } else if (response.data && response.data.data) {
        streamData = response.data.data;
      } else {
        streamData = response.data;
      }
       return {
        success: true,
        data: {
          ...streamData,
          is_streaming: streamData.is_streaming !== undefined ? Boolean(streamData.is_streaming) : false
        }
      };
    } catch (error) {
      console.error('Error fetching stream URLs:', error);
      
      let errorMessage = 'Gagal mengambil stream URLs';
      
      if (error.response) {
        const errorData = error.response.data;
        if (typeof errorData === 'string') {
          errorMessage = errorData;
        } else if (errorData?.detail) {
          errorMessage = errorData.detail;
        } else if (errorData?.message) {
          errorMessage = errorData.message;
        } else if (error.response.status === 404) {
          errorMessage = 'CCTV tidak ditemukan';
        } else if (error.response.status === 401) {
          errorMessage = 'Tidak memiliki akses untuk melihat stream';
        }
      } else if (error.request) {
        errorMessage = 'Koneksi bermasalah - tidak dapat terhubung ke server';
      }
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }
  
  /**
   * Get all streams for a specific location
   * Used for: Live Monitoring page - location-based camera grid
   */
  async getStreamsByLocation(locationId) {
    try {
       const token = localStorage.getItem('access_token');
      const params = new URLSearchParams();
      if (token) {
        params.append('token', token);
      }
      
      // Backend endpoint: /streams/location/{location_id}
      const response = await apiClient.get(`/streams/location/${locationId}?${params.toString()}`);
       // Handle success_response wrapper dari backend
      let locationData;
      if (response.data && response.data.status === 'success') {
        locationData = response.data.data;
      } else if (response.data && response.data.data) {
        locationData = response.data.data;
      } else {
        locationData = response.data;
      }
       // Validate response structure
      if (!locationData || !locationData.cameras) {
        console.error('Invalid response structure:', locationData);
        throw new Error('Invalid response structure from server');
      }

      // Transform camera data - backend sudah mengirim is_streaming
      locationData.cameras = locationData.cameras.map(cam => {
         const transformed = {
          ...cam,
          // Backend mengirim is_streaming, pastikan boolean
          is_streaming: cam.is_streaming !== undefined ? Boolean(cam.is_streaming) : false
        };
         return transformed;
      });
       return locationData;

    } catch (error) {
      console.error('Error fetching streams by location:', error);
      console.error('Error response:', error.response);
      
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.detail ||
                          error.message || 
                          'Gagal terhubung ke server';
      throw new Error(errorMessage);
    }
  }

  /**
   * Get all CCTV data for statistics calculation
   * Used for: Live Monitoring stats (total, online, offline across all locations)
   */
  async getAllCCTVForStats() {
    try {
      const params = new URLSearchParams();
      
      const token = localStorage.getItem('access_token');
      if (token) {
        params.append('token', token);
      }
      
      // Get all CCTV without pagination for accurate stats
      params.append('skip', 0);
      params.append('limit', 1000); // High limit to get all
       const response = await apiClient.get(`/cctv/?${params.toString()}`);
      
      // Handle response structure
      let cctvData = [];
      if (response.data && response.data.data) {
        cctvData = Array.isArray(response.data.data) ? response.data.data : [];
      } else if (Array.isArray(response.data)) {
        cctvData = response.data;
      }
      
      // Transform data - ensure is_streaming is boolean
      const transformedData = cctvData.map(cctv => ({
        ...cctv,
        is_streaming: cctv.is_streaming !== undefined ? Boolean(cctv.is_streaming) : false
      }));
      
      return {
        data: transformedData,
        success: true
      };
    } catch (error) {
      console.error('Error fetching CCTV data for stats:', error);
      return {
        data: [],
        success: false
      };
    }
  }

  /**
   * NEW: Get all cameras (basic data) for camera selector modal
   * Used for: Populating camera selector modal (no streaming status check)
   * ✅ FILTER: Lokasi dengan awalan "analog" tidak ditampilkan
   */
  async getAllCamerasForSelector() {
    try {
       const token = localStorage.getItem('access_token');
      const params = new URLSearchParams();
      if (token) {
        params.append('token', token);
      }
      
      params.append('skip', 0);
      params.append('limit', 1000);
      
      const response = await apiClient.get(`/cctv/?${params.toString()}`);
      
      // Handle response structure
      let cctvData = [];
      if (response.data && response.data.data) {
        cctvData = Array.isArray(response.data.data) ? response.data.data : [];
      } else if (Array.isArray(response.data)) {
        cctvData = response.data;
      }
      
 
      const filteredCctvData = cctvData.filter(cctv => {
        const locationName = (cctv.cctv_location_name || '').toLowerCase();
        return !locationName.startsWith('analog');
      });
      
      // Transform to consistent format for selector
      const transformedCameras = filteredCctvData.map(cctv => ({
        id: cctv.id_cctv,
        id_cctv: cctv.id_cctv,
        name: cctv.titik_letak,
        titik_letak: cctv.titik_letak,
        location: cctv.cctv_location_name,
        location_name: cctv.cctv_location_name,
        id_location: cctv.id_location,
        ip_address: cctv.ip_address,
        stream_key: cctv.stream_key,
        is_streaming: Boolean(cctv.is_streaming) // From DB, might not be real-time
      }));
       return {
        success: true,
        data: transformedCameras
      };
    } catch (error) {
      console.error('Error fetching cameras for selector:', error);
      return {
        success: false,
        data: [],
        error: error.message
      };
    }
  }

  /**
   * NEW: Get streams for multiple CCTVs by their IDs (custom selection)
   * Used for: Live Monitoring page - custom camera selection mode
   * This will ensure streams and get real-time status from MediaMTX
   */
  async getStreamsByCctvIds(cctvIds) {
    try {
       const token = localStorage.getItem('access_token');
      const params = new URLSearchParams();
      if (token) {
        params.append('token', token);
      }
      
      // Backend endpoint: POST /streams/batch
      const response = await apiClient.post(
        `/streams/batch?${params.toString()}`,
        { cctv_ids: cctvIds }
      );
       // Handle success_response wrapper
      let batchData;
      if (response.data && response.data.status === 'success') {
        batchData = response.data.data;
      } else if (response.data && response.data.data) {
        batchData = response.data.data;
      } else {
        batchData = response.data;
      }
       // Validate response
      if (!batchData || !batchData.cameras) {
        console.error('Invalid batch response structure:', batchData);
        throw new Error('Invalid response structure from server');
      }
      
      // Transform cameras to consistent format
      const transformedCameras = batchData.cameras.map(cam => ({
        id: cam.cctv_id,
        id_cctv: cam.cctv_id,
        name: cam.titik_letak,
        titik_letak: cam.titik_letak,
        location: cam.location_name,
        location_name: cam.location_name,
        ip_address: cam.ip_address,
        stream_key: cam.stream_key,
        is_streaming: Boolean(cam.is_streaming),
        streamUrls: cam.stream_urls,
        stream_urls: cam.stream_urls,
        stream_status: cam.stream_status
      }));
       return {
        success: true,
        data: transformedCameras,
        total_requested: batchData.total_requested,
        total_found: batchData.total_found,
        mediamtx_status: batchData.mediamtx_status
      };
    } catch (error) {
      console.error('❌ Error fetching batch streams:', error);
      console.error('Error response:', error.response);
      
      let errorMessage = 'Gagal mengambil streams untuk kamera yang dipilih';
      
      if (error.response) {
        const errorData = error.response.data;
        if (typeof errorData === 'string') {
          errorMessage = errorData;
        } else if (errorData?.detail) {
          errorMessage = errorData.detail;
        } else if (errorData?.message) {
          errorMessage = errorData.message;
        }
      } else if (error.request) {
        errorMessage = 'Koneksi bermasalah - tidak dapat terhubung ke server';
      }
      
      return {
        success: false,
        data: [],
        error: errorMessage
      };
    }
  }

  /**
   * Calculate real-time statistics from all CCTV
   * Used for: Live Monitoring stats display
   */
  async getStatistics() {
    try {
      const result = await this.getAllCCTVForStats();
      const cctvData = result.data;
      
      const total = cctvData.length;
      const online = cctvData.filter(cctv => cctv.is_streaming === true).length;
      const offline = total - online;
      
      return { total, online, offline };
    } catch (error) {
      console.error('Error calculating statistics:', error);
      return { total: 0, online: 0, offline: 0 };
    }
  }

  /**
   * Get all locations for location filter dropdown
   * Used for: Live Monitoring location filter
   * ✅ FILTER: Lokasi dengan awalan "analog" tidak ditampilkan
   */
  async getLocationGroups() {
    try {
       const params = new URLSearchParams();
      const token = localStorage.getItem('access_token');
      if (token) {
        params.append('token', token);
      }
      
      const response = await apiClient.get(`/location/?${params.toString()}`);
       const locations = Array.isArray(response.data) ? response.data : 
                       response.data.data ? response.data.data : [];
      
 
      const filteredLocations = locations.filter(loc => {
        const namaLokasi = (loc.nama_lokasi || loc.location_name || loc.name || '').toLowerCase();
        return !namaLokasi.startsWith('analog');
      });
      
      // Transform to consistent format
      const transformedLocations = filteredLocations.map(loc => ({
        id_location: loc.id_location || loc.id,
        nama_lokasi: loc.nama_lokasi || loc.location_name || loc.name
      }));
       return transformedLocations;
    } catch (error) {
      console.error('Error fetching location groups:', error);
      return [];
    }
  }

  /**
   * Find specific camera by ID from all CCTV data
   * Used for: Opening camera from URL parameter
   */
  async findCameraById(cameraId) {
    try {
      const result = await this.getAllCCTVForStats();
      const allCctv = result.data || [];
      
      const camera = allCctv.find(c => c.id_cctv?.toString() === cameraId.toString());
      
      if (camera) {
        return {
          success: true,
          data: {
            id: camera.id_cctv,
            id_cctv: camera.id_cctv,
            name: camera.titik_letak,
            titik_letak: camera.titik_letak,
            location: camera.location_name || camera.cctv_location_name,
            ip_address: camera.ip_address,
            is_streaming: Boolean(camera.is_streaming),
            stream_urls: camera.stream_urls
          }
        };
      }
      
      return {
        success: false,
        error: 'Camera not found'
      };
    } catch (error) {
      console.error('Error finding camera by ID:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Check MediaMTX server status
   * Used for: Health check and error handling
   */
  async checkMediaMTXStatus() {
    try {
      const token = localStorage.getItem('access_token');
      const params = new URLSearchParams();
      if (token) {
        params.append('token', token);
      }
      
      const response = await apiClient.get(`/streams/mediamtx/status?${params.toString()}`);
      
      let statusData;
      if (response.data && response.data.data) {
        statusData = response.data.data;
      } else {
        statusData = response.data;
      }
      
      return {
        success: true,
        isOnline: statusData.is_online || false,
        status: statusData.status || 'unknown'
      };
    } catch (error) {
      console.error('Error checking MediaMTX status:', error);
      return {
        success: false,
        isOnline: false,
        status: 'offline'
      };
    }
  }

  /**
   * Get all streams status from MediaMTX
   * Used for: Debugging and monitoring all streams
   */
  async getAllStreamsStatus() {
    try {
      const token = localStorage.getItem('access_token');
      const params = new URLSearchParams();
      if (token) {
        params.append('token', token);
      }
      
      const response = await apiClient.get(`/streams/mediamtx/all-streams?${params.toString()}`);
      
      let streamsData;
      if (response.data && response.data.data) {
        streamsData = response.data.data;
      } else {
        streamsData = response.data;
      }
      
      return {
        success: true,
        data: streamsData
      };
    } catch (error) {
      console.error('Error fetching all streams status:', error);
      return {
        success: false,
        data: { total_streams: 0, streams: [] }
      };
    }
  }
}

const liveMonitoringService = new LiveMonitoringService();
export default liveMonitoringService;