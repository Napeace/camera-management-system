// src/components/common/Toast.js - NEW DESIGN
import React, { Fragment, useEffect, useState, useCallback } from 'react'; 
import { Transition } from '@headlessui/react';
import { CheckIcon, ExclamationTriangleIcon, InformationCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';

// Camera Icon Component
const CameraIcon = () => (
  <svg 
    width="79" 
    height="70" 
    viewBox="0 0 79 70" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className="absolute bottom-0 right-0 w-16 h-14 opacity-20"
  >
    <g style={{ mixBlendMode: 'overlay' }} opacity="0.4" filter="url(#filter0_i_671_7072)">
      <path d="M50 0C75.4252 0 96.4175 18.9773 99.5859 43.54L45.4912 21.0693L45.4863 21.0742L54.2217 26.5801C71.1763 40.39 68.3567 58.8346 90.4912 68.8096C92.1184 69.5433 93.7589 70.2546 95.4082 70.9502C94.8002 72.2657 94.1388 73.551 93.4229 74.8018L82.4727 70.3711L79.9521 77.3516L89.3906 80.7969C87.5722 83.1195 85.5516 85.2756 83.3574 87.2422L73.7334 84.1045L66.5137 88.8994L58.5088 92.1348L71.8096 95.0029C65.2183 98.2031 57.8192 100 50 100C22.3859 99.9999 9.48467e-05 77.6141 0 50C0 22.3858 22.3858 6.59809e-05 50 0ZM54.4932 33.4053C28.4233 32.3203 16.5384 66.6895 35.498 83.8945C51.793 98.6895 76.1631 87.9196 79.9531 67.4746L72.0078 61.1396C73.4278 79.8697 49.7129 90.1497 38.0879 74.3047C26.6783 58.7497 42.1883 35.5949 60.998 43.1396L54.4932 33.4053ZM64.748 67.1396C69.2872 55.8767 58.2667 44.4127 47.0088 50.1455L47.0078 50.1445L47.0029 50.1494C47.005 50.1484 47.0068 50.1465 47.0088 50.1455C47.8489 51.3045 49.3882 51.0501 50.123 52.7646C52.118 57.3996 47.1483 61.2543 43.7383 58.1543C42.8034 57.3043 42.9478 56.0145 42.0078 55.6445C41.3878 57.9695 39.1182 61.8947 41.4932 63.6396L42.6387 61.9893C46.343 61.1797 45.2331 64.1346 45.623 65.7695C46.218 68.2495 50.498 71.1096 52.998 71.3896C52.3532 72.3543 51.9282 71.935 51.1035 71.835C47.7935 71.44 43.238 68.8795 41.998 65.6445C41.0734 65.5347 41.5633 66.684 41.7334 67.1592C45.3734 77.3091 60.648 77.3195 64.748 67.1396ZM39.1318 22.2598C35.7866 21.7398 26.1671 21.7299 22.7422 22.1299C21.0222 22.3299 19.4924 23.2201 19.1074 24.9951C18.8774 26.0506 18.5319 29.7195 18.5068 30.8945C18.3668 38.1745 20.6021 46.0946 25.9971 51.1396C28.1271 43.2447 34.5921 36.2048 42.1621 33.0498C44.9971 31.8698 47.6073 31.6093 50.4023 30.7793C51.0772 30.5795 51.717 30.9444 51.4971 29.8945C48.4721 26.7745 43.5168 22.9398 39.1318 22.2598Z" fill="white" style={{ fill: 'white', fillOpacity: 1 }} />
    </g>
    <defs>
      <filter id="filter0_i_671_7072" x="0" y="0" width="99.5859" height="102" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
        <feFlood floodOpacity="0" result="BackgroundImageFix"/>
        <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
        <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
        <feOffset dy="2"/>
        <feGaussianBlur stdDeviation="1"/>
        <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
        <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.2 0"/>
        <feBlend mode="normal" in2="shape" result="effect1_innerShadow_671_7072"/>
      </filter>
    </defs>
  </svg>
);

const icons = {
  success: CheckIcon,
  error: XMarkIcon,
  warning: ExclamationTriangleIcon,
  info: InformationCircleIcon,
};

// Icon colors untuk Light Mode
const iconColors = {
  success: 'text-green-500',
  error: 'text-red-500',
  warning: 'text-yellow-500',
  info: 'text-blue-500',
};

// Background classes
const backgroundClasses = {
  success: 'bg-white dark:bg-gradient-to-r dark:from-green-600 dark:to-green-800',
  error: 'bg-white dark:bg-gradient-to-r dark:from-red-700 dark:to-red-900',
  warning: 'bg-white dark:bg-gray-800',
  info: 'bg-white dark:bg-gradient-to-r dark:from-blue-600 dark:to-blue-800',
};

// Icon container background
const iconContainerBg = {
  success: 'bg-green-100 dark:bg-green-800',
  error: 'bg-red-100 dark:bg-red-900',
  warning: 'bg-yellow-100 dark:bg-yellow-900',
  info: 'bg-blue-100 dark:bg-blue-900',
};

// Text colors
const titleColors = {
  success: 'text-gray-900 dark:text-white',
  error: 'text-gray-900 dark:text-white',
  warning: 'text-gray-900 dark:text-white',
  info: 'text-gray-900 dark:text-white',
};

const messageColors = {
  success: 'text-gray-500 dark:text-white/90',
  error: 'text-gray-500 dark:text-white/90',
  warning: 'text-gray-500 dark:text-gray-400',
  info: 'text-gray-500 dark:text-white/90',
};

// Close button colors
const closeButtonColors = {
  success: 'text-gray-400 hover:text-gray-500 dark:text-white/70 dark:hover:text-white',
  error: 'text-gray-400 hover:text-gray-500 dark:text-white/70 dark:hover:text-white',
  warning: 'text-gray-400 hover:text-gray-500 dark:hover:text-gray-300',
  info: 'text-gray-400 hover:text-gray-500 dark:text-white/70 dark:hover:text-white',
};

export default function Toast({ id, type = 'info', title, message, onClose, autoClose = true, duration = 2000 }) {
  const [show, setShow] = useState(true);

  const handleClose = useCallback(() => {
    setShow(false);
  }, []);

  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [autoClose, duration, handleClose]);

  const handleAfterLeave = useCallback(() => {
    if (onClose) {
      onClose(id);
    }
  }, [onClose, id]);
  
  const Icon = icons[type];
  const iconColor = iconColors[type];
  const bgClass = backgroundClasses[type];
  const iconBg = iconContainerBg[type];
  const titleColor = titleColors[type];
  const messageColor = messageColors[type];
  const closeColor = closeButtonColors[type];

  // Tentukan apakah perlu camera icon (sekarang termasuk info)
  const showCameraIcon = type === 'success' || type === 'error' || type === 'info';

  return (
    <Transition
      show={show}
      as={Fragment}
      enter="transform ease-out duration-300 transition"
      enterFrom="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
      enterTo="translate-y-0 opacity-100 sm:translate-x-0"
      leave="transition ease-in duration-100"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
      afterLeave={handleAfterLeave}
    >
      <div className={`pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg ${bgClass} shadow-lg ring-1 ring-black ring-opacity-5 relative`}>
        <div className="p-4">
          <div className="flex items-start">
            {/* Icon Container with Box Background */}
            <div className={`flex-shrink-0 ${iconBg} rounded-lg p-2`}>
              <Icon className={`h-5 w-5 ${iconColor} dark:text-white`} aria-hidden="true" />
            </div>
            
            {/* Content */}
            <div className="ml-3 w-0 flex-1 pt-0.5">
              <p className={`text-sm font-medium ${titleColor}`}>{title}</p>
              <p className={`mt-1 text-sm ${messageColor}`}>{message}</p>
            </div>
            
            {/* Close Button */}
            <div className="ml-4 flex flex-shrink-0">
              <button
                type="button"
                className={`inline-flex rounded-md bg-transparent ${closeColor} focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-200`}
                onClick={handleClose}
              >
                <span className="sr-only">Close</span>
                <XMarkIcon className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>

        {/* Camera Icon - Now includes Info type */}
        {showCameraIcon && <CameraIcon />}
      </div>
    </Transition>
  );
}