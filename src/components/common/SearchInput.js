import React, { memo } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const SearchInput = memo(({ value, onChange, placeholder = "Search...", disabled }) => {
  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
      </div>
      <input 
        type="text" 
        placeholder={placeholder} 
        value={value} 
        onChange={onChange}
        disabled={disabled}
        className="block w-full p-2 pl-10 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50" 
      />
    </div>
  );
});

SearchInput.displayName = 'SearchInput';

export default SearchInput;