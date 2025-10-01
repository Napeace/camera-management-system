import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
    SignalIcon, 
    SignalSlashIcon,
    ChevronDownIcon 
} from '@heroicons/react/24/outline';

const CustomStatusSelect = ({ value, onChange, disabled }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
    const buttonRef = useRef(null);

    const options = [
        { value: '', label: 'Semua Status', icon: SignalIcon, color: 'text-gray-500 dark:text-gray-400' },
        { value: 'online', label: 'Online', icon: SignalIcon, color: 'text-green-600 dark:text-green-400' },
        { value: 'offline', label: 'Offline', icon: SignalSlashIcon, color: 'text-red-600 dark:text-red-400' }
    ];

    const selectedOption = options.find(opt => opt.value === value) || options[0];

    // Update dropdown position when opened and on scroll/resize
    useEffect(() => {
        const updatePosition = () => {
            if (isOpen && buttonRef.current) {
                const rect = buttonRef.current.getBoundingClientRect();
                setDropdownPosition({
                    top: rect.bottom + 4,
                    left: rect.left,
                    width: rect.width
                });
            }
        };

        updatePosition();

        if (isOpen) {
            window.addEventListener('scroll', updatePosition, true);
            window.addEventListener('resize', updatePosition);
        }

        return () => {
            window.removeEventListener('scroll', updatePosition, true);
            window.removeEventListener('resize', updatePosition);
        };
    }, [isOpen]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (buttonRef.current && !buttonRef.current.contains(event.target)) {
                const dropdownElement = document.getElementById('status-dropdown-portal');
                if (dropdownElement && !dropdownElement.contains(event.target)) {
                    setIsOpen(false);
                }
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const handleSelect = (optionValue) => {
        onChange({ target: { value: optionValue } });
        setIsOpen(false);
    };

    const DropdownPortal = () => {
        if (!isOpen) return null;

        return createPortal(
            <div 
                id="status-dropdown-portal"
                className="fixed bg-white dark:bg-slate-800 border-2 border-gray-300 dark:border-slate-600 rounded-xl shadow-xl overflow-hidden animate-slideDown"
                style={{
                    top: `${dropdownPosition.top}px`,
                    left: `${dropdownPosition.left}px`,
                    width: `${dropdownPosition.width}px`,
                    zIndex: 999999
                }}
            >
                {options.map((option) => {
                    const Icon = option.icon;
                    const isSelected = option.value === value;
                    
                    return (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => handleSelect(option.value)}
                            className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors duration-150 ${
                                isSelected 
                                    ? 'bg-blue-50 dark:bg-slate-700' 
                                    : 'hover:bg-gray-50 dark:hover:bg-slate-700/50'
                            }`}
                        >
                            <Icon className={`w-5 h-5 ${option.color}`} />
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                                {option.label}
                            </span>
                            {isSelected && (
                                <svg 
                                    className="w-5 h-5 ml-auto text-blue-600 dark:text-blue-400" 
                                    fill="currentColor" 
                                    viewBox="0 0 20 20"
                                >
                                    <path 
                                        fillRule="evenodd" 
                                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
                                        clipRule="evenodd" 
                                    />
                                </svg>
                            )}
                        </button>
                    );
                })}
            </div>,
            document.body
        );
    };

    return (
        <>
            <div className="relative">
                <button
                    ref={buttonRef}
                    type="button"
                    onClick={() => !disabled && setIsOpen(!isOpen)}
                    disabled={disabled}
                    className="w-full flex items-center justify-between py-2.5 pl-10 pr-3 bg-white dark:bg-slate-800 border-2 border-gray-300 dark:border-slate-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-blue-500 dark:focus:border-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:border-gray-400 dark:hover:border-slate-500 font-medium text-sm shadow-sm text-left"
                >
                    <span className="flex items-center gap-2 flex-1 mr-2">
                        <selectedOption.icon className={`w-5 h-5 absolute left-3 ${selectedOption.color}`} />
                        {selectedOption.label}
                    </span>
                    <ChevronDownIcon 
                        className={`w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform duration-200 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} 
                    />
                </button>
            </div>
            
            <DropdownPortal />
        </>
    );
};

export default CustomStatusSelect;