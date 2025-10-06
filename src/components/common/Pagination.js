import React from 'react';

const Pagination = ({ 
  currentPage, 
  totalPages, 
  totalItems, 
  itemsPerPage,
  onPageChange,
  itemName = 'items',
  showFirstLast = true,
  maxPageButtons = 5
}) => {
  if (totalPages <= 1) {
    return (
      <div className="px-6 py-3 bg-gray-50 dark:bg-slate-900/30 border-t border-gray-200 dark:border-slate-700/50 text-sm text-gray-600 dark:text-gray-400 animate-fadeIn">
        Menampilkan {totalItems} {itemName}
      </div>
    );
  }

  const getPageNumbers = () => {
    const pages = [];
    const halfMaxButtons = Math.floor(maxPageButtons / 2);
    
    let startPage = Math.max(1, currentPage - halfMaxButtons);
    let endPage = Math.min(totalPages, currentPage + halfMaxButtons);
    
    // Adjust if we're near the start or end
    if (currentPage <= halfMaxButtons) {
      endPage = Math.min(totalPages, maxPageButtons);
    }
    if (currentPage > totalPages - halfMaxButtons) {
      startPage = Math.max(1, totalPages - maxPageButtons + 1);
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
      
      <div className="px-6 py-4 bg-gray-50 dark:bg-slate-900/30 border-t border-gray-200 dark:border-slate-700/50 flex flex-col sm:flex-row items-center justify-between gap-4 animate-fadeIn">
        {/* Info */}
        <div className="text-sm text-gray-600 dark:text-gray-400 transition-all duration-300">
          Menampilkan <span className="font-semibold text-gray-800 dark:text-gray-200">{startItem}-{endItem}</span> dari <span className="font-semibold text-gray-800 dark:text-gray-200">{totalItems}</span> {itemName} (Halaman <span className="font-semibold text-gray-800 dark:text-gray-200">{currentPage}</span> dari <span className="font-semibold text-gray-800 dark:text-gray-200">{totalPages}</span>)
        </div>
        
        {/* Buttons */}
        <div className="flex items-center gap-2 flex-wrap justify-center">
          {showFirstLast && (
            <button
              onClick={() => onPageChange(1)}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-slate-600 hover:scale-105 active:scale-95 hover:shadow-md disabled:hover:scale-100 disabled:hover:shadow-none"
            >
              First
            </button>
          )}
          
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-slate-600 hover:scale-105 active:scale-95 hover:shadow-md disabled:hover:scale-100 disabled:hover:shadow-none"
          >
            Prev
          </button>
          
          {/* Page Numbers */}
          <div className="flex gap-1">
            {pageNumbers.map((pageNum, idx) => {
              if (pageNum === '...') {
                return (
                  <span key={`ellipsis-${idx}`} className="px-2 text-gray-500 animate-pulse">
                    ...
                  </span>
                );
              }
              
              return (
                <button
                  key={pageNum}
                  onClick={() => onPageChange(pageNum)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 active:scale-95 ${
                    currentPage === pageNum
                      ? 'bg-blue-600 dark:bg-blue-500 text-white shadow-lg scale-105 ring-2 ring-blue-300 dark:ring-blue-400/50'
                      : 'bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-slate-600 hover:shadow-md'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-slate-600 hover:scale-105 active:scale-95 hover:shadow-md disabled:hover:scale-100 disabled:hover:shadow-none"
          >
            Next
          </button>
          
          {showFirstLast && (
            <button
              onClick={() => onPageChange(totalPages)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-slate-600 hover:scale-105 active:scale-95 hover:shadow-md disabled:hover:scale-100 disabled:hover:shadow-none"
            >
              Last
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default Pagination;