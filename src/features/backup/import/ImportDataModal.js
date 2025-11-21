import React, { useState, useRef } from 'react';
import { 
  VideoCameraIcon,
  UserGroupIcon,
  XMarkIcon,
  ArrowUpTrayIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  DocumentArrowUpIcon,
  TrashIcon,
  InformationCircleIcon
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
      templateInfo: 'Kolom: Nama CCTV, Lokasi, IP Address, Status',
      disabled: false
    },
    {
      id: 'users',
      title: 'Import Data Pengguna',
      description: 'Import data pengguna dari file Excel (.xlsx)',
      icon: UserGroupIcon,
      color: 'purple',
      acceptedFormats: '.xlsx',
      templateInfo: 'Kolom: Nama, Username, Nik (format: 1234.56789), Password (opsional), Role (SuperAdmin/Security)',
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

    // Validasi ukuran file (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      showNotification('error', 'Ukuran file terlalu besar! Maksimal 10MB.');
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
        const count = result.imported_count || 0;
        showNotification('success', `Import CCTV berhasil! ${count} data berhasil diimport.`);
      } else if (selectedImport === 'users') {
        result = await importService.importUsers(formData);
        const count = result.imported_count || 0;
        showNotification('success', `Import Users berhasil! ${count} user berhasil diimport.`);
      }

      // Callback untuk refresh data di parent component
      if (onImportSuccess) {
        onImportSuccess(selectedImport);
      }

      // Auto close setelah 2 detik jika berhasil
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (error) {
      console.error('Import error:', error);
      
      // Handle error message dengan format yang lebih baik
      let errorMessage = error.message || 'Import gagal! Silakan coba lagi.';
      
      // Jika error message terlalu panjang, truncate dengan max 200 chars
      if (errorMessage.length > 200) {
        errorMessage = errorMessage.substring(0, 200) + '...';
      }
      
      showNotification('error', errorMessage);
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

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !isImporting) {
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

  const selectedOption = importOptions.find(opt => opt.id === selectedImport);
  const canImport = selectedImport && selectedFile && !isImporting;

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

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
                <ArrowUpTrayIcon className="w-5 h-5 text-blue-600 dark:text-blue-700" />
              </div>
              <div>
                <h2 className="text-xl text-gray-900 dark:text-white font-semibold">Import Data</h2>
                <p className="text-sm text-gray-600 dark:text-white/60">Pilih jenis data dan upload file Excel</p>
              </div>
            </div>
            
            <button
              onClick={handleClose}
              disabled={isImporting}
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
              <p className={`text-sm font-medium whitespace-pre-line ${notification.type === 'success' ? 'text-green-700 dark:text-green-200' : 'text-red-700 dark:text-red-200'}`}>
                {notification.message}
              </p>
            </div>
          )}

          {/* Import Options */}
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2" style={{
            scrollbarWidth: 'thin',
            scrollbarColor: '#94a3b8 transparent',
          }}>
            {importOptions.map((option) => {
              const isSelected = selectedImport === option.id;
              const colorClasses = getColorClasses(option.color, isSelected);
              const Icon = option.icon;

              return (
                <div key={option.id}>
                  <button
                    onClick={() => !option.disabled && setSelectedImport(option.id)}
                    disabled={isImporting || option.disabled}
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
                        </div>
                        <p className={`text-sm ${colorClasses.desc}`}>
                          {option.description}
                        </p>
                        
                        {/* Template Info */}
                        {isSelected && option.templateInfo && (
                          <div className="flex items-start gap-2 mt-3 p-2 bg-blue-100/20 dark:bg-blue-900/20 rounded-md border border-blue-200/30 dark:border-blue-800/30">
                            <InformationCircleIcon className="w-4 h-4 text-blue-200 dark:text-blue-300 flex-shrink-0 mt-0.5" />
                            <p className="text-xs text-blue-100 dark:text-blue-200">
                              {option.templateInfo}
                            </p>
                          </div>
                        )}
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
                </div>
              );
            })}
          </div>

          {/* File Upload Area */}
          {selectedImport && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <DocumentArrowUpIcon className="w-5 h-5 text-gray-600 dark:text-white/70" />
                <h3 className="font-semibold text-gray-900 dark:text-white">
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
                    border-2 border-dashed rounded-md p-8 text-center cursor-pointer transition-all
                    ${isDragging 
                      ? 'border-blue-500 bg-blue-100/20 dark:bg-blue-500/20' 
                      : 'border-gray-300 dark:border-white/20 hover:border-blue-400 dark:hover:border-blue-500/50 hover:bg-gray-100/50 dark:hover:bg-white/5'
                    }
                  `}
                >
                  <ArrowUpTrayIcon className="w-12 h-12 mx-auto mb-3 text-gray-400 dark:text-gray-500" />
                  <p className="text-sm font-medium text-gray-700 dark:text-white/80 mb-1">
                    Klik untuk pilih file atau drag & drop
                  </p>
                  <p className="text-xs text-gray-500 dark:text-white/50">
                    Format: {selectedOption?.acceptedFormats} • Max: 10MB
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
                <div className="border-2 border-green-400/50 dark:border-green-500/50 bg-green-100/20 dark:bg-green-500/20 rounded-md p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-md bg-green-500/30 dark:bg-green-600/30 border border-green-400 dark:border-green-500 flex items-center justify-center flex-shrink-0">
                      <DocumentArrowUpIcon className="w-6 h-6 text-green-600 dark:text-green-300" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {selectedFile.name}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-white/60">
                        {formatFileSize(selectedFile.size)}
                      </p>
                    </div>
                    <button
                      onClick={handleRemoveFile}
                      disabled={isImporting}
                      className="w-8 h-8 rounded-md flex items-center justify-center hover:bg-red-100 dark:hover:bg-red-500/30 transition-colors disabled:opacity-50"
                    >
                      <TrashIcon className="w-5 h-5 text-red-600 dark:text-red-400" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Buttons - Outside Inner Container */}
        <div className="flex gap-3 justify-end mt-4">
          <button
            onClick={handleClose}
            disabled={isImporting}
            className="px-6 py-2.5 bg-gray-300 dark:bg-gray-400/30 rounded-md text-gray-700 dark:text-gray-200 text-sm font-medium hover:bg-gray-400 dark:hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Batal
          </button>
          
          <button
            onClick={handleImport}
            disabled={!canImport}
            className="px-8 py-2.5 bg-gray-300 dark:bg-gray-400/30 rounded-md text-gray-700 dark:text-gray-200 text-sm font-medium hover:bg-gray-400 dark:hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {isImporting && (
              <svg className="animate-spin h-5 w-5 text-gray-700 dark:text-gray-200" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {isImporting ? 'Mengimport...' : 'Import Data'}
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

export default ImportDataModal;