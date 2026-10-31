import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Logo } from './Logo';

interface SplashScreenProps {
  onFinish?: () => void;
  autoHideDuration?: number; // ms, default 2400
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onFinish,
  autoHideDuration = 2400,
}) => {
  const [progress, setProgress] = useState(12);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Progress bar animation
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return Math.min(prev + Math.floor(Math.random() * 15 + 8), 100);
      });
    }, 160);

    // Auto finish
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onFinish) {
        setTimeout(onFinish, 400);
      }
    }, autoHideDuration);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [autoHideDuration, onFinish]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45, ease: 'easeInOut' }}
          className="fixed inset-0 z-[100] flex flex-col justify-between items-center py-12 px-6 bg-gradient-to-b from-[#060C1C] via-[#091228] to-[#0A1633] text-white select-none overflow-hidden"
          id="zorvexa-splash-screen"
        >
          {/* Subtle background ambient lighting */}
          <div className="absolute top-1/4 -left-20 w-80 h-80 bg-blue-600/20 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute bottom-1/3 -right-20 w-80 h-80 bg-sky-500/15 rounded-full blur-[100px] pointer-events-none" />

          {/* Top spacer */}
          <div className="w-full flex justify-end">
            <button
              onClick={() => {
                setIsVisible(false);
                if (onFinish) onFinish();
              }}
              className="text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-full bg-white/5 border border-white/10 transition"
            >
              تخطي
            </button>
          </div>

          {/* Center Brand Identity */}
          <div className="flex flex-col items-center text-center my-auto">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="mb-6 relative"
            >
              {/* Outer soft aura */}
              <div className="absolute inset-0 bg-blue-500/30 rounded-3xl blur-xl scale-125 animate-pulse" />
              <Logo size="2xl" showText={false} />
            </motion.div>

            <motion.h1
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-4xl sm:text-5xl font-black tracking-tight text-white mb-3"
            >
              Zorvexa
            </motion.h1>

            <motion.p
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.35, duration: 0.5 }}
              className="text-base sm:text-lg font-semibold text-sky-200/90 tracking-wide"
            >
              تواصل . شارك . اكتشف
            </motion.p>
          </div>

          {/* Bottom Progress Bar & Welcome Text */}
          <div className="w-full max-w-xs flex flex-col items-center gap-3">
            <div className="w-full h-1.5 bg-slate-800/80 rounded-full overflow-hidden p-[1px] border border-blue-900/40">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-600 via-sky-400 to-blue-500 rounded-full shadow-[0_0_12px_#38bdf8]"
                style={{ width: `${progress}%` }}
                transition={{ ease: 'linear' }}
              />
            </div>

            <p className="text-xs font-medium text-slate-400">
              مرحباً بك في Zorvexa
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
