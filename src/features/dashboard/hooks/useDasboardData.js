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
 * @returns {Object} { cctvData, userData, lastLoginData, loading, error, refetch }
 * 
 * Usage (DashboardPage only):
 * const { cctvData, userData, lastLoginData, loading, error, refetch } = useDashboardData({
 *     showError,
 *     isSuperAdmin: user?.role === 'superadmin'
 * });
 */
function useDashboardData({ showError, isSuperAdmin }) {
    const [cctvData, setCctvData] = useState([]);
    const [userData, setUserData] = useState([]);
    const [lastLoginData, setLastLoginData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const hasShownErrorRef = useRef(false);

    /**
     * Transform user data menjadi format Last Login
     * - Filter user dengan last_login tidak null
     * - Sort by last_login descending (terbaru dulu)
     * - Ambil 3 teratas
     * - Format tanggal ke Indonesia: "27 Okt 2025, 14:30"
     */
    const transformLastLoginData = useCallback((users) => {
        if (!users || users.length === 0) {
            return [];
        }

        // Filter user yang pernah login (last_login tidak null)
        const usersWithLogin = users.filter(user => user.last_login !== null && user.last_login !== undefined);

        // Jika tidak ada user yang pernah login, return empty array
        if (usersWithLogin.length === 0) {
            return [];
        }

        // Sort by last_login descending (terbaru dulu)
        const sortedUsers = usersWithLogin.sort((a, b) => {
            const dateA = new Date(a.last_login);
            const dateB = new Date(b.last_login);
            return dateB - dateA; // Descending
        });

        // Ambil 3 teratas
        const topThree = sortedUsers.slice(0, 3);

        // Transform ke format yang dibutuhkan LastLoginSection
        return topThree.map(user => {
            const date = new Date(user.last_login);
            
            // Format tanggal: "27 Okt 2025, 14:30"
            const formattedDate = date.toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });

            return {
                user: user.nama,
                date: formattedDate,
                action: `Logged in: ${user.nama}`
            };
        });
    }, []);

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
                    const users = userResult.data || [];
                    setUserData(users);
                    
                    // Transform untuk Last Login Section
                    const transformedLoginData = transformLastLoginData(users);
                    setLastLoginData(transformedLoginData);
                } catch (userErr) {
                    console.warn('Failed to fetch user data:', userErr);
                    setUserData([]);
                    setLastLoginData([]);
                }
            } else {
                setUserData([]);
                setLastLoginData([]);
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
    }, [showError, isSuperAdmin, transformLastLoginData]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return {
        cctvData,
        userData,
        lastLoginData,  
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