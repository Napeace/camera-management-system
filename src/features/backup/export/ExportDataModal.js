import React, { useState } from 'react';
import { 
  CircleStackIcon,
  VideoCameraIcon,
  UserGroupIcon,
  XMarkIcon,
  ArrowDownTrayIcon,
  CheckCircleIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import exportService from '../../../services/exportService';
import userService from '../../../services/userService';

const ExportDataModal = ({ isOpen, onClose }) => {
  const [selectedExport, setSelectedExport] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });

  const exportOptions = [
    {
      id: 'sql',
      title: 'Export Data SQL',
      description: 'Export seluruh database dalam format SQL',
      icon: CircleStackIcon,
      color: 'blue',
      disabled: false // ✅ Enabled
    },
    {
      id: 'cctv',
      title: 'Export Data CCTV',
      description: 'Export data CCTV dalam format Excel (.xlsx)',
      icon: VideoCameraIcon,
      color: 'green',
      disabled: false
    },
    {
      id: 'users',
      title: 'Export Data Pengguna',
      description: 'Export data pengguna dalam format Excel (.xlsx)',
      icon: UserGroupIcon,
      color: 'purple',
      disabled: false
    }
  ];

  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
    setTimeout(() => {
      setNotification({ show: false, type: '', message: '' });
    }, 5000);
  };

  const downloadBlobFile = (response, defaultFilename) => {
    const blob = new Blob([response.data], { 
      type: response.headers['content-type'] || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    
    let filename = defaultFilename;
    const contentDisposition = response.headers['content-disposition'];
    
    if (contentDisposition) {
      const patterns = [
        /filename\*?=['"]?(?:UTF-8'')?([^'";]+)['"]?/i,
        /filename=['"]([^'"]+)['"]/i,
        /filename=([^;,\s]+)/i,
      ];
      
      for (const pattern of patterns) {
        const match = contentDisposition.match(pattern);
        if (match && match[1]) {
          try {
            filename = decodeURIComponent(match[1].trim());
            break;
          } catch (e) {
            filename = match[1].trim();
            break;
          }
        }
      }
    }
    
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    
    link.parentNode.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    return filename;
  };

  const handleExport = async () => {
    if (!selectedExport) return;

    setIsExporting(true);
    
    try {
      if (selectedExport === 'cctv') {
        await exportService.exportCctv('xlsx');
        showNotification('success', 'Export CCTV berhasil! File Excel telah diunduh.');
        
        setTimeout(() => {
          handleClose();
        }, 1000);
      } else if (selectedExport === 'users') {
        console.log('🚀 Starting user export...');
        
        const response = await userService.exportUsers('xlsx');
        const filename = downloadBlobFile(response, 'Data_Pengguna.xlsx');
        
        console.log('✅ User export successful:', filename);
        showNotification('success', `Export Pengguna berhasil! File "${filename}" telah diunduh.`);
        
        setTimeout(() => {
          handleClose();
        }, 1000);
      } else if (selectedExport === 'sql') {
        // ✅ NEW: Export SQL Database Implementation
        console.log('🚀 Starting SQL database export...');
        
        const result = await exportService.exportSql(); // Export full database
        
        console.log('✅ SQL export successful:', result.filename);
        showNotification('success', `Export SQL berhasil! File "${result.filename}" telah diunduh.`);
        
        setTimeout(() => {
          handleClose();
        }, 1000);
      }
    } catch (error) {
      console.error('❌ Export error:', error);
      showNotification('error', error.message || 'Export gagal! Silakan coba lagi.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleClose = () => {
    if (!isExporting) {
      setSelectedExport(null);
      setNotification({ show: false, type: '', message: '' });
      onClose();
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !isExporting) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const getColorClasses = (color, isSelected) => {
    if (isSelected) {
      // All selected options use blue gradient (dark to light from right)
      return {
        border: 'border-blue-400/50',
        bg: 'bg-gradient-to-l from-blue-900 to-blue-600',
        icon: 'text-white',
        iconBg: 'bg-blue-600',
        iconBorder: 'border border-white',
        title: 'text-white',
        desc: 'text-blue-100',
        hover: ''
      };
    }
    
    // Unselected state
    return {
      border: 'border-white/10',
      bg: 'bg-white/5',
      icon: 'text-gray-400 dark:text-gray-500',
      iconBg: 'bg-white/5',
      iconBorder: 'border border-gray-500',
      title: 'text-gray-900 dark:text-white',
      desc: 'text-gray-600 dark:text-white/60',
      hover: 'hover:bg-white/10'
    };
  };

  const selectedOption = exportOptions.find(opt => opt.id === selectedExport);

  return (
    <div 
      onClick={handleBackdropClick}
      className="fixed inset-0 bg-black/70 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    >
      {/* Outer Container */}
      <div className="rounded-md shadow-2xl max-w-2xl w-full overflow-hidden bg-white dark:bg-gradient-to-b dark:from-slate-950 dark:to-blue-800 border border-blue-300 dark:border-slate-800 p-5">
        
        {/* Inner Container */}
        <div className="bg-gray-50/80 dark:bg-white/5 backdrop-blur-sm rounded-md p-5 space-y-4">
          
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 flex items-center justify-center bg-blue-100 dark:bg-blue-800/30 border border-blue-300 dark:border-blue-800/20 rounded-md">
                <ArrowDownTrayIcon className="w-5 h-5 text-blue-600 dark:text-blue-700" />
              </div>
              <div>
                <h2 className="text-xl text-gray-900 dark:text-white font-semibold">Export Data</h2>
                <p className="text-sm text-gray-600 dark:text-white/60">Pilih jenis data yang ingin di-export</p>
              </div>
            </div>
            
            <button
              onClick={handleClose}
              disabled={isExporting}
              className="text-gray-600 dark:text-white/70 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-white/10 rounded-md p-1.5 disabled:opacity-50 transition-all"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
          
          {/* Border separator */}
          <div className="h-px bg-gray-200 dark:bg-white/10"></div>

          {/* Notification */}
          {notification.show && (
            <div className={`
              p-4 rounded-md border flex items-start gap-3
              ${notification.type === 'success' 
                ? 'bg-green-100 dark:bg-green-500/20 border-green-300 dark:border-green-400/40' 
                : 'bg-red-100 dark:bg-red-500/20 border-red-300 dark:border-red-400/40'
              }
            `}>
              {notification.type === 'success' ? (
                <CheckCircleIcon className={`w-5 h-5 flex-shrink-0 ${notification.type === 'success' ? 'text-green-600 dark:text-green-300' : 'text-red-600 dark:text-red-300'}`} />
              ) : (
                <ExclamationCircleIcon className={`w-5 h-5 flex-shrink-0 ${notification.type === 'success' ? 'text-green-600 dark:text-green-300' : 'text-red-600 dark:text-red-300'}`} />
              )}
              <p className={`text-sm font-medium ${notification.type === 'success' ? 'text-green-700 dark:text-green-200' : 'text-red-700 dark:text-red-200'}`}>
                {notification.message}
              </p>
            </div>
          )}

          {/* Export Options */}
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2" style={{
            scrollbarWidth: 'thin',
            scrollbarColor: '#94a3b8 transparent',
          }}>
            {exportOptions.map((option) => {
              const isSelected = selectedExport === option.id;
              const colorClasses = getColorClasses(option.color, isSelected);
              const Icon = option.icon;

              return (
                <button
                  key={option.id}
                  onClick={() => !option.disabled && setSelectedExport(option.id)}
                  disabled={isExporting || option.disabled}
                  className={`
                    w-full p-4 rounded-md border transition-all duration-200
                    ${colorClasses.bg} ${colorClasses.border} ${!option.disabled && colorClasses.hover}
                    disabled:cursor-not-allowed disabled:opacity-60
                    ${isSelected ? 'shadow-lg scale-[0.98]' : 'hover:scale-[0.99]'}
                  `}
                >
                  <div className="flex items-start gap-4">
                    <div className={`
                      w-12 h-12 rounded-md flex items-center justify-center flex-shrink-0
                      ${colorClasses.iconBg}
                      ${colorClasses.iconBorder}
                    `}>
                      <Icon className={`w-6 h-6 ${colorClasses.icon}`} />
                    </div>
                    
                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className={`font-semibold ${colorClasses.title}`}>
                          {option.title}
                        </h3>
                        {option.disabled && (
                          <span className="px-2 py-0.5 text-xs font-medium bg-gray-300 dark:bg-white/20 text-gray-700 dark:text-white/70 rounded">
                            Segera Hadir
                          </span>
                        )}
                      </div>
                      <p className={`text-sm ${colorClasses.desc}`}>
                        {option.description}
                      </p>
                    </div>

                    <div className={`
                      w-4 h-4 rounded-full border border-1 flex items-center justify-center flex-shrink-0 mt-1
                      ${isSelected 
                        ? 'border-blue-500' 
                        : 'border-gray-300 dark:border-white/30'
                      }
                    `}>
                      {isSelected && (
                        <div className="w-3.5 h-3.5 rounded-full bg-gray-400/80" />
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Buttons - Outside Inner Container */}
        <div className="flex gap-3 justify-end mt-4">
          <button
            onClick={handleClose}
            disabled={isExporting}
            className="px-6 py-2.5 bg-gray-300 dark:bg-gray-400/30 rounded-md text-gray-700 dark:text-gray-200 text-sm font-medium hover:bg-gray-400 dark:hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Batal
          </button>
          
          <button
            onClick={handleExport}
            disabled={!selectedExport || isExporting || selectedOption?.disabled}
            className="px-8 py-2.5 bg-gray-300 dark:bg-gray-400/30 rounded-md text-gray-700 dark:text-gray-200 text-sm font-medium hover:bg-gray-400 dark:hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {isExporting && (
              <svg className="animate-spin h-5 w-5 text-gray-700 dark:text-gray-200" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {isExporting ? 'Mengexport...' : 'Export Data'}
          </button>
        </div>
      </div>

      {/* Custom Scrollbar CSS */}
      <style jsx>{`
        div::-webkit-scrollbar {
          width: 8px;
        }
        div::-webkit-scrollbar-track {
          background: transparent;
        }
        div::-webkit-scrollbar-thumb {
          background: #94a3b8;
          border-radius: 4px;
        }
        div::-webkit-scrollbar-thumb:hover {
          background: #64748b;
        }
      `}</style>
    </div>
  );
};

export default ExportDataModal;