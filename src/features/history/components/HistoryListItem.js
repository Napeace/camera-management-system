// features/history/components/HistoryListItem.js - WITH FRIENDLY INFO MESSAGE
import React from 'react';
import { motion } from 'framer-motion';
import { DocumentCheckIcon, DocumentPlusIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../../contexts/AuthContext';

const HistoryListItem = ({ item, rowVariants, onNoteClick, onRepairClick, showInfo }) => {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'superadmin';

  const formatDateTime = (dateTimeString) => {
    try {
      // Backend mengirim format: "2025-10-27 10:30:00"
      // Ubah ke format yang bisa di-parse: "2025-10-27T10:30:00"
      const formattedString = dateTimeString.replace(' ', 'T');
      const date = new Date(formattedString);
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return {
          date: 'Invalid Date',
          time: 'Invalid Time'
        };
      }
      
      // Format: DD/MM/YYYY
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      
      // Format: HH:MM (24 jam)
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');

      return {
        date: `${day}/${month}/${year}`,
        time: `${hours}:${minutes}`
      };
    } catch (error) {
      console.error('Error formatting date:', error);
      return {
        date: 'Invalid Date',
        time: 'Invalid Time'
      };
    }
  };

  const getStatusBadge = (status) => {
    // status = true berarti kamera Online (hijau)
    // status = false berarti kamera Offline (merah)
    if (status) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
          <svg className="w-1.5 h-1.5 mr-1.5" fill="currentColor" viewBox="0 0 8 8">
            <circle cx={4} cy={4} r={3} />
          </svg>
          Online
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300">
        <svg className="w-1.5 h-1.5 mr-1.5" fill="currentColor" viewBox="0 0 8 8">
          <circle cx={4} cy={4} r={3} />
        </svg>
        Offline
      </span>
    );
  };

  const { date, time } = formatDateTime(item.created_at);

  const handleNoteClick = () => {
    onNoteClick(item);
  };

  const handleRepairClick = () => {
    // Check if already repaired first
    if (isRepaired) {
      return;
    }

    // Role check - only superadmin can confirm repair
    if (!isSuperAdmin) {
 
      if (showInfo) {
        const cctvName = item.cctv_name || 'CCTV';
        showInfo(
          'History Belum Diperbaiki',
          `Kamera ${cctvName} masih belum diperbaiki.`
        );
      }
      return;
    }

    // If superadmin, proceed normally
 
    onRepairClick(item);
  };

  // Check if note exists and is not empty
  const hasNote = item.note && item.note.trim().length > 0;
  
  // Check if already repaired (service = true)
  const isRepaired = item.service === true;

  return (
    <motion.tr 
      variants={rowVariants}
      className="transition-colors duration-150 history-row"
      data-history-id={item.id_history}
    >
      {/* Kamera - dengan truncate */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[180px]" title={item.cctv_name || 'Unknown Camera'}>
          {item.cctv_name || 'Unknown Camera'}
        </div>
      </td>
      
      {/* IP Address */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900 dark:text-white">
          {item.cctv_ip || '-'}
        </div>
      </td>
      
      {/* Lokasi - dengan truncate */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900 dark:text-white truncate max-w-[160px]" title={item.location_name || '-'}>
          {item.location_name || '-'}
        </div>
      </td>
      
      {/* Tanggal */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900 dark:text-white">{date}</div>
        <div className="text-sm text-gray-500 dark:text-gray-400">{time}</div>
      </td>
      
      {/* Status */}
      <td className="px-6 py-4 whitespace-nowrap">
        {getStatusBadge(item.status)}
      </td>
      
      {/* Aksi - 2 Buttons */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-2">
          {/* Button Catatan */}
          <button
            onClick={handleNoteClick}
            className={`p-2 rounded-lg transition-all duration-200 ${
              hasNote
                ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50'
                : 'bg-green-100 dark:bg-green-800 text-green-600 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-900'
            }`}
            title={hasNote ? 'Lihat/Edit Catatan' : 'Tambah Catatan'}
          >
            {hasNote ? (
              <DocumentCheckIcon className="w-5 h-5" />
            ) : (
              <DocumentPlusIcon className="w-5 h-5" />
            )}
          </button>

          {/* Button Sudah Diperbaiki */}
          <button
            onClick={handleRepairClick}
            disabled={isRepaired}
            className={`p-2 rounded-lg transition-all duration-200 ${
              isRepaired
                ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50'
            }`}
            title={isRepaired ? 'Sudah Diperbaiki' : ''}
          >
            <CheckCircleIcon className="w-5 h-5" />
          </button>
        </div>
      </td>
    </motion.tr>
  );
};

export default HistoryListItem;