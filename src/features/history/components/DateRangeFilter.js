import React, { useState, useEffect, useRef } from 'react';
import { CalendarDateRangeIcon, XMarkIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

const DateRangeFilter = ({ 
  startDate, 
  endDate, 
  onStartDateChange, 
  onEndDateChange 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectingStart, setSelectingStart] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [tempStartDate, setTempStartDate] = useState(null);
  const [tempEndDate, setTempEndDate] = useState(null);
  const dropdownRef = useRef(null);

  // Initialize current month based on startDate or today
  useEffect(() => {
    if (startDate) {
      setCurrentMonth(new Date(startDate));
    } else {
      setCurrentMonth(new Date());
    }
  }, [startDate]);

  // Sync temp dates with props when opening
  useEffect(() => {
    if (isOpen) {
      setTempStartDate(startDate);
      setTempEndDate(endDate);
      setSelectingStart(!startDate); // If no startDate, select start first
    }
  }, [isOpen, startDate, endDate]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSelectingStart(true);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Format display value
  const getDisplayValue = () => {
    if (!startDate && !endDate) return '';
    if (startDate && !endDate) {
      return startDate.toLocaleDateString('id-ID');
    }
    if (startDate && endDate) {
      return `${startDate.toLocaleDateString('id-ID')} - ${endDate.toLocaleDateString('id-ID')}`;
    }
    return '';
  };

  // ✅ FIXED: Handle date selection with validation
  const handleDateClick = (date) => {
    if (selectingStart) {
      setTempStartDate(date);
      setTempEndDate(null); // Reset end date when selecting new start
      setSelectingStart(false); // Switch to end date mode
    } else {
      // Validate end date must be >= start date
      if (tempStartDate && date < tempStartDate) {
        return;
      }
      setTempEndDate(date);
      
      // ✅ Only apply filter when BOTH dates are selected
      onStartDateChange(tempStartDate);
      onEndDateChange(date);
      
      setIsOpen(false); // Close after selecting end date
      setSelectingStart(true); // Reset for next time
    }
  };

  // ✅ FIXED: Clear filter - reset both dates
  const handleClearFilter = () => {
    setTempStartDate(null);
    setTempEndDate(null);
    onStartDateChange(null);
    onEndDateChange(null);
  };

  // Navigate month
  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    const today = new Date();
    const nextMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1);
    if (nextMonth <= today) {
      setCurrentMonth(nextMonth);
    }
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const startPadding = firstDay.getDay(); // 0 = Sunday
    const days = [];

    // Add padding for days before month starts
    for (let i = 0; i < startPadding; i++) {
      days.push(null);
    }

    // Add actual days
    for (let day = 1; day <= lastDay.getDate(); day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  // Check if date is in range
  const isInRange = (date) => {
    if (!date || !tempStartDate || !tempEndDate) return false;
    return date >= tempStartDate && date <= tempEndDate;
  };

  // Check if date is selected
  const isSelected = (date) => {
    if (!date) return false;
    if (tempStartDate && date.toDateString() === tempStartDate.toDateString()) return true;
    if (tempEndDate && date.toDateString() === tempEndDate.toDateString()) return true;
    return false;
  };

  // Check if date is today
  const isToday = (date) => {
    if (!date) return false;
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  // Check if date is in future
  const isFuture = (date) => {
    if (!date) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date > today;
  };

  const calendarDays = generateCalendarDays();
  const weekDays = ['MIN', 'SEN', 'SEL', 'RAB', 'KAM', 'JUM', 'SAB'];

  const isNextMonthDisabled = () => {
    const today = new Date();
    const nextMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1);
    return nextMonth > today;
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
        Pilih Tanggal
      </label>
      
      <div className="relative" ref={dropdownRef}>
        {/* Input Field - Responsive Theme */}
        <div className="relative">
          <CalendarDateRangeIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 pointer-events-none z-10" />
          <input
            type="text"
            readOnly
            value={getDisplayValue()}
            onClick={() => setIsOpen(!isOpen)}
            placeholder="Tanggal Mulai - Tanggal Akhir"
            className="w-full pl-10 pr-10 p-2 bg-white dark:bg-slate-800/70 border-2 border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent cursor-pointer transition-all"
          />
          {/* ✅ ADDED: Clear button when dates are set */}
          {(startDate || endDate) && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleClearFilter();
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors z-10"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Calendar Dropdown - Responsive Theme */}
        {isOpen && (
          <div className="absolute top-full left-2 mt-2 z-50 w-[400px] rounded-xl shadow-2xl overflow-hidden bg-white dark:bg-gradient-to-b dark:from-slate-900 dark:via-blue-900 dark:to-blue-800 border border-gray-200 dark:border-transparent p-5">
            {/* Inner Container - Responsive Background */}
            <div className="bg-gray-50/80 dark:bg-white/5 backdrop-blur-sm rounded-xl p-5 space-y-4 border border-gray-100 dark:border-white/10">
              
              {/* Header - Responsive */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 flex items-center justify-center bg-blue-100 dark:bg-blue-800/30 border border-blue-300 dark:border-blue-400/30 rounded-md">
                    <CalendarDateRangeIcon className="w-5 h-5 text-blue-600 dark:text-blue-300" />
                  </div>
                  <h3 className="text-base text-gray-900 dark:text-white font-semibold">Rentang Tanggal</h3>
                </div>
                <button 
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    setSelectingStart(true);
                  }}
                  className="text-gray-600 dark:text-white/70 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-white/10 rounded-lg p-1.5 transition-all"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>

              {/* Toggle Buttons - Responsive */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setSelectingStart(true)}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectingStart 
                      ? 'bg-blue-600 dark:bg-blue-500 text-white shadow-lg ring-2 ring-blue-300 dark:ring-blue-400' 
                      : 'bg-gray-200 dark:bg-slate-700/50 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-slate-600/50'
                  }`}
                >
                  Pilih Tanggal Mulai
                </button>
                <button
                  type="button"
                  onClick={() => setSelectingStart(false)}
                  disabled={!tempStartDate}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    !selectingStart 
                      ? 'bg-blue-600 dark:bg-blue-500 text-white shadow-lg ring-2 ring-blue-300 dark:ring-blue-400' 
                      : !tempStartDate
                      ? 'bg-gray-200 dark:bg-slate-800/50 text-gray-400 dark:text-gray-600 cursor-not-allowed opacity-50'
                      : 'bg-gray-200 dark:bg-slate-700/50 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-slate-600/50'
                  }`}
                >
                  Pilih Tanggal Akhir
                </button>
              </div>

              {/* Month Navigation - Responsive */}
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-slate-700/50 rounded-lg p-1.5 transition-all"
                >
                  <ChevronLeftIcon className="w-5 h-5" />
                </button>
                <span className="text-gray-900 dark:text-white font-semibold text-sm">
                  {currentMonth.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
                </span>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  disabled={isNextMonthDisabled()}
                  className="text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-slate-700/50 rounded-lg p-1.5 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRightIcon className="w-5 h-5" />
                </button>
              </div>

              {/* Calendar Grid - Responsive */}
              <div>
                {/* Week Days Header */}
                <div className="grid grid-cols-7 gap-0 mb-1">
                  {weekDays.map((day) => (
                    <div key={day} className="text-center text-xs font-semibold text-gray-600 dark:text-gray-400 py-1">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Days */}
                <div className="grid grid-cols-7 gap-1">
                  {calendarDays.map((date, index) => {
                    if (!date) {
                      return <div key={`empty-${index}`} className="aspect-square" />;
                    }

                    const selected = isSelected(date);
                    const inRange = isInRange(date);
                    const today = isToday(date);
                    const future = isFuture(date);
                    const disabled = future || (!selectingStart && tempStartDate && date < tempStartDate);

                    return (
                      <button
                        key={date.toISOString()}
                        type="button"
                        onClick={() => !disabled && handleDateClick(date)}
                        disabled={disabled}
                        className={`
                          aspect-square flex items-center justify-center rounded-lg text-sm font-medium transition-all
                          ${disabled 
                            ? 'text-gray-500 dark:text-gray-300 cursor-not-allowed opacity-40' 
                            : 'text-gray-800 dark:text-white cursor-pointer'}
                          ${selected 
                            ? 'bg-blue-600 dark:bg-blue-500 text-white font-bold shadow-lg scale-105 ring-2 ring-blue-400 dark:ring-blue-300' 
                            : ''}
                          ${inRange && !selected 
                            ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-900 dark:text-blue-200' 
                            : ''}
                          ${!selected && !inRange && !disabled 
                            ? 'hover:bg-gray-200 dark:hover:bg-slate-700/50 hover:scale-105' 
                            : ''}
                          ${today && !selected 
                            ? 'ring-2 ring-blue-500 dark:ring-blue-400 font-bold' 
                            : ''}
                        `}
                      >
                        {date.getDate()}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Footer Info */}
              <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded-full ring-2 ring-blue-500 dark:ring-blue-400"></div>
                      <span className="text-gray-400 dark:text-gray-400">Hari ini</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded bg-blue-600 dark:bg-blue-500"></div>
                      <span className="text-gray-400 dark:text-gray-400">Dipilih</span>
                    </div>
                  </div>
                  {tempStartDate && tempEndDate && (
                    <span className="text-gray-400 dark:text-gray-400 font-medium">
                      {Math.ceil((tempEndDate - tempStartDate) / (1000 * 60 * 60 * 24)) + 1} hari
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DateRangeFilter;