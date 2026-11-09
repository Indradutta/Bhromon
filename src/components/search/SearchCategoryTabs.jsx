import React from 'react';
import { SEARCH_CATEGORIES } from './searchData';

export default function SearchCategoryTabs({ activeCategory, onSelectCategory }) {
  return (
    <div
      role="tablist"
      aria-label="Search travel categories"
      className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 pb-2 sm:pb-3 border-b border-[#E9E1D8] overflow-x-auto scrollbar-none"
    >
      {SEARCH_CATEGORIES.map(({ id, label, Icon }) => {
        const isActive = activeCategory === id;
        return (
          <button
            key={id}
            role="tab"
            aria-selected={isActive}
            id={`tab-${id}`}
            aria-controls={`panel-${id}`}
            type="button"
            onClick={() => onSelectCategory(id)}
            className={`relative flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-full text-[13px] sm:text-[14.5px] font-semibold tracking-wide transition-all whitespace-nowrap cursor-pointer select-none ${
              isActive
                ? 'text-[#B3452C] bg-[#F6EDE4]/70 font-bold'
                : 'text-[#6B7280] hover:text-[#1F2937] hover:bg-[#F7F3ED]/80'
            }`}
          >
            <Icon
              className={`w-4 h-4 shrink-0 transition-colors ${
                isActive ? 'text-[#B3452C]' : 'text-[#6B7280]'
              }`}
            />
            <span>{label}</span>

            {/* Active Terracotta Indicator Bar */}
            {isActive && (
              <span
                className="absolute -bottom-2 sm:-bottom-3 left-3 right-3 h-[2.5px] bg-[#B3452C] rounded-full transition-all"
                layoutid="activeTabIndicator"
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
