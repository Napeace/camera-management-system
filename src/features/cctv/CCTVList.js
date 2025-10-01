// CCTVList.jsx
import React, { useState } from 'react';
import { 
  PencilIcon, 
  TrashIcon, 
  ExclamationTriangleIcon, 
  VideoCameraSlashIcon,
  VideoCameraIcon,
  GlobeAltIcon,
  MapPinIcon,
  SignalIcon,
  CogIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline';

const CCTVList = ({ 
  cctvData, 
  loading, 
  error, 
  onRefresh, 
  onEdit, 
  onDelete, 
  locationGroups,
  currentPage,
  totalPages,
  onPageChange,
  totalItems
}) => {
  const [actionLoading, setActionLoading] = useState({});
  
  const getStatusBadge = (status) => {
    if (status) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 dark:bg-green-500/20 text-green-700 dark:text-green-300 border border-green-500/30">
          <span className="w-2 h-2 mr-2 bg-green-600 dark:bg-green-400 rounded-full"></span>
          Online
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-500/20 dark:bg-red-500/20 text-red-700 dark:text-red-300 border border-red-500/30">
          <span className="w-2 h-2 mr-2 bg-red-600 dark:bg-red-400 rounded-full"></span>
          Error
        </span>
      );
    }
  };

  const getLocationName = (cctv) => {
    return cctv.location_name || 
           cctv.nama_lokasi || 
           cctv.cctv_location_name ||
           (locationGroups && locationGroups.find(loc => loc.id === cctv.id_location)?.name) ||
           '-';
  };

  const handleEdit = (cctv) => onEdit && onEdit(cctv);
  
  const handleDelete = (cctv) => {
    console.log('CCTVList handleDelete called with:', cctv);
    if (onDelete) {
      onDelete(cctv);
    }
  };

  // Loading State
  if (loading && cctvData.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800/70 backdrop-blur-sm rounded-xl border border-gray-300 dark:border-slate-700/50 p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-slate-700 rounded w-1/3 mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 dark:bg-slate-700 rounded w-full"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/50 backdrop-blur-sm rounded-xl border border-red-200 dark:border-red-600/30 p-6 text-center">
        <div className="text-red-600 dark:text-red-300 mb-2">
          <ExclamationTriangleIcon className="w-12 h-12 mx-auto mb-2" />
          <p className="text-lg font-medium">Error loading CCTV data</p>
        </div>
        <p className="text-red-500 dark:text-red-200 mb-4">{error}</p>
        <button 
          onClick={onRefresh}
          className="px-4 py-2 bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors duration-200"
        >
          Retry
        </button>
      </div>
    );
  }

  // Empty State
  if (!cctvData || cctvData.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800/70 backdrop-blur-sm rounded-xl border border-gray-300 dark:border-slate-700/50 p-6 text-center">
        <div className="flex flex-col items-center text-gray-500 dark:text-gray-400">
          <VideoCameraSlashIcon className="w-12 h-12 mb-2" />
          <p className="text-lg font-medium text-gray-800 dark:text-white">Tidak ada CCTV ditemukan</p>
          <p className="text-sm">Belum ada data CCTV, silakan tambah CCTV baru</p>
        </div>
      </div>
    );
  }

  // Main Table
  return (
    <div className="bg-white dark:bg-slate-800/70 backdrop-blur-sm rounded-xl border border-gray-300 dark:border-slate-700/50 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 bg-gray-50 dark:bg-slate-900/50 border-b border-gray-200 dark:border-slate-700/50">
        <div className="flex items-center gap-2">
          <ClipboardDocumentListIcon className="w-5 h-5 text-blue-500 dark:text-blue-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Daftar CCTV Rumah Sakit Citra Husada</h3>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700/50">
          <thead className="bg-gray-100 dark:bg-slate-900/30">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <VideoCameraIcon className="w-4 h-4" />
                  Kamera
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <GlobeAltIcon className="w-4 h-4" />
                  IP Address
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <MapPinIcon className="w-4 h-4" />
                  Lokasi
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <SignalIcon className="w-4 h-4" />
                  Status
                </div>
              </th>
              <th className="px-6 py-4 text-center text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                <div className="flex items-center justify-center gap-2">
                  <CogIcon className="w-4 h-4" />
                  Aksi
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {cctvData.map((cctv, index) => (
              <React.Fragment key={cctv.id_cctv}>
                <tr className="hover:bg-gray-50 dark:hover:bg-slate-900/30 transition-colors duration-200">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{cctv.titik_letak}</div>
                    {cctv.description && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{cctv.description}</div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-700 dark:text-gray-300 font-mono bg-gray-100 dark:bg-slate-900/50 px-2 py-1 rounded">
                      {cctv.ip_address || '-'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {getLocationName(cctv)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(cctv.is_streaming)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center items-center space-x-3">
                      <button
                        onClick={() => handleEdit(cctv)}
                        className="p-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-400/10 rounded-lg transition-colors duration-200"
                        title="Edit CCTV"
                        disabled={actionLoading[cctv.id_cctv]}
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(cctv)}
                        className="p-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-400/10 rounded-lg transition-colors duration-200"
                        title="Hapus CCTV"
                        disabled={actionLoading[cctv.id_cctv]}
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
                {index !== cctvData.length - 1 && (
                  <tr>
                    <td colSpan="5" className="px-0 py-0">
                      <div className="mx-6 h-px bg-gray-200 dark:bg-slate-700/50"></div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="px-6 py-4 bg-gray-50 dark:bg-slate-900/30 border-t border-gray-200 dark:border-slate-700/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Halaman {currentPage} dari {totalPages} ({totalItems} total CCTV)
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-center">
            <button
              onClick={() => onPageChange(1)}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded-lg text-sm font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-slate-600"
            >
              First
            </button>
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded-lg text-sm font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-slate-600"
            >
              Prev
            </button>
            
            {/* Page Numbers */}
            <div className="flex gap-1">
              {[...Array(totalPages)].map((_, idx) => {
                const pageNum = idx + 1;
                // Show first, last, current, and adjacent pages
                if (
                  pageNum === 1 ||
                  pageNum === totalPages ||
                  (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                ) {
                  return (
                    <button
                      key={pageNum}
                      onClick={() => onPageChange(pageNum)}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors duration-200 ${
                        currentPage === pageNum
                          ? 'bg-blue-600 dark:bg-blue-500 text-white'
                          : 'bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-slate-600'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                } else if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                  return <span key={pageNum} className="px-2 text-gray-500">...</span>;
                }
                return null;
              })}
            </div>

            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded-lg text-sm font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-slate-600"
            >
              Next
            </button>
            <button
              onClick={() => onPageChange(totalPages)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded-lg text-sm font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-slate-600"
            >
              Last
            </button>
          </div>
        </div>
      )}
      
      {/* Single Page Footer */}
      {totalPages <= 1 && (
        <div className="px-6 py-3 bg-gray-50 dark:bg-slate-900/30 border-t border-gray-200 dark:border-slate-700/50 text-sm text-gray-600 dark:text-gray-400">
          Menampilkan {cctvData.length} CCTV
        </div>
      )}
    </div>
  );
};

export default CCTVList;