import React from 'react';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import { useTheme } from '../../contexts/ThemeContext';

const ThemeToggle = ({ className = '' }) => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`
        relative p-2 rounded-lg transition-all duration-300
        bg-slate-200/90 dark:bg-slate-800/70
        hover:bg-slate-300/90 dark:hover:bg-slate-700/80
        border border-slate-400/30 dark:border-slate-600/30
        backdrop-blur-sm
        ${className}
      `}
      aria-label="Toggle theme"
    >
      <div className="relative w-6 h-6">
        {/* Sun Icon - Light Mode */}
        <SunIcon 
          className={`
            absolute inset-0 w-6 h-6 text-yellow-600 dark:text-yellow-500
            transition-all duration-300 transform
            ${isDarkMode ? 'opacity-0 rotate-90 scale-0' : 'opacity-100 rotate-0 scale-100'}
          `}
        />
        
        {/* Moon Icon - Dark Mode */}
        <MoonIcon 
          className={`
            absolute inset-0 w-6 h-6 text-slate-600 dark:text-blue-400
            transition-all duration-300 transform
            ${isDarkMode ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-0'}
          `}
        />
      </div>
    </button>
  );
};

export default ThemeToggle;