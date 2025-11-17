// components/common/CustomCCTVSelect.js
import React, { useState, useEffect, useRef, memo } from 'react';
import { ChevronDownIcon, MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';

const CustomCCTVSelect = memo(({ value, onChange, disabled, cctvList = [], loading = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCCTVs, setFilteredCCTVs] = useState([]);
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  // Find selected CCTV
  const selectedCCTV = cctvList.find(cctv => cctv.id_cctv === parseInt(value));

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (!searchTerm.trim()) {
        setFilteredCCTVs(cctvList);
      } else {
        const searchLower = searchTerm.toLowerCase();
        const filtered = cctvList.filter(cctv => 
          cctv.titik_letak?.toLowerCase().includes(searchLower) ||
          cctv.ip_address?.toLowerCase().includes(searchLower) ||
          cctv.cctv_location_name?.toLowerCase().includes(searchLower)
        );
        setFilteredCCTVs(filtered);
      }
    }, 300); // Debounce delay

    return () => clearTimeout(timeoutId);
  }, [searchTerm, cctvList]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Focus search input when dropdown opens
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleSelect = (cctv) => {
    const syntheticEvent = {
      target: {
        name: 'id_cctv',
        value: cctv.id_cctv.toString()
      }
    };
    onChange(syntheticEvent);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleClear = (e) => {
    e.stopPropagation();
    const syntheticEvent = {
      target: {
        name: 'id_cctv',
        value: ''
      }
    };
    onChange(syntheticEvent);
    setSearchTerm('');
  };

  const handleToggle = () => {
    if (!disabled && !loading) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Select Button */}
      <button
        type="button"
        onClick={handleToggle}
        disabled={disabled || loading}
        className="w-full px-4 py-3 bg-white dark:bg-white/10 backdrop-blur-sm border border-gray-300 dark:border-white/20 rounded-md text-left text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-white/30 focus:border-blue-500 dark:focus:border-white/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-between"
      >
        <span className={selectedCCTV ? '' : 'text-gray-400 dark:text-white/50'}>
          {loading ? (
            'Loading...'
          ) : selectedCCTV ? (
            <span className="flex flex-col">
              <span className="font-medium">{selectedCCTV.titik_letak}</span>
              <span className="text-xs text-gray-500 dark:text-white/50">
                {selectedCCTV.ip_address} • {selectedCCTV.cctv_location_name}
              </span>
            </span>
          ) : (
            'Pilih CCTV'
          )}
        </span>
        <div className="flex items-center gap-2">
          {selectedCCTV && !disabled && (
            <XMarkIcon 
              className="w-4 h-4 text-gray-400 hover:text-gray-600 dark:hover:text-white/70" 
              onClick={handleClear}
            />
          )}
          <ChevronDownIcon 
            className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          />
        </div>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-[60] w-full mt-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-white/20 rounded-xl shadow-2xl overflow-hidden">
          {/* Search Input */}
          <div className="p-3 border-b border-gray-200 dark:border-white/10">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Cari berdasarkan nama, IP, atau lokasi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-white/30"
              />
            </div>
          </div>

          {/* CCTV List */}
          <div className="max-h-48 overflow-y-auto">
            {filteredCCTVs.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-500 dark:text-white/50 text-sm">
                {searchTerm ? 'Tidak ada CCTV yang ditemukan' : 'Tidak ada data CCTV'}
              </div>
            ) : (
              filteredCCTVs.map((cctv) => (
                <button
                  key={cctv.id_cctv}
                  type="button"
                  onClick={() => handleSelect(cctv)}
                  className={`w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-white/5 transition-colors border-b border-gray-100 dark:border-white/5 last:border-b-0 ${
                    value === cctv.id_cctv.toString() ? 'bg-blue-50 dark:bg-white/10' : ''
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {cctv.titik_letak}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-white/50 mt-0.5">
                      {cctv.ip_address} • {cctv.cctv_location_name}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
});

CustomCCTVSelect.displayName = 'CustomCCTVSelect';

export default CustomCCTVSelect;