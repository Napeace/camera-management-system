// components/common/SearchInput.js
import React, { memo } from 'react';

const SearchInput = memo(({ value, onChange, placeholder = "Search..." }) => {
  return (
    <input 
      type="text" 
      placeholder={placeholder} 
      value={value} 
      onChange={onChange} 
      className="block w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
    />
  );
});

SearchInput.displayName = 'SearchInput';

export default SearchInput;