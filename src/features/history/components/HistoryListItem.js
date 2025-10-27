// features/history/components/HistoryListItem.js
import React from 'react';
import { motion } from 'framer-motion';

const HistoryListItem = ({ item, rowVariants }) => {
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
      
      // Format: HH:MM AM/PM
      let hours = date.getHours();
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12; // 0 should be 12
      const formattedHours = String(hours).padStart(2, '0');
      
      return {
        date: `${day}/${month}/${year}`,
        time: `${formattedHours}.${minutes} ${ampm}`
      };
    } catch (error) {
      console.error('Error formatting date:', error);
      return {
        date: 'Invalid Date',
        time: 'Invalid Time'
      };
    }
  };

  const getStatusBadge = (service) => {
    // service = true berarti sudah diperbaiki (Online)
    // service = false berarti masih error (Offline)
    if (service) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
          <svg className="w-1.5 h-1.5 mr-1" fill="currentColor" viewBox="0 0 8 8">
            <circle cx={4} cy={4} r={3} />
          </svg>
          Online
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300">
        <svg className="w-1.5 h-1.5 mr-1" fill="currentColor" viewBox="0 0 8 8">
          <circle cx={4} cy={4} r={3} />
        </svg>
        Offline
      </span>
    );
  };

  const formatDuration = (dateTimeString) => {
    try {
      const formattedString = dateTimeString.replace(' ', 'T');
      const errorDate = new Date(formattedString);
      
      if (isNaN(errorDate.getTime())) {
        return 'Unknown';
      }
      
      const now = new Date();
      const durationMs = now - errorDate;
      
      const seconds = Math.floor(durationMs / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);
      const weeks = Math.floor(days / 7);
      const months = Math.floor(days / 30);
      const years = Math.floor(days / 365);
      
      if (years > 0) {
        return `${years} tahun lalu`;
      } else if (months > 0) {
        return `${months} bulan lalu`;
      } else if (weeks > 0) {
        return `${weeks} minggu lalu`;
      } else if (days > 0) {
        return `${days} hari lalu`;
      } else if (hours > 0) {
        return `${hours} jam lalu`;
      } else if (minutes > 0) {
        return `${minutes} menit lalu`;
      } else {
        return 'Baru saja';
      }
    } catch (error) {
      console.error('Error calculating duration:', error);
      return 'Unknown';
    }
  };

  const { date, time } = formatDateTime(item.created_at);
  const durationText = formatDuration(item.created_at);

  return (
    <motion.tr 
      variants={rowVariants}
      className="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors duration-150"
    >
      {/* Camera Info */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="ml-3">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {item.cctv_name || 'Unknown'}
            </div>
          </div>
        </div>
      </td>
      
      {/* Location - sementara pakai cctv_name juga */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900 dark:text-white">
          {item.cctv_name || 'Unknown'}
        </div>
      </td>
      
      {/* Error Date & Time */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900 dark:text-white">{date}</div>
        <div className="text-sm text-gray-500 dark:text-gray-400">{time}</div>
      </td>
      
      {/* Status */}
      <td className="px-6 py-4 whitespace-nowrap">
        {getStatusBadge(item.service)}
      </td>
      
      {/* Duration */}
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
        {durationText}
      </td>
    </motion.tr>
  );
};

export default HistoryListItem;