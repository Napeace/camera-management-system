import React, { useState, useRef } from 'react';
import { 
  VideoCameraIcon,
  UserGroupIcon,
  XMarkIcon,
  ArrowUpTrayIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  DocumentArrowUpIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import importService from '../../../services/importService';

const ImportDataModal = ({ isOpen, onClose, onImportSuccess }) => {
  const [selectedImport, setSelectedImport] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isImporting, setIsImporting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });
  const fileInputRef = useRef(null);

  const importOptions = [
    {
      id: 'cctv',
      title: 'Import Data CCTV',
      description: 'Import data CCTV dari file Excel (.xlsx)',
      icon: VideoCameraIcon,
      color: 'green',
      acceptedFormats: '.xlsx',
      disabled: false
    },
    {
      id: 'users',
      title: 'Import Data Pengguna',
      description: 'Import data pengguna dari file Excel (.xlsx)',
      icon: UserGroupIcon,
      color: 'purple',
      acceptedFormats: '.xlsx',
      disabled: false
    }
  ];

  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
    setTimeout(() => {
      setNotification({ show: false, type: '', message: '' });
    }, 5000);
  };

  const handleFileSelect = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      validateAndSetFile(file);
    }
  };

  const validateAndSetFile = (file) => {
    // Validasi ekstensi file
    if (!file.name.endsWith('.xlsx')) {
      showNotification('error', 'Format file tidak valid! Hanya file .xlsx yang diterima.');
      return;
    }

    setSelectedFile(file);
    showNotification('success', `File "${file.name}" berhasil dipilih.`);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      validateAndSetFile(file);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleImport = async () => {
    if (!selectedImport || !selectedFile) return;

    setIsImporting(true);
    
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      let result;
      if (selectedImport === 'cctv') {
        result = await importService.importCctv(formData);
        showNotification('success', `Import CCTV berhasil! ${result.imported_count} data berhasil diimport.`);
      } else if (selectedImport === 'users') {
        result = await importService.importUsers(formData);
        showNotification('success', `Import Users berhasil! ${result.imported_count || 'Beberapa'} data berhasil diimport.`);
      }

      // Callback untuk refresh data di parent component
      if (onImportSuccess) {
        onImportSuccess(selectedImport);
      }

      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (error) {
      console.error('Import error:', error);
      showNotification('error', error.message || 'Import gagal! Silakan coba lagi.');
    } finally {
      setIsImporting(false);
    }
  };

  const handleClose = () => {
    if (!isImporting) {
      setSelectedImport(null);
      setSelectedFile(null);
      setNotification({ show: false, type: '', message: '' });
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      onClose();
    }
  };

  if (!isOpen) return null;

  const selectedOption = importOptions.find(opt => opt.id === selectedImport);
  const canImport = selectedImport && selectedFile && !isImporting;

  const getColorClasses = (color, isSelected, isDisabled) => {
    const colors = {
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

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

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
            <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <ArrowUpTrayIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                Import Data
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Pilih jenis data dan upload file Excel
              </p>
            </div>
          </div>
          
          <button
            onClick={handleClose}
            disabled={isImporting}
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

          {/* Import Options */}
          <div className="space-y-3 mb-6">
            {importOptions.map((option) => {
              const isSelected = selectedImport === option.id;
              const colorClasses = getColorClasses(option.color, isSelected, option.disabled);
              const Icon = option.icon;

              return (
                <div key={option.id} className="relative">
                  <button
                    onClick={() => !option.disabled && setSelectedImport(option.id)}
                    disabled={isImporting || option.disabled}
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

          {/* File Upload Area */}
          {selectedImport && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <DocumentArrowUpIcon className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                <h3 className="font-semibold text-slate-800 dark:text-white">
                  Upload File Excel
                </h3>
              </div>

              {!selectedFile ? (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`
                    border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all
                    ${isDragging 
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                      : 'border-slate-300 dark:border-slate-600 hover:border-blue-400 dark:hover:border-blue-500'
                    }
                  `}
                >
                  <ArrowUpTrayIcon className="w-12 h-12 mx-auto mb-3 text-slate-400 dark:text-slate-500" />
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Klik untuk pilih file atau drag & drop
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Format yang diterima: {selectedOption?.acceptedFormats}
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={selectedOption?.acceptedFormats}
                    onChange={handleFileSelect}
                    className="hidden"
                    disabled={isImporting}
                  />
                </div>
              ) : (
                <div className="border-2 border-green-500 bg-green-50 dark:bg-green-900/20 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/50 flex items-center justify-center flex-shrink-0">
                      <DocumentArrowUpIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 dark:text-white truncate">
                        {selectedFile.name}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {formatFileSize(selectedFile.size)}
                      </p>
                    </div>
                    <button
                      onClick={handleRemoveFile}
                      disabled={isImporting}
                      className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors disabled:opacity-50"
                    >
                      <TrashIcon className="w-5 h-5 text-red-600 dark:text-red-400" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
          <button
            onClick={handleClose}
            disabled={isImporting}
            className="px-6 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
          >
            Batal
          </button>
          
          <button
            onClick={handleImport}
            disabled={!canImport}
            className={`
              px-6 py-2.5 rounded-xl font-medium transition-all
              ${canImport
                ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl'
                : 'bg-slate-300 dark:bg-slate-700 text-slate-500 dark:text-slate-500 cursor-not-allowed'
              }
            `}
          >
            {isImporting ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Mengimport...
              </span>
            ) : (
              'Import Data'
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

export default ImportDataModal;