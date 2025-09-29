import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'

export default function ConfirmDialog({
  isOpen = false,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  confirmText = "Iya",
  cancelText = "Tidak",
  type = "danger",
  loading = false,
  itemName = null
}) {
  const handleClose = () => {
    if (!loading && typeof onClose === 'function') {
      onClose()
    }
  }

  const handleConfirm = () => {
    if (typeof onConfirm === 'function') {
      onConfirm()
    }
  }

  return (
    <Transition appear show={Boolean(isOpen)} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        {/* Backdrop */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" />
        </Transition.Child>

        {/* Modal */}
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-left">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-gradient-to-b from-slate-950 via-indigo-950 to-indigo-800 shadow-2xl transition-all">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-6 mx-4">
                  <Dialog.Title as="h2" className="text-2xl text-white">
                    {title}
                  </Dialog.Title>
                  <button 
                    onClick={handleClose} 
                    disabled={loading} 
                    className="text-white/70 hover:text-white disabled:opacity-50 transition-colors"
                  >
                    <XMarkIcon className="w-7 h-7" />
                  </button>
                </div>
                
                {/* Border persegi panjang setelah header */}
                <div className="mx-6 h-1 bg-white/10"></div>

                {/* Content */}
                <div className="p-6">
                  <p className="text-white text-lg leading-relaxed">
                    {message}
                  </p>
                  {itemName && (
                    <p className="mt-3 text-white/90 font-medium">
                      "{itemName}"
                    </p>
                  )}
                  
                  {/* Buttons */}
                  <div className="mt-9 pb-2">
                    <div className="flex gap-3 justify-end">
                      <button
                        type="button" 
                        onClick={handleClose} 
                        disabled={loading}
                        className="w-28 px-1 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white font-medium hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      >
                        {cancelText}
                      </button>
                      <button
                        type="button" 
                        onClick={handleConfirm}
                        disabled={loading}
                        className="w-28 px-1 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white font-medium hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                      >
                        {loading ? (
                          <>
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Processing...
                          </>
                        ) : (
                          confirmText
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}