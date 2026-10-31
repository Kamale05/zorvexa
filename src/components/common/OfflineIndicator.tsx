import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  });
  const [showRestoredNotice, setShowRestoredNotice] = useState<boolean>(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowRestoredNotice(true);
      const timer = setTimeout(() => setShowRestoredNotice(false), 3200);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowRestoredNotice(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          key="offline-badge"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.25 }}
          className="fixed top-16 inset-x-4 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 z-50 pointer-events-none"
        >
          <div className="pointer-events-auto flex items-center gap-2.5 px-4 py-2 rounded-full bg-zinc-900/95 dark:bg-zinc-800/95 border border-amber-500/40 text-amber-300 text-xs font-medium shadow-xl backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            <WifiOff className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>وضع عدم الاتصال — يتم استعراض المحتوى المخزن مؤقتاً</span>
          </div>
        </motion.div>
      )}

      {isOnline && showRestoredNotice && (
        <motion.div
          key="restored-badge"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.25 }}
          className="fixed top-16 inset-x-4 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 z-50 pointer-events-none"
        >
          <div className="pointer-events-auto flex items-center gap-2.5 px-4 py-2 rounded-full bg-zinc-900/95 dark:bg-zinc-800/95 border border-emerald-500/40 text-emerald-300 text-xs font-medium shadow-xl backdrop-blur-md">
            <Wifi className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>تمت استعادة الاتصال بالإنترنت وتحديث البيانات</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
