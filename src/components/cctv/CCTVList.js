import React, { useState, useEffect } from 'react';

const CCTVList = () => {
  const [cctvData, setCctvData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All Status');
  const [filterLocation, setFilterLocation] = useState('All Locations');

  // Mock data - replace with actual API call
  useEffect(() => {
    const mockData = [
      {
        id_cctv: 1,
        ip_address: '192.168.1.101',
        status: true,
        location: {
          id_location: 1,
          nama_lokasi: 'Lobby Utama'
        },
        created_at: '2024-01-15 10:30:00',
        updated_at: '2024-09-08 10:30:00'
      },
      {
        id_cctv: 2,
        ip_address: '192.168.1.102',
        status: true,
        location: {
          id_location: 2,
          nama_lokasi: 'IGD (Emergency Room)'
        },
        created_at: '2024-01-15 11:00:00',
        updated_at: '2024-09-08 10:32:00'
      },
      {
        id_cctv: 3,
        ip_address: '192.168.1.103',
        status: false,
        location: {
          id_location: 3,
          nama_lokasi: 'Area Parkir'
        },
        created_at: '2024-01-16 09:15:00',
        updated_at: '2024-09-07 23:45:00'
      },
      {
        id_cctv: 4,
        ip_address: '192.168.1.104',
        status: true,
        location: {
          id_location: 4,
          nama_lokasi: 'ICU Ward'
        },
        created_at: '2024-01-16 14:20:00',
        updated_at: '2024-09-08 10:35:00'
      },
      {
        id_cctv: 5,
        ip_address: '192.168.1.105',
        status: false,
        location: {
          id_location: 5,
          nama_lokasi: 'Pintu Masuk Utama'
        },
        created_at: '2024-01-17 08:30:00',
        updated_at: '2024-09-08 08:15:00'
      },
      {
        id_cctv: 6,
        ip_address: '192.168.1.106',
        status: true,
        location: {
          id_location: 6,
          nama_lokasi: 'Apotek'
        },
        created_at: '2024-01-17 13:45:00',
        updated_at: '2024-09-08 10:33:00'
      },
      {
        id_cctv: 7,
        ip_address: '192.168.1.107',
        status: true,
        location: {
          id_location: 7,
          nama_lokasi: 'Ruang Operasi'
        },
        created_at: '2024-01-18 16:10:00',
        updated_at: '2024-09-08 10:31:00'
      },
      {
        id_cctv: 8,
        ip_address: '192.168.1.108',
        status: false,
        location: {
          id_location: 8,
          nama_lokasi: 'Koridor Lantai 2'
        },
        created_at: '2024-01-20 11:25:00',
        updated_at: '2024-09-06 15:20:00'
      }
    ];

    // Simulate API loading
    setTimeout(() => {
      setCctvData(mockData);
      setLoading(false);
    }, 1000);
  }, []);

  // Get unique locations for filter
  const uniqueLocations = [...new Set(cctvData.map(cctv => cctv.location.nama_lokasi))];

  // Filter data based on search and filters
  const filteredData = cctvData.filter(cctv => {
    const matchesSearch = cctv.location.nama_lokasi.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cctv.ip_address.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'All Status' || 
                         (filterStatus === 'Active' && cctv.status) ||
                         (filterStatus === 'Offline' && !cctv.status);
    
    const matchesLocation = filterLocation === 'All Locations' || 
                           cctv.location.nama_lokasi === filterLocation;
    
    return matchesSearch && matchesStatus && matchesLocation;
  });

  // Count statistics
  const totalCCTV = cctvData.length;
  const activeCCTV = cctvData.filter(cctv => cctv.status).length;
  const offlineCCTV = cctvData.filter(cctv => !cctv.status).length;

  const handleRefresh = () => {
    setLoading(true);
    // Simulate refresh
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  const handleViewLive = (cctv) => {
    if (cctv.status) {
      // Open live view - you can implement modal or redirect
      alert(`Membuka live view untuk CCTV ${cctv.location.nama_lokasi} (${cctv.ip_address})`);
    } else {
      alert('CCTV sedang offline, tidak dapat menampilkan live view');
    }
  };

  const formatDateTime = (dateTime) => {
    return new Date(dateTime).toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    if (status) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <span className="w-1.5 h-1.5 mr-1.5 bg-green-400 rounded-full"></span>
          Active
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <span className="w-1.5 h-1.5 mr-1.5 bg-red-400 rounded-full"></span>
          Offline
        </span>
      );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Lihat CCTV</h1>
        <p className="text-gray-600">Monitor dan kelola kamera keamanan rumah sakit</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total CCTV</p>
              <p className="text-2xl font-bold text-gray-900">{totalCCTV}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">CCTV Active</p>
              <p className="text-2xl font-bold text-green-600">{activeCCTV}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-lg">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">CCTV Offline</p>
              <p className="text-2xl font-bold text-red-600">{offlineCCTV}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Cari berdasarkan lokasi atau IP address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Filter Status */}
            <select
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="All Status">Semua Status</option>
              <option value="Active">Active</option>
              <option value="Offline">Offline</option>
            </select>

            {/* Filter Location */}
            <select
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              value={filterLocation}
              onChange={(e) => setFilterLocation(e.target.value)}
            >
              <option value="All Locations">Semua Lokasi</option>
              {uniqueLocations.map((location, index) => (
                <option key={index} value={location}>{location}</option>
              ))}
            </select>
          </div>

          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {/* CCTV Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID CCTV
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lokasi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  IP Address
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Update
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <svg className="w-12 h-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      <p className="text-lg font-medium">Tidak ada CCTV ditemukan</p>
                      <p className="text-sm">Coba ubah filter atau kata kunci pencarian</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredData.map((cctv) => (
                  <tr key={cctv.id_cctv} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{cctv.id_cctv}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {cctv.location.nama_lokasi}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID Lokasi: {cctv.location.id_location}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                      {cctv.ip_address}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(cctv.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDateTime(cctv.updated_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleViewLive(cctv)}
                        className={`inline-flex items-center px-3 py-1 rounded-md text-sm font-medium ${
                          cctv.status
                            ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                        disabled={!cctv.status}
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        Live View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Results Count */}
      {filteredData.length > 0 && (
        <div className="mt-4 text-sm text-gray-600">
          Menampilkan {filteredData.length} dari {totalCCTV} CCTV
        </div>
      )}
    </div>
  );
};

export default CCTVList;