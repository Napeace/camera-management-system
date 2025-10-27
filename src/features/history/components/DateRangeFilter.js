// features/history/components/DateRangeFilter.js
import React from 'react';
import DatePicker from 'react-datepicker';
import { CalendarIcon } from '@heroicons/react/24/outline';
import "react-datepicker/dist/react-datepicker.css";

const DateRangeFilter = React.memo(({ 
  startDate, 
  endDate, 
  onStartDateChange, 
  onEndDateChange 
}) => {
  return (
    <>
      <style jsx>{`
        .custom-datepicker {
          width: 100%;
          padding-left: 2.5rem;
          padding-right: 0.75rem;
          padding-top: 0.625rem;
          padding-bottom: 0.625rem;
          background-color: white;
          border: 2px solid #d1d5db;
          border-radius: 0.75rem;
          color: #111827;
          font-weight: 500;
          font-size: 0.875rem;
          box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
          transition: all 0.2s;
          cursor: pointer;
        }

        .custom-datepicker:hover {
          border-color: #9ca3af;
        }

        .custom-datepicker:focus {
          outline: none;
          border-color: #3b82f6;
          ring: 2px;
          ring-color: #3b82f6;
        }

        .dark .custom-datepicker {
          background-color: #1e293b;
          border-color: #475569;
          color: white;
        }

        .dark .custom-datepicker:hover {
          border-color: #64748b;
        }

        .dark .custom-datepicker:focus {
          border-color: #2563eb;
          ring-color: #2563eb;
        }

        .react-datepicker-wrapper {
          width: 100%;
        }

        .react-datepicker__input-container {
          width: 100%;
        }

        /* Custom Datepicker Popup Styles */
        .react-datepicker {
          font-family: inherit;
          border: 2px solid #d1d5db;
          border-radius: 1rem;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
          background-color: white;
        }

        .dark .react-datepicker {
          background-color: #1e293b;
          border-color: #475569;
        }

        .react-datepicker__header {
          background-color: #f9fafb;
          border-bottom: 2px solid #e5e7eb;
          border-radius: 1rem 1rem 0 0;
          padding: 1rem;
          overflow: hidden;
        }

        .dark .react-datepicker__header {
          background-color: #0f172a;
          border-bottom-color: #334155;
        }

        .react-datepicker__header:not(.react-datepicker__header--has-time-select) {
          border-top-right-radius: 1rem;
        }

        .react-datepicker__current-month {
          color: #111827;
          font-weight: 600;
          font-size: 0.95rem;
        }

        .dark .react-datepicker__current-month {
          color: white;
        }

        .react-datepicker__day-name {
          color: #6b7280;
          font-weight: 600;
          font-size: 0.75rem;
        }

        .dark .react-datepicker__day-name {
          color: #9ca3af;
        }

        /* FIXED HEIGHT - Ensures 6 rows always */
        .react-datepicker__month {
          height: auto;
          min-height: 180px; /* 6 rows x 30px */
        }

        .react-datepicker__week {
          height: 30px;
        }

        .react-datepicker__day {
          color: #374151;
          border-radius: 0.375rem;
          transition: all 0.15s;
          font-weight: 500;
          width: 1.875rem;
          height: 1.875rem;
          line-height: 1.875rem;
          margin: 0.1rem;
          font-size: 0.8125rem;
        }

        .dark .react-datepicker__day {
          color: #d1d5db;
        }

        .react-datepicker__day:hover {
          background-color: #e5e7eb;
          border-radius: 0.5rem;
        }

        .dark .react-datepicker__day:hover {
          background-color: #334155;
        }

        .react-datepicker__day--selected {
          background-color: #3b82f6 !important;
          color: white !important;
          font-weight: 600;
        }

        .react-datepicker__day--keyboard-selected {
          background-color: #60a5fa;
          color: white;
        }

        .dark .react-datepicker__day--keyboard-selected {
          background-color: #2563eb;
        }

        .react-datepicker__day--in-range {
          background-color: #dbeafe !important;
          color: #1e40af !important;
        }

        .dark .react-datepicker__day--in-range {
          background-color: #1e3a8a !important;
          color: #93c5fd !important;
        }

        .react-datepicker__day--disabled {
          color: #d1d5db;
          cursor: not-allowed;
        }

        .dark .react-datepicker__day--disabled {
          color: #475569;
        }

        .react-datepicker__day--outside-month {
          color: #9ca3af;
        }

        .dark .react-datepicker__day--outside-month {
          color: #475569;
        }

        .react-datepicker__navigation {
          top: 1rem;
        }

        .react-datepicker__navigation-icon::before {
          border-color: #6b7280;
        }

        .dark .react-datepicker__navigation-icon::before {
          border-color: #9ca3af;
        }

        .react-datepicker__triangle {
          display: none;
        }
      `}</style>

      <div className="flex gap-3">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Date Range From
          </label>
          <div className="relative">
            <CalendarIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 pointer-events-none z-10" />
            <DatePicker
              selected={startDate}
              onChange={onStartDateChange}
              selectsStart
              startDate={startDate}
              endDate={endDate}
              maxDate={endDate || new Date()}
              dateFormat="dd/MM/yyyy"
              placeholderText="Select start date"
              className="custom-datepicker"
              calendarClassName="custom-calendar"
              fixedHeight
              showWeekNumbers={false}
              onKeyDown={(e) => e.preventDefault()}
              onPaste={(e) => e.preventDefault()}
            />
          </div>
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            To
          </label>
          <div className="relative">
            <CalendarIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 pointer-events-none z-10" />
            <DatePicker
              selected={endDate}
              onChange={onEndDateChange}
              selectsEnd
              startDate={startDate}
              endDate={endDate}
              minDate={startDate}
              maxDate={new Date()}
              dateFormat="dd/MM/yyyy"
              placeholderText="Select end date"
              className="custom-datepicker"
              calendarClassName="custom-calendar"
              fixedHeight
              showWeekNumbers={false}
              onKeyDown={(e) => e.preventDefault()}
              onPaste={(e) => e.preventDefault()}
            />
          </div>
        </div>
      </div>
    </>
  );
});

DateRangeFilter.displayName = 'DateRangeFilter';

export default DateRangeFilter;