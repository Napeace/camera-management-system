import api from './api';

const locationService = {
    /**
     * Get all locations
     * @param {number} skip - Offset for pagination
     * @param {number} limit - Limit for pagination
     * @returns {Promise} Response with locations data
     */
    getAllLocations: async (skip = 0, limit = 50) => {
        try {
            // Get token from localStorage (sesuai dengan cara cctvService)
            const token = localStorage.getItem('access_token');
            
            const response = await api.get('/location/', {
                params: { 
                    token,  // Token di query string, bukan header
                    skip, 
                    limit 
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching locations:', error);
            throw error;
        }
    },

    /**
     * Create new location
     * @param {Object} locationData - Location data
     * @param {string} locationData.nama_lokasi - Location name (min 5, max 200 chars)
     * @returns {Promise} Response with created location
     */
    createLocation: async (locationData) => {
        try {
            // Get token from localStorage
            const token = localStorage.getItem('access_token');
            
            const response = await api.post('/location/', locationData, {
                params: { token }  // Token di query string untuk POST juga
            });
            return response.data;
        } catch (error) {
            console.error('Error creating location:', error);
            // Extract error message from backend
            if (error.response?.data?.detail) {
                throw new Error(error.response.data.detail);
            }
            throw error;
        }
    }
};

export default locationService;