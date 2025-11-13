// CCTVList.js
import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import useTableAnimation from '../../../hooks/useTableAnimation';
import AnimatedSection from '../../../components/common/AnimatedSection';
import { 
  PencilIcon, 
  TrashIcon, 
  ExclamationTriangleIcon, 
  VideoCameraSlashIcon,
  VideoCameraIcon,
  ServerIcon,
  BuildingOfficeIcon,
  SignalIcon,
  AdjustmentsVerticalIcon,
  ClipboardDocumentListIcon,
  ChevronUpIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import Pagination from '../../../components/common/Pagination';

const CCTVList = ({ 
  cctvData = [],
  loading = false, 
  error = null, 
  onRefresh, 
  onEdit, 
  onDelete, 
  locationGroups = [],
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  totalItems = 0,
  itemsPerPage = 10
}) => {
  const [actionLoading, setActionLoading] = useState({});
  const [sortOrder, setSortOrder] = useState(null); // null, 'asc', 'desc'
  
  // Gunakan custom hook untuk table animation tanpa hover scale
  const tableAnimations = useTableAnimation({
    staggerDelay: 0.05,
    duration: 0.3,
    enableHover: false
  });
  
  // Sorting logic menggunakan useMemo untuk performance
  const sortedCCTVData = useMemo(() => {
    if (!sortOrder) return cctvData;
    
    const sorted = [...cctvData].sort((a, b) => {
      const nameA = (a.titik_letak || '').toLowerCase();
      const nameB = (b.titik_letak || '').toLowerCase();
      
      if (sortOrder === 'asc') {
        return nameA.localeCompare(nameB);
      } else {
        return nameB.localeCompare(nameA);
      }
    });
    
    return sorted;
  }, [cctvData, sortOrder]);
  
  // Toggle sorting
  const handleSortToggle = () => {
    if (sortOrder === null) {
      setSortOrder('asc');
    } else if (sortOrder === 'asc') {
      setSortOrder('desc');
    } else {
      setSortOrder(null);
    }
  };
  
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
          Offline
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
            {[...Array(1)].map((_, i) => (
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

  return (
    <AnimatedSection.ExpandHeight 
      duration={0.6} 
      delay={0}
      className="bg-white dark:bg-slate-800/70 backdrop-blur-sm rounded-xl border border-gray-300 dark:border-slate-700/50 overflow-hidden"
    >
      {/* Header */}
      <div className="px-6 py-4 bg-gray-50 dark:bg-slate-900/50 border-b border-gray-200 dark:border-slate-700/50">
        <div className="flex items-center gap-2">
          <ClipboardDocumentListIcon className="w-5 h-5 text-blue-500 dark:text-blue-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Daftar CCTV Rumah Sakit Citra Husada</h3>
        </div>
      </div>

      {/* Table */}
      <div className="w-full">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700/50">
          <thead className="bg-gray-100 dark:bg-slate-900/30">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 dark:text-gray-300 tracking-wider">
                <button
                  onClick={handleSortToggle}
                  className="flex items-center gap-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 group"
                  title="Klik untuk mengurutkan (A-Z / Z-A) - Hanya berlaku untuk halaman ini"
                >
                  <VideoCameraIcon className="w-4 h-4" />
                  <span>Kamera</span>
                  <div className="flex flex-col ml-1">
                    {sortOrder === 'asc' ? (
                      <ChevronUpIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    ) : sortOrder === 'desc' ? (
                      <ChevronDownIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    ) : (
                      <div className="flex flex-col opacity-30 group-hover:opacity-60 transition-opacity">
                        <ChevronUpIcon className="w-3 h-3 -mb-1" />
                        <ChevronDownIcon className="w-3 h-3" />
                      </div>
                    )}
                  </div>
                </button>
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 dark:text-gray-300 tracking-wider">
                <div className="flex items-center gap-2">
                  <ServerIcon className="w-4 h-4" />
                  IP Address
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 dark:text-gray-300 tracking-wider">
                <div className="flex items-center gap-2">
                  <BuildingOfficeIcon className="w-4 h-4" />
                  Lokasi
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 dark:text-gray-300 tracking-wider">
                <div className="flex items-center gap-2">
                  <SignalIcon className="w-4 h-4" />
                  Status
                </div>
              </th>
              <th className="px-6 py-4 text-center text-xs font-medium text-gray-700 dark:text-gray-300 tracking-wider">
                <div className="flex items-center justify-center gap-2">
                  <AdjustmentsVerticalIcon className="w-4 h-4" />
                  Aksi
                </div>
              </th>
            </tr>
          </thead>
          
          {/* Animated tbody dengan slide up effect */}
          <motion.tbody
            variants={tableAnimations.tbody}
            initial="hidden"
            animate="visible"
            key={sortOrder} // Re-trigger animation saat sorting berubah
          >
            {sortedCCTVData.map((cctv, index) => (
              <React.Fragment key={cctv.id_cctv}>
                <motion.tr 
                  variants={tableAnimations.row}
                  className="hover:bg-gray-50 dark:hover:bg-slate-900/30 transition-colors duration-200"
                >
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{cctv.titik_letak}</div>
                    {cctv.description && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{cctv.description}</div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {/* ✅ Check if CCTV is Analog (prefix "Analog" in titik_letak) */}
                    {cctv.titik_letak && cctv.titik_letak.toLowerCase().startsWith('analog') ? (
                      // Analog CCTV - IP Address is clickable link
                      <a
                        href={`http://${cctv.ip_address}/`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-mono text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline decoration-blue-600/30 hover:decoration-blue-600 dark:decoration-blue-400/30 dark:hover:decoration-blue-400 underline-offset-2 transition-all duration-200 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded inline-flex items-center gap-1.5"
                        title={`Buka CCTV Analog ${cctv.ip_address} di tab baru`}
                      >
                        {cctv.ip_address || '-'}
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    ) : (
                      // IP CCTV - IP Address is regular text
                      <span className="text-sm text-gray-700 dark:text-gray-300 font-mono bg-gray-100 dark:bg-slate-900/50 px-2 py-1 rounded">
                        {cctv.ip_address || '-'}
                      </span>
                    )}
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
                </motion.tr>
                {index !== sortedCCTVData.length - 1 && (
                  <tr>
                    <td colSpan="5" className="px-0 py-0">
                      <div className="mx-6 h-px bg-gray-200 dark:bg-slate-700/50"></div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </motion.tbody>
        </table>
      </div>
      
      {/* Pagination Component */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        onPageChange={onPageChange}
        itemName="CCTV"
        showFirstLast={true}
      />
    </AnimatedSection.ExpandHeight>
  );
};

export default CCTVList;