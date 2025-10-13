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

const ExportDataModal = ({ isOpen, onClose }) => {
  const [selectedExport, setSelectedExport] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });

  const exportOptions = [
    {
      id: 'sql',
      title: 'Export SQL Database',
      description: 'Export seluruh database dalam format SQL',
      icon: CircleStackIcon,
      color: 'blue',
      disabled: true
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
      disabled: true
    }
  ];

  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
    setTimeout(() => {
      setNotification({ show: false, type: '', message: '' });
    }, 5000);
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
      } else if (selectedExport === 'sql') {
        showNotification('error', 'Export SQL belum diimplementasikan');
      } else if (selectedExport === 'users') {
        showNotification('error', 'Export Users belum diimplementasikan');
      }
    } catch (error) {
      console.error('Export error:', error);
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

  if (!isOpen) return null;

  const getColorClasses = (color, isSelected, isDisabled) => {
    const colors = {
      blue: {
        border: isSelected ? 'border-blue-500' : 'border-slate-300 dark:border-slate-600',
        bg: isSelected ? 'bg-blue-50 dark:bg-blue-900/30' : 'bg-white dark:bg-slate-800',
        icon: 'text-blue-600 dark:text-blue-400',
        hover: !isDisabled ? 'hover:border-blue-400 dark:hover:border-blue-500' : ''
      },
      green: {
        border: isSelected ? 'border-green-500' : 'border-slate-300 dark:border-slate-600',
        bg: isSelected ? 'bg-green-50 dark:bg-green-900/30' : 'bg-white dark:bg-slate-800',
        icon: 'text-green-600 dark:text-green-400',
        hover: !isDisabled ? 'hover:border-green-400 dark:hover:border-green-500' : ''
      },
      purple: {
        border: isSelected ? 'border-purple-500' : 'border-slate-300 dark:border-slate-600',
        bg: isSelected ? 'bg-purple-50 dark:bg-purple-900/30' : 'bg-white dark:bg-slate-800',
        icon: 'text-purple-600 dark:text-purple-400',
        hover: !isDisabled ? 'hover:border-purple-400 dark:hover:border-purple-500' : ''
      }
    };
    return colors[color];
  };

  const selectedOption = exportOptions.find(opt => opt.id === selectedExport);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden border border-slate-300 dark:border-slate-700">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-300 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <ArrowDownTrayIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                Export Data
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Pilih jenis data yang ingin di-export
              </p>
            </div>
          </div>
          
          <button
            onClick={handleClose}
            disabled={isExporting}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            <XMarkIcon className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          </button>
        </div>

        {/* Content with Custom Scrollbar */}
        <div 
          className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]"
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: '#94a3b8 transparent'
          }}
        >
          {/* Notification */}
          {notification.show && (
            <div className={`
              mb-4 p-4 rounded-xl border-2 flex items-start gap-3
              ${notification.type === 'success' 
                ? 'bg-green-50 dark:bg-green-900/30 border-green-500 text-green-800 dark:text-green-200' 
                : 'bg-red-50 dark:bg-red-900/30 border-red-500 text-red-800 dark:text-red-200'
              }
            `}>
              {notification.type === 'success' ? (
                <CheckCircleIcon className="w-6 h-6 flex-shrink-0" />
              ) : (
                <ExclamationCircleIcon className="w-6 h-6 flex-shrink-0" />
              )}
              <p className="text-sm font-medium">{notification.message}</p>
            </div>
          )}

          <div className="space-y-3">
            {exportOptions.map((option) => {
              const isSelected = selectedExport === option.id;
              const colorClasses = getColorClasses(option.color, isSelected, option.disabled);
              const Icon = option.icon;

              return (
                <div key={option.id} className="relative">
                  <button
                    onClick={() => !option.disabled && setSelectedExport(option.id)}
                    disabled={isExporting || option.disabled}
                    className={`
                      w-full p-4 rounded-xl border-2 transition-all duration-200
                      ${colorClasses.bg} ${colorClasses.border} ${colorClasses.hover}
                      hover:shadow-md disabled:cursor-not-allowed
                      ${isSelected ? 'shadow-lg scale-[0.98]' : 'hover:scale-[0.99]'}
                      ${option.disabled ? 'opacity-60' : ''}
                    `}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`
                        w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0
                        ${isSelected ? 'bg-white dark:bg-slate-800' : 'bg-slate-50 dark:bg-slate-700/50'}
                      `}>
                        <Icon className={`w-7 h-7 ${colorClasses.icon}`} />
                      </div>
                      
                      <div className="flex-1 text-left">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-slate-800 dark:text-white">
                            {option.title}
                          </h3>
                          {option.disabled && (
                            <span className="px-2 py-0.5 text-xs font-medium bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded">
                              Segera Hadir
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {option.description}
                        </p>
                      </div>

                      <div className={`
                        w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-1
                        ${isSelected 
                          ? `border-${option.color}-500` 
                          : 'border-slate-300 dark:border-slate-600'
                        }
                      `}>
                        {isSelected && (
                          <div className={`w-3 h-3 rounded-full bg-${option.color}-500`} />
                        )}
                      </div>
                    </div>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
          <button
            onClick={handleClose}
            disabled={isExporting}
            className="px-6 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
          >
            Batal
          </button>
          
          <button
            onClick={handleExport}
            disabled={!selectedExport || isExporting || selectedOption?.disabled}
            className={`
              px-6 py-2.5 rounded-xl font-medium transition-all
              ${selectedExport && !isExporting && !selectedOption?.disabled
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
                : 'bg-slate-300 dark:bg-slate-700 text-slate-500 dark:text-slate-500 cursor-not-allowed'
              }
            `}
          >
            {isExporting ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Mengexport...
              </span>
            ) : (
              'Export Data'
            )}
          </button>
        </div>
      </div>

      {/* Custom Scrollbar CSS untuk Webkit Browsers */}
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