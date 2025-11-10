// src/features/dashboard/hooks/useOfflineChartData.js
import { useState, useEffect, useCallback, useMemo } from 'react';
import historyService from '../../../services/historyService';

/**
 * Custom hook untuk fetch dan transform data offline chart
 * Mengambil data history 7 hari terakhir dan menghitung kamera offline per hari
 * 
 * @returns {Object} { chartData, loading, error, refetch }
 * 
 * Usage:
 * const { chartData, loading, error, refetch } = useOfflineChartData();
 * 
 * chartData format:
 * [
 *   { date: '16', offline: 3, fullDate: '16 Oktober 2025' },
 *   { date: '17', offline: 5, fullDate: '17 Oktober 2025' },
 *   ...
 * ]
 */
function useOfflineChartData() {
    const [historyData, setHistoryData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    /**
     * Fetch data history dari API
     */
    const fetchHistoryData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch semua history data
            const response = await historyService.getHistory();
            const histories = response?.data?.data || [];
            
            setHistoryData(histories);
        } catch (err) {
            console.error('Error fetching history data:', err);
            const errorMessage = err?.response?.data?.message || err?.message || 'Failed to fetch history data';
            setError(errorMessage);
            setHistoryData([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchHistoryData();
    }, [fetchHistoryData]);

    /**
     * Transform history data menjadi format chart untuk 7 hari terakhir
     */
    const chartData = useMemo(() => {
        if (!historyData || historyData.length === 0) {
            return [];
        }

        // Get today's date at midnight (start of day)
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Create array untuk 7 hari terakhir (hari ini - 6 hari yang lalu)
        const last7Days = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            last7Days.push(date);
        }

        // Filter hanya history yang offline (status: false)
        const offlineHistories = historyData.filter(history => history.status === false);

        // Group offline histories by date dan hitung jumlahnya
        const offlineCountByDate = {};

        offlineHistories.forEach(history => {
            // Parse created_at (format: "YYYY-MM-DD HH24:MI:SS")
            const createdAt = new Date(history.created_at);
            
            // Set to midnight untuk comparison
            createdAt.setHours(0, 0, 0, 0);
            
            // Format date as key (YYYY-MM-DD)
            const dateKey = createdAt.toISOString().split('T')[0];
            
            // Count offline cameras per date
            if (!offlineCountByDate[dateKey]) {
                offlineCountByDate[dateKey] = new Set();
            }
            
            // Gunakan Set untuk menghindari duplikasi id_cctv yang sama di hari yang sama
            offlineCountByDate[dateKey].add(history.id_cctv);
        });

        // Transform ke format chart
        const chartDataArray = last7Days.map(date => {
            const dateKey = date.toISOString().split('T')[0];
            const offlineSet = offlineCountByDate[dateKey] || new Set();
            const offlineCount = offlineSet.size;

            // Format untuk display
            const dayNumber = date.getDate();
            const monthName = date.toLocaleDateString('id-ID', { month: 'long' });
            const year = date.getFullYear();

            return {
                date: String(dayNumber),
                offline: offlineCount,
                fullDate: `${dayNumber} ${monthName} ${year}`
            };
        });

        return chartDataArray;
    }, [historyData]);

    return {
        chartData,
        loading,
        error,
        refetch: fetchHistoryData
    };
}

export default useOfflineChartData;