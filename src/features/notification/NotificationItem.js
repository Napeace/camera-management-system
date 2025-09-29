import React from 'react';

const NotificationItem = ({ notification, onNotificationClick, getNotificationIcon }) => {
  const handleClick = () => {
    onNotificationClick(notification.id);
  };

  return (
    <div
      onClick={handleClick}
      className={`p-4 border-b border-gray-200 dark:border-slate-600 hover:bg-gray-100 dark:hover:bg-slate-600/50 cursor-pointer transition-colors duration-150 ${
        !notification.read ? 'bg-blue-50 dark:bg-blue-900/30 border-l-4 border-l-blue-600 dark:border-l-blue-500' : ''
      }`}
    >
      <div className="flex items-start space-x-3">
        <span className="text-lg flex-shrink-0 mt-0.5">
          {getNotificationIcon(notification.type)}
        </span>
        <div className="flex-1 min-w-0">
          <p className={`text-sm text-slate-800 dark:text-gray-200 ${!notification.read ? 'font-medium' : ''}`}>
            {notification.message}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{notification.time}</p>
        </div>
        {!notification.read && (
          <div className="w-2 h-2 bg-blue-600 dark:bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
        )}
      </div>
    </div>
  );
};

export default NotificationItem;