// src/hooks/useCCTVStats.js
import { useMemo } from 'react';

/**
 * Custom hook untuk kalkulasi statistik CCTV
 * 
 * @param {Array} cctvData - Array of CCTV objects
 * @returns {Object} { total, online, offline }
 * 
 * Usage:
 * - DashboardPage: const cctvStats = useCCTVStats(cctvData);
 * - CCTVPage: const statistics = useCCTVStats(allCctvData);
 * 
 * Example:
 * const stats = useCCTVStats(cctvData);
 * // Returns: { total: 10, online: 8, offline: 2 }
 */
function useCCTVStats(cctvData = []) {
    return useMemo(() => {
        const total = cctvData.length;
        const online = cctvData.filter(cctv => cctv.is_streaming === true).length;
        const offline = total - online;
        
        return { total, online, offline };
    }, [cctvData]);
}

export default useCCTVStats;