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
            const token = localStorage.getItem('access_token');
            
            const response = await api.get('/location/', {
                params: { 
                    token,
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
            const token = localStorage.getItem('access_token');
            
            const response = await api.post('/location/', locationData, {
                params: { token }
            });
            return response.data;
        } catch (error) {
            console.error('Error creating location:', error);
            if (error.response?.data?.detail) {
                throw new Error(error.response.data.detail);
            }
            throw error;
        }
    },

    /**
     * Update existing location
     * @param {number} locationId - Location ID
     * @param {Object} locationData - Updated location data
     * @param {string} locationData.nama_lokasi - Location name (min 5, max 200 chars)
     * @returns {Promise} Response with updated location
     */
    updateLocation: async (locationId, locationData) => {
        try {
            const token = localStorage.getItem('access_token');
            
            const response = await api.put(`/location/${locationId}`, locationData, {
                params: { token }
            });
            return response.data;
        } catch (error) {
            console.error('Error updating location:', error);
            if (error.response?.data?.detail) {
                throw new Error(error.response.data.detail);
            }
            throw error;
        }
    },

    /**
     * Delete location (hard delete)
     * @param {number} locationId - Location ID to delete
     * @returns {Promise} Response with deleted location info
     */
    deleteLocation: async (locationId) => {
        try {
            const token = localStorage.getItem('access_token');

            const response = await api.delete(`/location/soft/${locationId}`, {
                params: { token }
            });

            return response.data;
        } catch (error) {
            console.error('Error deleting location:', error);
            throw error;
        }
    }

};

export default locationService;