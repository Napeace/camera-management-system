import React from 'react';

const Pagination = ({ 
  currentPage, 
  totalPages, 
  totalItems, 
  itemsPerPage,
  onPageChange,
  itemName = 'items',
  maxPageButtons = 5
}) => {
  if (totalPages <= 1) {
    return (
      <div className="px-4 lg:px-6 py-2 lg:py-3 bg-white dark:bg-slate-900/80 border border-gray-200 dark:border-slate-500/30 rounded-b-xl text-xs lg:text-sm text-gray-400 animate-fadeIn">
        Menampilkan {totalItems} {itemName}
      </div>
    );
  }

  const getPageNumbers = () => {
    const pages = [];
    // Responsive: show less buttons on smaller screens
    const responsiveMaxButtons = window.innerWidth < 1024 ? 3 : maxPageButtons;
    const halfMaxButtons = Math.floor(responsiveMaxButtons / 2);
    
    let startPage = Math.max(1, currentPage - halfMaxButtons);
    let endPage = Math.min(totalPages, currentPage + halfMaxButtons);
    
    // Adjust if we're near the start or end
    if (currentPage <= halfMaxButtons) {
      endPage = Math.min(totalPages, responsiveMaxButtons);
    }
    if (currentPage > totalPages - halfMaxButtons) {
      startPage = Math.max(1, totalPages - responsiveMaxButtons + 1);
    }
    
    // Add first page and ellipsis if needed
    if (startPage > 1) {
      pages.push(1);
      if (startPage > 2) {
        pages.push('...');
      }
    }
    
    // Add page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    // Add last page and ellipsis if needed
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push('...');
      }
      pages.push(totalPages);
    }
    
    return pages;
  };

  const pageNumbers = getPageNumbers();
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);
  
  // ✅ FIX: Calculate items shown in current page
  const itemsInCurrentPage = endItem - startItem + 1;

  return (
    <>
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
      
      <div className="px-4 lg:px-6 py-3 lg:py-4 bg-white dark:bg-slate-900/80 border border-gray-200 dark:border-slate-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 lg:gap-4 animate-fadeIn rounded-b-xl">
        {/* Info - Responsive text size */}
        <div className="text-xs lg:text-sm text-gray-400 text-center sm:text-left">
          Menampilkan <span className="font-medium text-white">{itemsInCurrentPage}</span> dari <span className="font-medium text-white">{totalItems}</span> {itemName}
        </div>
        
        {/* Buttons - Responsive size & spacing */}
        <div className="flex items-center gap-1 lg:gap-2">
          {/* Previous Button */}
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="w-10 lg:w-14 h-7 lg:h-8 flex items-center justify-center rounded text-xs lg:text-sm font-medium transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed bg-slate-800/50 text-gray-300 hover:bg-slate-700/70 border border-blue-100/30"
          >
            &lt;
          </button>
          
          {/* Page Numbers - Responsive sizing */}
          <div className="flex gap-1 lg:gap-2">
            {pageNumbers.map((pageNum, idx) => {
              if (pageNum === '...') {
                return (
                  <span key={`ellipsis-${idx}`} className="px-1 lg:px-2 text-gray-500 text-xs lg:text-sm">
                    ...
                  </span>
                );
              }
              
              return (
                <button
                  key={pageNum}
                  onClick={() => onPageChange(pageNum)}
                  className={`w-7 lg:w-8 h-7 lg:h-8 flex items-center justify-center rounded text-xs lg:text-sm font-medium transition-all duration-200 border ${
                    currentPage === pageNum
                      ? 'bg-blue-600 text-white border-blue-100/30'
                      : 'bg-slate-800/50 text-gray-300 hover:bg-slate-700/70 border-blue-100/30'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          {/* Next Button */}
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="w-10 lg:w-14 h-7 lg:h-8 flex items-center justify-center rounded text-xs lg:text-sm font-medium transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed bg-slate-800/50 text-gray-300 hover:bg-slate-700/70 border border-blue-100/30"
          >
            &gt;
          </button>
        </div>
      </div>
    </>
  );
};

export default Pagination;