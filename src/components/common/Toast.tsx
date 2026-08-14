import React from 'react';
import { useSocial } from '../../context/SocialContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const ToastContainer: React.FC = () => {
  const { toasts } = useSocial();

  return (
    <div className="fixed bottom-20 sm:bottom-6 inset-x-0 sm:inset-x-auto sm:right-6 sm:left-auto z-50 flex flex-col gap-2.5 px-4 pointer-events-none max-w-md w-full" id="toast-container">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 rounded-xl shadow-lg border backdrop-blur-md ${
              toast.type === 'success'
                ? 'bg-zinc-900/95 dark:bg-zinc-900/95 border-zinc-800 text-zinc-100'
                : toast.type === 'error'
                ? 'bg-zinc-900/95 dark:bg-zinc-900/95 border-rose-900/50 text-rose-200'
                : 'bg-zinc-900/95 dark:bg-zinc-900/95 border-zinc-800 text-zinc-100'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
              {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
              {toast.type === 'info' && <Info className="w-4 h-4 text-zinc-400 shrink-0" />}
              <p className="text-xs font-medium leading-relaxed">{toast.message}</p>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
