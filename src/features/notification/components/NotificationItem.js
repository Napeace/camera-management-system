// src/features/notification/components/NotificationItem.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SignalSlashIcon } from '@heroicons/react/24/outline';
import notificationService from '../../../services/notificationService';

const NotificationItem = ({ notification, onDelete }) => {
  const navigate = useNavigate();

  const handleClick = async () => {
    try {
      console.log('🔔 Notification clicked:', notification);
      
      // 1. Delete notifikasi terlebih dahulu
      await notificationService.deleteNotification(notification.id_notification);
      console.log('✅ Notification deleted');
      
      // 2. Update UI (optimistic)
      if (onDelete) {
        onDelete(notification.id_notification);
      }
      
      // 3. Navigate ke history page dengan query param highlight
      console.log(`📍 Navigating to /history?highlight=${notification.id_history}`);
      navigate(`/history?highlight=${notification.id_history}`);
      
    } catch (error) {
      console.error('❌ Failed to delete notification:', error);
    }
  };

  return (
    <div
      onClick={handleClick}
      className="p-4 hover:bg-slate-100/80 dark:hover:bg-slate-700/60 cursor-pointer transition-colors duration-150 relative z-10 bg-white/50 dark:bg-transparent"
    >
      <div className="flex items-start space-x-3">
        {/* Icon CCTV Offline */}
        <span className="flex-shrink-0 mt-1">
          <SignalSlashIcon className="w-7 h-7 text-red-500 dark:text-red-400" />
        </span>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Title dengan lokasi dinamis */}
          <p className="text-sm font-medium text-black dark:text-gray-200 mb-1">
            Kamera {notification.titik_letak} telah Offline
          </p>
          
          {/* Subtitle statis */}
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-2">
            Harap cek ke lokasi lalu tambahkan ke catatan
          </p>
          
          {/* Relative Time */}
          <p className="text-xs text-gray-500 dark:text-gray-600">
            {notificationService.getRelativeTime(notification.created_at)}
          </p>
        </div>
        
        {/* Unread Indicator (red dot) */}
        <div className="flex-shrink-0 mt-2">
          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
        </div>
      </div>
    </div>
  );
};

export default NotificationItem;