// CCTVList.js - FULL MATCH dengan UserList.js styling
import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import useTableAnimation from '../../../hooks/useTableAnimation';
import Pagination from '../../../components/common/Pagination';
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
  FolderIcon,
  ChevronUpIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';

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
  itemsPerPage = 10,
  userRole = 'security' // tambahan: menerima role user
}) => {
  const [actionLoading, setActionLoading] = useState({});
  const shouldShowActions = userRole === 'superadmin'; // logika kondisional
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
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-800">
          <svg className="w-1.5 h-1.5 mr-1.5" fill="currentColor" viewBox="0 0 8 8">
            <circle cx={4} cy={4} r={3} />
          </svg>
          Online
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800">
          <svg className="w-1.5 h-1.5 mr-1.5" fill="currentColor" viewBox="0 0 8 8">
            <circle cx={4} cy={4} r={3} />
          </svg>
          Offline
        </span>
      );
    }
  };

  const getLocationName = (cctv) => {
    return (
      cctv.location_name ||
      cctv.nama_lokasi ||
      cctv.cctv_location_name ||
      (locationGroups && locationGroups.find((loc) => loc.id === cctv.id_location)?.name) ||
      '-'
    );
  };

  const handleEdit = (cctv) => shouldShowActions && onEdit && onEdit(cctv);

  const handleDelete = (cctv) => {
    console.log('CCTVList handleDelete called with:', cctv);
    if (shouldShowActions && onDelete) {
      onDelete(cctv);
    }
  };

  // Loading State - Match UserList styling
  if (loading && cctvData.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-950/50 rounded-lg shadow-sm border border-gray-200 dark:border-slate-600/30">
        <div className="animate-pulse p-6">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-1/6"></div>
                <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-1/6"></div>
                <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-1/4"></div>
                <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-1/5"></div>
                <div className="h-4 bg-400 dark:bg-slate-700 rounded w-1/6"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error State - Match UserList styling
  if (error) {
    return (
      <div className="bg-white dark:bg-slate-950/50 rounded-lg shadow-sm border border-gray-200 dark:border-slate-600/30 p-6">
        <div className="text-center py-8">
          <svg className="mx-auto h-12 w-12 text-red-400 dark:text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">Error Loading CCTV</h3>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  // Empty State - Match UserList styling
  if (!cctvData || cctvData.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-950/50 rounded-lg shadow-sm border border-gray-200 dark:border-slate-600/30 p-6">
        <div className="text-center py-8">
          <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">Kamera CCTV tidak ditemukan</h3>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">No CCTV cameras have been added yet.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <motion.div
        className="bg-white dark:bg-slate-950/80 rounded-t-xl shadow-sm border border-gray-200 dark:border-slate-500/30 overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      >
        {/* Header - Match UserList styling */}
        <div className="px-6 py-4 rounded-t-xl bg-white dark:bg-slate-400/10 border-gray-200 border dark:border-slate-500/30">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
              <FolderIcon className="w-5 h-5 mr-2" />
              Daftar CCTV Rumah Sakit Citra Husada
            </h3>
          </div>
        </div>

        {/* Table Container - Match UserList styling */}
        <div className="w-full overflow-x-auto overflow-y-hidden px-6">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-600/30">
            <thead>
              <tr>
                {/* Kamera with Sort */}
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-white tracking-wider">
                  <button
                    onClick={handleSortToggle}
                    className="inline-flex items-center justify-center hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 group"
                    title="Klik untuk mengurutkan (A-Z / Z-A)"
                  >
                    <VideoCameraIcon className="w-4 h-4 mr-2" />
                    <span>Kamera</span>
                    <div className="ml-2">
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

                {/* IP Address */}
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-white tracking-wider">
                  <div className="flex items-center justify-center">
                    <ServerIcon className="w-4 h-4 mr-2" />
                    IP Address
                  </div>
                </th>

                {/* Lokasi */}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white tracking-wider">
                  <div className="flex items-center justify-center">
                    <BuildingOfficeIcon className="w-4 h-4 mr-2" />
                    Lokasi
                  </div>
                </th>

                {/* Status */}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white tracking-wider">
                  <div className="flex items-center justify-center">
                    <SignalIcon className="w-4 h-4 mr-2" />
                    Status
                  </div>
                </th>

                {/* Aksi */}
                {shouldShowActions && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white tracking-wider">
                    <div className="flex items-center justify-center">
                      <AdjustmentsVerticalIcon className="w-4 h-4 mr-2" />
                      Aksi
                    </div>
                  </th>
                )}
              </tr>
            </thead>

            {/* Animated tbody - Match UserList styling */}
            <motion.tbody
              className="bg-transparent divide-y divide-gray-200 dark:divide-slate-600/30"
              variants={tableAnimations.tbody}
              initial="hidden"
              animate="visible"
              key={sortOrder}
            >
              {sortedCCTVData.map((cctv) => (
                <motion.tr
                  key={cctv.id_cctv}
                  variants={tableAnimations.row}
                  className="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors duration-150"
                >
                  {/* Kamera */}
                  <td className="px-6 py-4 text-center whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {cctv.titik_letak}
                      </div>
                      {cctv.description && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {cctv.description}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* IP Address */}
                  <td className="px-6 py-4 text-center whitespace-nowrap">
                    {['192.168.10.48', '192.168.10.46', '192.168.10.98'].includes(cctv.ip_address) ? (
                      <a
                        href={cctv.ip_address === '192.168.10.98' ? `http://${cctv.ip_address}/` : `https://${cctv.ip_address}/`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-mono text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 underline decoration-green-600/30 hover:decoration-green-600 dark:decoration-green-400/30 dark:hover:decoration-green-400 underline-offset-2 transition-all duration-200 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded inline-flex items-center gap-1.5"
                        title={`Buka CCTV ${cctv.ip_address} di tab baru`}
                      >
                        {cctv.ip_address}
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    ) : cctv.titik_letak && cctv.titik_letak.toLowerCase().startsWith('analog') ? (
                      <a
                        href="https://docs.google.com/document/d/1r0JR9EyceCoYsUv9iHmmo7FX4puOzueK/edit?usp=sharing&ouid=114749900704014060268&rtpof=true&sd=true"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-mono text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline decoration-blue-600/30 hover:decoration-blue-600 dark:decoration-blue-400/30 dark:hover:decoration-blue-400 underline-offset-2 transition-all duration-200 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded inline-flex items-center gap-1.5"
                        title={`Buka SOP CCTV Analog ${cctv.ip_address} di tab baru`}
                      >
                        {cctv.ip_address || '-'}
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    ) : (
                      <div className="text-sm text-gray-900 dark:text-white">
                        {cctv.ip_address || '-'}
                      </div>
                    )}
                  </td>

                  {/* Lokasi */}
                  <td className="px-6 py-4 text-center whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {getLocationName(cctv)}
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4 text-center whitespace-nowrap">
                    {getStatusBadge(cctv.is_streaming)}
                  </td>

                  {/* Aksi Buttons */}
                  {shouldShowActions && (
                    <td className="px-6 py-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center space-x-2">
                        {/* Button Edit - Kuning */}
                        <button
                          onClick={() => handleEdit(cctv)}
                          className="text-yellow-600 dark:text-yellow-400 bg-yellow-600/30 dark:bg-yellow-800/30 hover:text-yellow-900 dark:hover:text-yellow-300 p-2 hover:bg-yellow-100 dark:hover:bg-yellow-400/10 rounded-md transition-colors duration-200"
                          title="Edit CCTV"
                          disabled={actionLoading[cctv.id_cctv]}
                        >
                          <PencilIcon className="w-5 h-5" />
                        </button>

                        {/* Button Delete - Merah */}
                        <button
                          onClick={() => handleDelete(cctv)}
                          className="text-red-600 dark:text-red-400 bg-red-600/30 dark:bg-red-800/30 hover:text-red-900 dark:hover:text-red-300 p-2 hover:bg-red-100 dark:hover:bg-red-400/10 rounded-md transition-colors duration-200"
                          title="Delete CCTV"
                          disabled={actionLoading[cctv.id_cctv]}
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  )}
                </motion.tr>
              ))}
            </motion.tbody>
          </table>
        </div>
      </motion.div>

      {/* Pagination - Match UserList */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        onPageChange={onPageChange}
        itemName="Data CCTV"
        showFirstLast={true}
      />
    </>
  );
};

export default CCTVList;
