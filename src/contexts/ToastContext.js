// src/contexts/ToastContext.js
import React, { createContext, useContext, useState, useCallback } from 'react';
import Toast from '../components/common/Toast';

const ToastContext = createContext(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const addToast = useCallback((type, title, message, options = {}) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, type, title, message, ...options }]);
  }, []);

  const showSuccess = useCallback((title, message, options) => addToast('success', title, message, options), [addToast]);
  const showError = useCallback((title, message, options) => addToast('error', title, message, options), [addToast]);
  const showWarning = useCallback((title, message, options) => addToast('warning', title, message, options), [addToast]);
  const showInfo = useCallback((title, message, options) => addToast('info', title, message, options), [addToast]);

  const value = { showSuccess, showError, showWarning, showInfo };

  return (
    <ToastContext.Provider value={value}>
      {children}
      
      <div aria-live="assertive" className="pointer-events-none fixed inset-0 flex items-end px-4 py-6 sm:items-start sm:p-6 z-50">
        <div className="flex w-full flex-col items-center space-y-4 sm:items-end">
          {toasts.map((toast) => (
            <Toast
              key={toast.id}
              id={toast.id}
              type={toast.type}
              title={toast.title}
              message={toast.message}
              onClose={removeToast}
              autoClose={toast.autoClose}
              duration={toast.duration}
            />
          ))}
        </div>
      </div>
    </ToastContext.Provider>
  );
};