import apiClient from './api';

class LiveMonitoringService {
  /**
   * Get stream URLs for a specific CCTV camera
   * Used for: Single camera detail/fullscreen modal
   */
  async getStreamUrls(cctvId) {
    try {
      console.log('Fetching stream URLs for CCTV:', cctvId);
      
      const token = localStorage.getItem('access_token');
      const params = new URLSearchParams();
      if (token) {
        params.append('token', token);
      }
      
      // Backend endpoint: /streams/cctv/{cctv_id}
      const response = await apiClient.get(`/streams/cctv/${cctvId}?${params.toString()}`);
      console.log('Stream URLs Response:', response.data);
      
      // Handle success_response wrapper
      let streamData;
      if (response.data && response.data.status === 'success') {
        streamData = response.data.data;
      } else if (response.data && response.data.data) {
        streamData = response.data.data;
      } else {
        streamData = response.data;
      }
      
      console.log('Extracted stream data:', streamData);
      
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
      console.log(`Fetching streams for location: ${locationId}`);
      
      const token = localStorage.getItem('access_token');
      const params = new URLSearchParams();
      if (token) {
        params.append('token', token);
      }
      
      // Backend endpoint: /streams/location/{location_id}
      const response = await apiClient.get(`/streams/location/${locationId}?${params.toString()}`);
      
      console.log('Raw location streams response:', response.data);
      
      // Handle success_response wrapper dari backend
      let locationData;
      if (response.data && response.data.status === 'success') {
        locationData = response.data.data;
      } else if (response.data && response.data.data) {
        locationData = response.data.data;
      } else {
        locationData = response.data;
      }

      console.log('Extracted location data:', locationData);

      // Validate response structure
      if (!locationData || !locationData.cameras) {
        console.error('Invalid response structure:', locationData);
        throw new Error('Invalid response structure from server');
      }

      // Transform camera data - backend sudah mengirim is_streaming
      locationData.cameras = locationData.cameras.map(cam => {
        console.log('Camera before transform:', cam);
        
        const transformed = {
          ...cam,
          // Backend mengirim is_streaming, pastikan boolean
          is_streaming: cam.is_streaming !== undefined ? Boolean(cam.is_streaming) : false
        };
        
        console.log('Camera after transform:', transformed);
        return transformed;
      });

      console.log('Final location data with transformed cameras:', locationData);
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
      
      console.log('Fetching all CCTV for stats calculation');
      
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
   */
  async getLocationGroups() {
    try {
      console.log('Fetching locations for live monitoring...');
      
      const params = new URLSearchParams();
      const token = localStorage.getItem('access_token');
      if (token) {
        params.append('token', token);
      }
      
      const response = await apiClient.get(`/location/?${params.toString()}`);
      console.log('Locations API Response:', response.data);
      
      const locations = Array.isArray(response.data) ? response.data : 
                       response.data.data ? response.data.data : [];
      
      // Transform to consistent format
      return locations.map(loc => ({
        id_location: loc.id_location || loc.id,
        nama_lokasi: loc.nama_lokasi || loc.location_name || loc.name
      }));
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