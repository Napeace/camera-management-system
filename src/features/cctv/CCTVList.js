import React, { useState } from 'react';
import { PencilIcon, TrashIcon, ArrowPathIcon, ExclamationTriangleIcon, VideoCameraSlashIcon } from '@heroicons/react/24/outline';

const CCTVList = ({ cctvData, loading, error, onRefresh, onEdit, onDelete, locationGroups }) => {
  const [actionLoading, setActionLoading] = useState({});
  
  const getStatusBadge = (status) => {
    if (status) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-300">
          <span className="w-1.5 h-1.5 mr-1.5 bg-green-400 rounded-full"></span>
          Online
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/20 text-red-300">
          <span className="w-1.5 h-1.5 mr-1.5 bg-red-400 rounded-full"></span>
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

  if (loading && cctvData.length === 0) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-600/30 p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-700 rounded w-1/3 mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-slate-700 rounded w-full"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/50 backdrop-blur-sm rounded-xl border border-red-600/30 p-6 text-center">
        <div className="text-red-300 mb-2">
          <ExclamationTriangleIcon className="w-12 h-12 mx-auto mb-2" />
          <p className="text-lg font-medium">Error loading CCTV data</p>
        </div>
        <p className="text-red-200 mb-4">{error}</p>
        <button 
          onClick={onRefresh}
          className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!cctvData || cctvData.length === 0) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-600/30 p-6 text-center">
        <div className="flex flex-col items-center text-gray-400">
          <VideoCameraSlashIcon className="w-12 h-12 mb-2" />
          <p className="text-lg font-medium text-white">Tidak ada CCTV ditemukan</p>
          <p className="text-sm">Belum ada data CCTV, silakan tambah CCTV baru</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-600/30 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-600/30">
          <thead className="bg-slate-700/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Titik Letak</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">IP Address</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Lokasi</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-600/30">
            {cctvData.map((cctv) => (
              <tr key={cctv.id_cctv} className="hover:bg-slate-700/30">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                  #{cctv.id_cctv}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-white">{cctv.titik_letak}</div>
                  {cctv.description && (
                    <div className="text-sm text-gray-400">{cctv.description}</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 font-mono">
                  {cctv.ip_address || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(cctv.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                  {getLocationName(cctv)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                  <div className="flex justify-center items-center space-x-4">
                    <button
                      onClick={() => handleEdit(cctv)}
                      className="text-blue-400 hover:text-blue-300"
                      title="Edit CCTV"
                      disabled={actionLoading[cctv.id_cctv]}
                    >
                      <PencilIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(cctv)}
                      className="text-red-400 hover:text-red-300"
                      title="Hapus CCTV"
                      disabled={actionLoading[cctv.id_cctv]}
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="px-6 py-3 bg-slate-700/50 border-t border-slate-600/30 text-sm text-gray-400">
        Menampilkan {cctvData.length} CCTV
      </div>
    </div>
  );
};

export default CCTVList;