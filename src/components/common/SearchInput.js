import React, { useState, useEffect, memo } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const SearchInput = memo(({ 
  value, 
  onChange, 
  placeholder = "Search...", 
  disabled,
  debounceDelay = 500
}) => {
  const [localValue, setLocalValue] = useState(value);

  // ADD THIS
  console.log('🔍 SearchInput render:', { value, localValue });

  useEffect(() => {
    console.log('🔄 Value prop changed:', value);
    setLocalValue(value);
  }, [value]);

  useEffect(() => {
    console.log('⏱️ Debouncing...', localValue);
    const timeoutId = setTimeout(() => {
      if (localValue !== value) {
        console.log('✅ Calling onChange with:', localValue);
        onChange({ target: { value: localValue } });
      }
    }, debounceDelay);

    return () => clearTimeout(timeoutId);
  }, [localValue, debounceDelay]);

  const handleInputChange = (e) => {
    console.log('⌨️ Input changed:', e.target.value);
    setLocalValue(e.target.value);
  };

  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 dark:text-gray-400" />
      </div>
      <input 
        type="text" 
        placeholder={placeholder} 
        value={localValue} 
        onChange={handleInputChange}
        disabled={disabled}
        className="block w-full p-2 pl-10 bg-white dark:bg-slate-800/70 border-2 border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 transition-colors duration-200" 
      />
    </div>
  );
});

SearchInput.displayName = 'SearchInput';

export default SearchInput;