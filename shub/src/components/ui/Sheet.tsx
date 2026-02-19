import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '../../utils/cn';

interface SheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
  variant?: 'sheet' | 'dialog';
}

const Sheet: React.FC<SheetProps> = ({ open, onClose, title, children, className, variant = 'sheet' }) => {
  // Lock body scroll when sheet is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          {variant === 'dialog' ? (
            /* Centered Dialog */
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                key="dialog"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ type: 'spring', damping: 30, stiffness: 350 }}
                className={cn(
                  'bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[85vh] overflow-y-auto',
                  className
                )}
              >
                {title && (
                  <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
                    <button
                      onClick={onClose}
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                      aria-label="Close"
                    >
                      <X className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>
                )}
                <div className="px-6 pb-8 pt-4">
                  {children}
                </div>
              </motion.div>
            </div>
          ) : (
            /* Bottom Sheet */
            <motion.div
              key="sheet"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className={cn(
                'fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl max-h-[90vh] overflow-y-auto',
                className
              )}
            >
              {/* Drag handle */}
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 bg-gray-300 rounded-full" />
              </div>

              {title && (
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                  <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    aria-label="Close"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
              )}

              <div className="px-6 pb-8 pt-2">
                {children}
              </div>
            </motion.div>
          )}
        </>
      )}
    </AnimatePresence>
  );
};

export default Sheet;
