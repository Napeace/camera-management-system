// hooks/useHistory.js
import { useState, useEffect } from 'react';
import historyService from '../../../services/historyService';

const useHistory = () => {
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchHistory = async () => {
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
        
        // Sort by created_at descending (newest first)
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
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  return {
    historyData,
    loading,
    error,
    fetchHistory
  };
};

export default useHistory;