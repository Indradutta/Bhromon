import React, { useState, useEffect, useRef } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { formatReadableDate, toISODateString } from './searchData';
import MobileBottomSheet from './MobileBottomSheet';

const DAYS_OF_WEEK = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function DatePickerPopover({
  value,
  onChange,
  dateLabel,
  isOpen,
  onToggle,
  onClose,
  isMobile,
}) {
  const containerRef = useRef(null);

  // Parse initial selected date or default to +14 days from today
  const selectedDate = value ? new Date(value + 'T00:00:00') : new Date();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Month navigation state
  const [currentMonth, setCurrentMonth] = useState(() => {
    return isNaN(selectedDate.getTime()) ? today.getMonth() : selectedDate.getMonth();
  });
  const [currentYear, setCurrentYear] = useState(() => {
    return isNaN(selectedDate.getTime()) ? today.getFullYear() : selectedDate.getFullYear();
  });

  // Pending selected date for Apply/Done interaction
  const [pendingDate, setPendingDate] = useState(() => {
    return value || toISODateString(selectedDate);
  });

  // Sync when value prop changes
  useEffect(() => {
    if (value) {
      setPendingDate(value);
      const d = new Date(value + 'T00:00:00');
      if (!isNaN(d.getTime())) {
        setCurrentMonth(d.getMonth());
        setCurrentYear(d.getFullYear());
      }
    }
  }, [value]);

  // Outside click dismissal on desktop
  useEffect(() => {
    if (!isOpen || isMobile) return;

    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen, isMobile, onClose]);

  // Escape key handler
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Month navigation
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  // Calendar matrix calculations
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const handleSelectDay = (day) => {
    const d = new Date(currentYear, currentMonth, day);
    if (d < today) return; // Prevent past date selection
    const iso = toISODateString(d);
    setPendingDate(iso);
  };

  const handleApply = () => {
    if (pendingDate) {
      onChange(pendingDate);
    }
    onClose();
  };

  const handleCancel = () => {
    setPendingDate(value || toISODateString(today));
    onClose();
  };

  // Check if prev month navigation should be disabled (cannot go before current month/year)
  const isPrevDisabled =
    currentYear < today.getFullYear() ||
    (currentYear === today.getFullYear() && currentMonth <= today.getMonth());

  // Render Calendar Grid
  const renderCalendar = () => {
    const calendarDays = [];

    // Empty offset cells
    for (let i = 0; i < firstDayOfMonth; i++) {
      calendarDays.push(<div key={`empty-${i}`} className="w-8 h-8 sm:w-9 sm:h-9" />);
    }

    // Days in current month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateObj = new Date(currentYear, currentMonth, day);
      dateObj.setHours(0, 0, 0, 0);
      const isPast = dateObj < today;
      const isCurrentDay = dateObj.getTime() === today.getTime();
      const isoStr = toISODateString(dateObj);
      const isSelected = pendingDate === isoStr;

      calendarDays.push(
        <button
          key={day}
          type="button"
          disabled={isPast}
          onClick={() => handleSelectDay(day)}
          className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full text-xs sm:text-[13px] font-semibold flex items-center justify-center transition-all select-none ${
            isSelected
              ? 'bg-[#B3452C] text-white shadow-xs font-bold'
              : isPast
              ? 'text-[#A3A3A3]/50 cursor-not-allowed'
              : isCurrentDay
              ? 'border border-[#B3452C] text-[#B3452C] hover:bg-[#F6EDE4]'
              : 'text-[#1F2937] hover:bg-[#F7F3ED] hover:text-[#B3452C] cursor-pointer'
          }`}
        >
          {day}
        </button>
      );
    }

    return (
      <div className="w-full">
        {/* Month & Year Navigation Header */}
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="font-display font-bold text-base text-[#1F2937]">
            {MONTH_NAMES[currentMonth]} {currentYear}
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={isPrevDisabled}
              onClick={handlePrevMonth}
              aria-label="Previous month"
              className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                isPrevDisabled
                  ? 'text-stone-300 cursor-not-allowed'
                  : 'text-[#1F2937] hover:bg-[#F7F3ED] cursor-pointer'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleNextMonth}
              aria-label="Next month"
              className="w-7 h-7 rounded-full flex items-center justify-center text-[#1F2937] hover:bg-[#F7F3ED] transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-1 text-center mb-2">
          {DAYS_OF_WEEK.map((d) => (
            <div
              key={d}
              className="w-8 sm:w-9 text-[11px] font-bold text-[#6B7280] uppercase tracking-wider"
            >
              {d}
            </div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-1 justify-items-center mb-4">
          {calendarDays}
        </div>

        {/* Quick presets or helpers */}
        <div className="pt-3 border-t border-[#F0EBE5] flex items-center justify-between gap-2">
          <div className="text-xs text-[#6B7280] font-medium truncate">
            {pendingDate ? formatReadableDate(pendingDate) : 'Select a date'}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCancel}
              className="px-3 py-1.5 rounded-full text-xs font-semibold text-[#6B7280] hover:bg-[#F7F3ED] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="px-4 py-1.5 rounded-full text-xs font-semibold bg-[#B3452C] hover:bg-[#963922] text-white shadow-xs transition-all cursor-pointer"
            >
              Apply
            </button>
          </div>
        </div>
      </div>
    );
  };

  const readableDisplay = formatReadableDate(value) || 'Select date';

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Trigger Box */}
      <div
        onClick={() => onToggle(!isOpen)}
        className={`w-full p-2.5 sm:p-3 rounded-2xl transition-all cursor-pointer select-none ${
          isOpen ? 'bg-[#F6EDE4]/60' : 'hover:bg-[#F7F3ED]'
        }`}
      >
        <label className="text-[11px] sm:text-[12px] font-bold text-[#1F2937] uppercase tracking-wider block mb-0.5 cursor-pointer">
          {dateLabel || 'TRAVEL DATE'}
        </label>
        <div className="flex items-center gap-2.5">
          <CalendarIcon className="w-4 h-4 text-[#B3452C] shrink-0 stroke-[2.2]" />
          <span className="text-[14.5px] sm:text-[16px] font-medium text-[#1F2937] truncate">
            {readableDisplay}
          </span>
        </div>
      </div>

      {/* Desktop Popover */}
      {isOpen && !isMobile && (
        <div
          role="dialog"
          aria-label="Select travel date"
          className="absolute left-0 top-full mt-2 w-[310px] sm:w-[330px] bg-white rounded-2xl shadow-[0_16px_36px_rgba(16,31,49,0.14)] border border-[#E9E1D8] p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-180"
        >
          {renderCalendar()}
        </div>
      )}

      {/* Mobile Bottom Sheet */}
      {isMobile && (
        <MobileBottomSheet
          isOpen={isOpen}
          onClose={onClose}
          title={dateLabel || 'Select Travel Date'}
          subtitle="Choose your preferred journey date"
        >
          {renderCalendar()}
        </MobileBottomSheet>
      )}
    </div>
  );
}
