import { useState, useEffect, useCallback } from 'react';
import historyService from '../../../services/historyService';

const useHistory = () => {
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ FIX: Wrap dengan useCallback agar function stable
  const fetchHistory = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Fetching history from backend...');
      
      const response = await historyService.getHistory({
        skip: 0,
        limit: 1000
      });
      
      console.log('✅ History Response:', response);
      
      if (response.data && response.data.status === 'success') {
        const histories = response.data.data;
        
        const sortedData = [...histories].sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );
        
        console.log('📊 Sorted History Data:', sortedData);
        setHistoryData(sortedData);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error('❌ Error fetching history:', err);
      setError(err.message || 'Failed to load history data');
    } finally {
      setLoading(false);
    }
  }, []); // ✅ Empty dependency karena tidak depend pada apapun

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]); // ✅ Sekarang aman untuk include di dependency

  return {
    historyData,
    loading,
    error,
    fetchHistory
  };
};

export default useHistory;