// src/features/dashboard/hooks/useDashboardData.js
import { useState, useEffect, useCallback, useRef } from 'react';
import cctvService from '../../../services/cctvService';
import userService from '../../../services/userService';

/**
 * Custom hook untuk fetch data dashboard
 * Menggabungkan fetch CCTV + User data secara bersamaan
 * 
 * @param {Object} options
 * @param {Function} options.showError - Toast error handler dari useToast
 * @param {Boolean} options.isSuperAdmin - Apakah user adalah SuperAdmin
 * @returns {Object} { cctvData, userData, loading, error, refetch }
 * 
 * Usage (DashboardPage only):
 * const { cctvData, userData, loading, error, refetch } = useDashboardData({
 *     showError,
 *     isSuperAdmin: user?.role === 'superadmin'
 * });
 */
function useDashboardData({ showError, isSuperAdmin }) {
    const [cctvData, setCctvData] = useState([]);
    const [userData, setUserData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const hasShownErrorRef = useRef(false);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            hasShownErrorRef.current = false;

            // Fetch CCTV data (always needed for dashboard)
            const cctvResult = await cctvService.getAllCCTV();
            setCctvData(cctvResult.data || []);

            // Fetch User data (only for SuperAdmin)
            if (isSuperAdmin) {
                try {
                    const userResult = await userService.getAllUsers();
                    setUserData(userResult.data || []);
                } catch (userErr) {
                    console.warn('Failed to fetch user data:', userErr);
                    setUserData([]);
                }
            } else {
                setUserData([]);
            }
        } catch (err) {
            console.error('Error fetching dashboard data:', err);
            const errorMessage = extractErrorMessage(err);
            setError(errorMessage);
            
            if (!hasShownErrorRef.current) {
                showError('Load Failed', errorMessage);
                hasShownErrorRef.current = true;
            }
        } finally {
            setLoading(false);
        }
    }, [showError, isSuperAdmin]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return {
        cctvData,
        userData,
        loading,
        error,
        refetch: fetchData // Manual refresh capability
    };
}

// Helper function untuk extract error message
function extractErrorMessage(err) {
    if (err?.response?.data?.message) return err.response.data.message;
    if (err?.response?.data?.detail) return err.response.data.detail;
    if (err?.message) return err.message;
    return 'An unexpected error occurred.';
}

export default useDashboardData;