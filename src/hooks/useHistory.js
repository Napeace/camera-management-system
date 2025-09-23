// hooks/useHistory.js
import { useState, useEffect } from 'react';

// Static data for now - will be replaced with API calls later
const staticHistoryData = [
  {
    id_history: 1,
    id_cctv: 1,
    ip_address: "192.168.1.101",
    location_name: "Lobby Utama",
    error_time: "2024-01-15T10:30:00Z",
    status: false
  },
  {
    id_history: 2,
    id_cctv: 2,
    ip_address: "192.168.1.102",
    location_name: "Ruang Server",
    error_time: "2024-01-15T09:15:00Z",
    status: false
  },
  {
    id_history: 3,
    id_cctv: 3,
    ip_address: "192.168.1.103",
    location_name: "Parkiran Depan",
    error_time: "2024-01-14T16:45:00Z",
    status: true
  },
  {
    id_history: 4,
    id_cctv: 4,
    ip_address: "192.168.1.104",
    location_name: "Koridor Lantai 2",
    error_time: "2024-01-14T14:20:00Z",
    status: false
  },
  {
    id_history: 5,
    id_cctv: 5,
    ip_address: "192.168.1.105",
    location_name: "Ruang Meeting A",
    error_time: "2024-01-14T11:30:00Z",
    status: false
  },
  {
    id_history: 6,
    id_cctv: 6,
    ip_address: "192.168.1.106",
    location_name: "Kantin",
    error_time: "2024-01-13T15:10:00Z",
    status: true
  },
  {
    id_history: 7,
    id_cctv: 7,
    ip_address: "192.168.1.107",
    location_name: "Toilet Umum",
    error_time: "2024-01-13T13:25:00Z",
    status: false
  },
  {
    id_history: 8,
    id_cctv: 8,
    ip_address: "192.168.1.108",
    location_name: "Ruang Keamanan",
    error_time: "2024-01-13T10:05:00Z",
    status: false
  },
  {
    id_history: 9,
    id_cctv: 9,
    ip_address: "192.168.1.109",
    location_name: "Tangga Darurat",
    error_time: "2024-01-12T17:40:00Z",
    status: true
  },
  {
    id_history: 10,
    id_cctv: 10,
    ip_address: "192.168.1.110",
    location_name: "Lift Area",
    error_time: "2024-01-12T14:15:00Z",
    status: false
  },
  {
    id_history: 11,
    id_cctv: 11,
    ip_address: "192.168.1.111",
    location_name: "Parkiran Belakang",
    error_time: "2024-01-12T08:30:00Z",
    status: false
  },
  {
    id_history: 12,
    id_cctv: 12,
    ip_address: "192.168.1.112",
    location_name: "Gudang",
    error_time: "2024-01-11T19:20:00Z",
    status: true
  },
  {
    id_history: 13,
    id_cctv: 13,
    ip_address: "192.168.1.113",
    location_name: "Ruang Meeting B",
    error_time: "2024-01-11T12:45:00Z",
    status: false
  },
  {
    id_history: 14,
    id_cctv: 14,
    ip_address: "192.168.1.114",
    location_name: "Koridor Lantai 1",
    error_time: "2024-01-10T16:30:00Z",
    status: false
  },
  {
    id_history: 15,
    id_cctv: 15,
    ip_address: "192.168.1.115",
    location_name: "Pintu Masuk Utama",
    error_time: "2024-01-10T09:10:00Z",
    status: true
  }
];

const useHistory = () => {
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Simulate API call
  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Sort by error_time descending (newest first)
      const sortedData = [...staticHistoryData].sort(
        (a, b) => new Date(b.error_time) - new Date(a.error_time)
      );
      
      setHistoryData(sortedData);
    } catch (err) {
      console.error('Error fetching history:', err);
      setError('Failed to load history data');
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