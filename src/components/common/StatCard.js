import React from 'react';

const StatCard = ({ 
  label, 
  value, 
  icon, 
  color = 'blue',
  onClick,
  className = '' 
}) => {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-50',
    green: 'text-green-600 bg-green-50',
    red: 'text-red-600 bg-red-50',
    yellow: 'text-yellow-600 bg-yellow-50',
    purple: 'text-purple-600 bg-purple-50',
    gray: 'text-gray-600 bg-gray-50'
  };

  const handleClick = () => {
    if (onClick) {
      onClick({ label, value, icon, color });
    }
  };

  return (
    <div 
      className={`bg-white rounded-lg p-6 shadow-sm border border-gray-200 transition-all duration-200 hover:shadow-md ${
        onClick ? 'cursor-pointer hover:border-gray-300' : ''
      } ${className}`}
      onClick={handleClick}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-2xl font-bold text-gray-800">{value}</p>
          <p className="text-sm text-gray-600 mt-1">{label}</p>
        </div>
        <div className={`p-3 rounded-full ${colorClasses[color] || colorClasses.blue}`}>
          <span className="text-2xl">{icon}</span>
        </div>
      </div>
    </div>
  );
};

export default StatCard;