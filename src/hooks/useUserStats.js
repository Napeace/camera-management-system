// src/hooks/useUserStats.js
import { useMemo } from 'react';

/**
 * Custom hook untuk kalkulasi statistik User
 * 
 * @param {Array} userData - Array of User objects
 * @returns {Object} { total, superAdmins, security }
 * 
 * Usage:
 * - DashboardPage: const userStats = useUserStats(userData);
 * - UserPage: const statistics = useUserStats(filteredUsers);
 * 
 * Example:
 * const stats = useUserStats(userData);
 * // Returns: { total: 50, superAdmins: 5, security: 45 }
 */
function useUserStats(userData = []) {
    return useMemo(() => {
        const total = userData.length;
        const superAdmins = userData.filter(u => u.user_role_name === 'Superadmin').length;
        const security = userData.filter(u => u.user_role_name === 'Security').length;
        
        return { total, superAdmins, security };
    }, [userData]);
}

export default useUserStats;