import React from 'react';

const StatCard = ({ 
  label, 
  value, 
  icon: Icon, 
  color = 'blue',
  loading = false,
  onClick = null,
  className = ''
}) => {
  // Color configurations
  const colorConfig = {
    blue: {
      icon: 'text-blue-500 dark:text-blue-400',
      border: 'border-blue-400 dark:border-blue-900',
      gradient: 'from-blue-500/20 via-blue-500/10 to-transparent dark:from-blue-900/30 dark:via-blue-900/15 dark:to-transparent',
      iconBg: 'bg-blue-500/10 dark:bg-blue-900/30'
    },
    green: {
      icon: 'text-green-600 dark:text-green-400',
      border: 'border-green-400 dark:border-green-800',
      gradient: 'from-green-500/20 via-green-500/10 to-transparent dark:from-green-900/30 dark:via-green-900/15 dark:to-transparent',
      iconBg: 'bg-green-500/10 dark:bg-green-900/30'
    },
    red: {
      icon: 'text-red-600 dark:text-red-400',
      border: 'border-red-400 dark:border-red-800',
      gradient: 'from-red-500/20 via-red-500/10 to-transparent dark:from-red-900/30 dark:via-red-900/15 dark:to-transparent',
      iconBg: 'bg-red-500/10 dark:bg-red-900/30'
    },
    purple: {
      icon: 'text-purple-600 dark:text-purple-400',
      border: 'border-purple-400 dark:border-purple-800',
      gradient: 'from-purple-500/20 via-purple-500/10 to-transparent dark:from-purple-900/30 dark:via-purple-900/15 dark:to-transparent',
      iconBg: 'bg-purple-500/10 dark:bg-purple-900/30'
    }
  };

  const colors = colorConfig[color] || colorConfig.blue;

  return (
    <div
      onClick={!loading && onClick ? onClick : undefined}
      className={`
        relative overflow-hidden
        bg-white dark:bg-slate-950/60 backdrop-blur-sm
        rounded-xl border-2 ${colors.border}
        p-6 transition-all duration-200
        shadow-sm
        ${onClick && !loading ? 'cursor-pointer hover:scale-105 hover:shadow-md' : ''}
        ${loading ? 'opacity-50 cursor-wait' : ''}
        ${className}
      `}
    >
      {/* Gradient Background */}
      <div className={`absolute inset-0 bg-gradient-to-bl ${colors.gradient} pointer-events-none`}></div>
      
      {/* Content */}
      <div className="relative z-10">
        {/* Header with Icon */}
        <div className="flex items-center gap-3 mb-4">
          <div className={`p-2 rounded-lg ${colors.iconBg}`}>
            <Icon className={`w-5 h-5 ${colors.icon}`} />
          </div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
          </p>
        </div>

        {/* Value */}
        <div className="mt-2">
          {loading ? (
            <div className="h-12 w-24 bg-gray-200 dark:bg-slate-700 rounded animate-pulse"></div>
          ) : (
            <p className="text-5xl font-bold text-gray-900 dark:text-white">
              {value}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * StatCard dengan tombol action (untuk Total Kamera)
 */
export const StatCardWithAction = ({ 
  label, 
  value, 
  icon: Icon,
  buttonText = 'Action',
  buttonIcon: ButtonIcon,
  onButtonClick,
  loading = false,
  color = 'blue'
}) => {
  const colorConfig = {
    blue: {
      icon: 'text-blue-500 dark:text-blue-400',
      border: 'border-blue-400 dark:border-blue-900',
      gradient: 'from-blue-500/20 via-blue-500/10 to-transparent dark:from-blue-900/30 dark:via-blue-900/15 dark:to-transparent',
      iconBg: 'bg-blue-500/10 dark:bg-blue-900/30',
      button: 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 dark:from-blue-700 dark:to-blue-600 dark:hover:from-blue-800 dark:hover:to-blue-700'
    }
  };

  const colors = colorConfig[color] || colorConfig.blue;

  return (
    <div className="relative overflow-hidden bg-white dark:bg-slate-950/60 backdrop-blur-sm rounded-xl border-2 border-blue-300 dark:border-blue-900 p-6 shadow-sm">
      {/* Gradient Background */}
      <div className={`absolute inset-0 bg-gradient-to-bl ${colors.gradient} pointer-events-none`}></div>
      
      {/* Content */}
      <div className="relative z-10">
        {/* Header with Icon and Button */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${colors.iconBg}`}>
              <Icon className={`w-5 h-5 ${colors.icon}`} />
            </div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {label}
            </p>
          </div>
          
          {/* Action Button */}
          <button
            onClick={onButtonClick}
            disabled={loading}
            className={`
              ${colors.button}
              disabled:from-gray-400 disabled:to-gray-300
              dark:disabled:from-slate-800 dark:disabled:to-slate-700
              text-white px-4 py-2 rounded-lg font-medium
              transition-all duration-200
              flex items-center gap-2 text-sm
              shadow-sm hover:shadow-md
            `}
          >
            {buttonText}
            {ButtonIcon && <ButtonIcon className="w-4 h-4" />}
          </button>
        </div>

        {/* Value */}
        <div className="mt-2">
          {loading ? (
            <div className="h-12 w-24 bg-gray-200 dark:bg-slate-700 rounded animate-pulse"></div>
          ) : (
            <p className="text-5xl font-bold text-gray-900 dark:text-white">
              {value}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * StatCard dengan 2 tombol action (untuk Total Kamera + Kelola Lokasi)
 * Layout: Kiri (Label + Value) | Kanan (2 Buttons Stacked)
 */
export const StatCardWithMultipleActions = ({ 
  label, 
  value, 
  icon: Icon,
  primaryButton = {},
  secondaryButton = {},
  loading = false,
  color = 'blue'
}) => {
  const colorConfig = {
    blue: {
      icon: 'text-blue-500 dark:text-blue-400',
      border: 'border-blue-400 dark:border-blue-900',
      gradient: 'from-blue-500/20 via-blue-500/10 to-transparent dark:from-blue-900/30 dark:via-blue-900/15 dark:to-transparent',
      iconBg: 'bg-blue-500/10 dark:bg-blue-900/30',
      primaryBtn: 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 dark:from-blue-700 dark:to-blue-600 dark:hover:from-blue-800 dark:hover:to-blue-700',
      secondaryBtn: 'bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-800'
    }
  };

  const colors = colorConfig[color] || colorConfig.blue;

  return (
    <div className="relative overflow-hidden bg-white dark:bg-slate-950/60 backdrop-blur-sm rounded-xl border-2 border-blue-300 dark:border-blue-900 p-6 shadow-sm">
      {/* Gradient Background */}
      <div className={`absolute inset-0 bg-gradient-to-bl ${colors.gradient} pointer-events-none`}></div>
      
      {/* Content - Split Layout */}
      <div className="relative z-10 flex items-center justify-between gap-4">
        {/* Left Side: Label + Value */}
        <div className="flex-1">
          {/* Header with Icon */}
          <div className="flex items-center gap-3 mb-4">
            <div className={`p-2 rounded-lg ${colors.iconBg}`}>
              <Icon className={`w-5 h-5 ${colors.icon}`} />
            </div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {label}
            </p>
          </div>

          {/* Value */}
          <div>
            {loading ? (
              <div className="h-12 w-24 bg-gray-200 dark:bg-slate-700 rounded animate-pulse"></div>
            ) : (
              <p className="text-5xl font-bold text-gray-900 dark:text-white">
                {value}
              </p>
            )}
          </div>
        </div>

        {/* Right Side: Action Buttons Stacked */}
        <div className="flex flex-col gap-2 min-w-[200px]">
          {/* Primary Button */}
          {primaryButton.text && (
            <button
              onClick={primaryButton.onClick}
              disabled={loading}
              className={`
                ${colors.primaryBtn}
                disabled:from-gray-400 disabled:to-gray-300
                dark:disabled:from-slate-800 dark:disabled:to-slate-700
                text-white px-4 py-2.5 rounded-lg font-medium
                transition-all duration-200
                flex items-center justify-center gap-2 text-sm
                shadow-sm hover:shadow-md
              `}
            >
              {primaryButton.text}
              {primaryButton.icon && <primaryButton.icon className="w-4 h-4" />}
            </button>
          )}

          {/* Secondary Button */}
          {secondaryButton.text && (
            <button
              onClick={secondaryButton.onClick}
              disabled={loading}
              className={`
                ${colors.secondaryBtn}
                disabled:bg-gray-400
                dark:disabled:bg-slate-800
                text-white px-4 py-2.5 rounded-lg font-medium
                transition-all duration-200
                flex items-center justify-center gap-2 text-sm
                shadow-sm hover:shadow-md
              `}
            >
              {secondaryButton.text}
              {secondaryButton.icon && <secondaryButton.icon className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatCard;