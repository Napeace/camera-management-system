// features/history/components/DateRangeFilter.js - FIXED VERSION
import React, { useRef } from 'react';
import DatePicker from 'react-datepicker';
import { CalendarIcon } from '@heroicons/react/24/outline';
import "react-datepicker/dist/react-datepicker.css";

const DateRangeFilter = React.memo(({ 
  startDate, 
  endDate, 
  onStartDateChange, 
  onEndDateChange 
}) => {
  const datePickerRef = useRef(null);

  // Handle range change - dipanggil ketika user select dates
  const handleRangeChange = (dates) => {
    const [start, end] = dates;
    
    console.log('📅 Date range changed:', { start, end });
    
    onStartDateChange(start);
    onEndDateChange(end);
    
    // 🔥 FIX: Auto-close calendar setelah end date dipilih
    if (start && end && datePickerRef.current) {
      console.log('✅ Both dates selected, closing calendar');
      datePickerRef.current.setOpen(false);
    }
  };

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

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
        Filter Berdasarkan Tanggal
      </label>
      <div className="relative">
        <CalendarIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 pointer-events-none z-10" />
        <DatePicker
          ref={datePickerRef}
          selected={startDate}
          onChange={handleRangeChange}
          startDate={startDate}
          endDate={endDate}
          selectsRange
          maxDate={new Date()}
          dateFormat="dd/MM/yyyy"
          placeholderText="Pilih Tanggal"
          className="custom-datepicker"
          calendarClassName="custom-calendar"
          fixedHeight
          showWeekNumbers={false}
          onKeyDown={(e) => e.preventDefault()}
          onPaste={(e) => e.preventDefault()}
          shouldCloseOnSelect={false}
          monthsShown={1}
          value={getDisplayValue()}
        />
      </div>
    </div>
  );
});

DateRangeFilter.displayName = 'DateRangeFilter';

export default DateRangeFilter;