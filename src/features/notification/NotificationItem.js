import React from 'react';

const NotificationItem = ({ notification, onNotificationClick, getNotificationIcon }) => {
  const handleClick = () => {
    onNotificationClick(notification.id);
  };

  return (
    <div
      onClick={handleClick}
      className="p-4 hover:bg-slate-100/80 dark:hover:bg-slate-700/60 cursor-pointer transition-colors duration-150 relative z-10 bg-white/50 dark:bg-transparent"
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
          <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0 mt-2"></div>
        )}
      </div>
    </div>
  );
};

export default NotificationItem;