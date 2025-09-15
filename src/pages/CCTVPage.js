import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import MainLayout from '../components/layout/MainLayout';
import Sidebar from '../components/layout/Sidebar';
import cctvService from '../services/cctvService';
import CCTVCreateModal from '../features/cctv/CCTVCreateModal';
import CCTVEditModal from '../features/cctv/CCTVEditModal'; 

const CCTVPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // State for CCTV data
  const [cctvData, setCctvData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCCTV, setEditingCCTV] = useState(null);

  // State for filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dvrGroupFilter, setDvrGroupFilter] = useState('');
  // DIHAPUS: State untuk typeFilter tidak lagi diperlukan
  // const [typeFilter, setTypeFilter] = useState('');

  // Load CCTV data
  useEffect(() => {
    loadCCTVData();
  }, []);

  const loadCCTVData = async () => {
    try {
      setLoading(true);
      setError(null);

      const filters = {};
      if (searchTerm) filters.search = searchTerm;
      if (statusFilter !== '') filters.status = statusFilter === 'online';
      if (dvrGroupFilter) filters.dvr_group = dvrGroupFilter;
      // DIHAPUS: Filter berdasarkan tipe tidak lagi diperlukan
      // if (typeFilter) filters.type = typeFilter;

      // Note: cctvService.getAllCCTV now returns a simple object, not a promise for static data
      const result = cctvService.getAllCCTV(filters);
      setCctvData(result.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Apply filters when they change (debounced)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadCCTVData();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, statusFilter, dvrGroupFilter]); // DIHAPUS: dependency typeFilter

  // --- Handlers ---

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
      window.location.href = '/login';
    }
  };

  const handlePageChange = (pageId, path) => {
    navigate(path);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setDvrGroupFilter('');
  };

  // DIHAPUS: handleViewLive tidak lagi dipanggil dari tabel utama
  // const handleViewLive = (cctv) => { ... };

  // --- CRUD Handlers ---

  const handleAddCCTV = () => {
    setShowCreateModal(true);
  };

  const handleEditCCTV = (cctv) => {
    setEditingCCTV(cctv);
    setShowEditModal(true);
  };

  const handleDeleteCCTV = async (cctv) => {
    if (window.confirm(`Hapus CCTV ${cctv.name} di ${cctv.location}?`)) {
      try {
        await cctvService.deleteCCTV(cctv.id);
        alert('CCTV berhasil dihapus (simulasi).');
        loadCCTVData(); // Muat ulang data setelah hapus
      } catch (err) {
        alert('Gagal menghapus CCTV: ' + err.message);
      }
    }
  };

  // --- Modal Handlers ---

  const handleModalClose = () => {
    setShowCreateModal(false);
    setShowEditModal(false);
    setEditingCCTV(null);
  };

  const handleCCTVCreated = () => {
    handleModalClose();
    loadCCTVData();
  };
  
  const handleCCTVUpdated = () => {
    handleModalClose();
    loadCCTVData();
  };

  // --- UI Data & Components ---

  const stats = cctvService.getStatistics();
  const dvrGroups = cctvService.getDVRGroups();
  const hasActiveFilters = searchTerm || statusFilter || dvrGroupFilter;

  const getStatusBadge = (status) => {
    if (status) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <span className="w-1.5 h-1.5 mr-1.5 bg-green-400 rounded-full"></span>
          Online
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

  // DIHAPUS: getTypeBadge tidak lagi diperlukan
  // const getTypeBadge = (type) => { ... };

  const CCTVPageContent = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manajemen CCTV</h1>
          <p className="text-gray-600 mt-1">Kelola data kamera keamanan rumah sakit</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleAddCCTV}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Tambah CCTV
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      {/* DIUBAH: Grid disederhanakan menjadi 3 kolom, card IP & Analog dihapus */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <p className="text-sm text-gray-600">Total CCTV</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <p className="text-sm text-gray-600">Online</p>
          <p className="text-2xl font-bold text-green-600">{stats.online}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <p className="text-sm text-gray-600">Offline</p>
          <p className="text-2xl font-bold text-red-600">{stats.offline}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-2">Cari CCTV</label>
            <input
              type="text"
              placeholder="Cari berdasarkan nama, lokasi, atau IP address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full p-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="sm:w-48">
            <label className="block text-sm font-medium mb-2">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="block w-full p-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Semua Status</option>
              <option value="online">Online</option>
              <option value="offline">Offline</option>
            </select>
          </div>
          <div className="sm:w-48">
            <label className="block text-sm font-medium mb-2">DVR Group</label>
            <select
              value={dvrGroupFilter}
              onChange={(e) => setDvrGroupFilter(e.target.value)}
              className="block w-full p-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Semua DVR</option>
              {dvrGroups.map((group, index) => (
                <option key={index} value={group}>{group}</option>
              ))}
            </select>
          </div>
          {/* DIHAPUS: Filter Tipe Kamera */}
          {hasActiveFilters && (
            <div className="sm:w-32 flex items-end">
              <button
                onClick={handleClearFilters}
                className="w-full px-4 py-2 text-gray-600 border rounded-lg hover:bg-gray-50"
              >
                Clear
              </button>
            </div>
          )}
        </div>
      </div>

      {/* CCTV Table */}
      <div className="bg-white rounded-lg shadow-sm border">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="p-6 text-center text-red-600">
            <p>Error loading CCTV data: {error}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama & Lokasi</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IP Address</th>
                  {/* DIHAPUS: Kolom Tipe */}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">DVR Group</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {cctvData.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500"> {/* ColSpan diubah */}
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
                  cctvData.map((cctv) => (
                    <tr key={cctv.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{cctv.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{cctv.name}</div>
                          <div className="text-sm text-gray-500">{cctv.location}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">{cctv.ip_address}</td>
                      {/* DIHAPUS: Sel untuk Tipe */}
                      <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(cctv.status)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cctv.dvr_group}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        {/* DIHAPUS: Tombol Live */}
                        <button
                          onClick={() => handleEditCCTV(cctv)}
                          className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteCCTV(cctv)}
                          className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-red-100 text-red-700 hover:bg-red-200"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Hapus
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Results Count */}
      {cctvData.length > 0 && (
        <div className="text-sm text-gray-600">
          Menampilkan {cctvData.length} dari {stats.total} CCTV
        </div>
      )}
    </div>
  );

  return (
    <>
      <MainLayout
        user={user}
        Sidebar={(props) => (
          <Sidebar
            {...props}
            user={user}
            onLogout={handleLogout}
            onPageChange={handlePageChange}
          />
        )}
      >
        <CCTVPageContent />
      </MainLayout>

      {/* Modals */}
      <CCTVCreateModal
        isOpen={showCreateModal}
        onClose={handleModalClose}
        onCCTVCreated={handleCCTVCreated}
      />
      <CCTVEditModal
        isOpen={showEditModal}
        onClose={handleModalClose}
        cctvToEdit={editingCCTV}
        onCCTVUpdated={handleCCTVUpdated}
      />
    </>
  );
};

export default CCTVPage;
