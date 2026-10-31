import React from 'react';
import { useSocial } from '../../context/SocialContext';
import { Phone, PhoneOff, Video } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const IncomingCallModal: React.FC = () => {
  const { incomingCall, acceptIncomingCall, rejectIncomingCall, t } = useSocial();

  if (!incomingCall) return null;

  const isVideo = incomingCall.type === 'video';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="bg-[#0D162B] border border-[#1A2846] rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center shadow-2xl relative overflow-hidden"
        >
          {/* Animated Background Glow */}
          <div className="absolute -top-12 -left-12 w-32 h-32 bg-blue-600/20 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-indigo-600/20 rounded-full blur-2xl pointer-events-none" />

          {/* Caller Avatar with Animated Rings */}
          <div className="relative inline-block mb-4">
            <span className="absolute inset-0 rounded-full bg-blue-500/30 animate-ping scale-125" />
            <span className="absolute inset-0 rounded-full bg-blue-500/20 animate-pulse scale-150" />
            <img
              src={incomingCall.callerAvatar}
              alt={incomingCall.callerName}
              className="w-24 h-24 rounded-full object-cover border-4 border-blue-500 relative z-10 shadow-lg"
            />
            <div className="absolute bottom-0 end-0 z-20 w-8 h-8 rounded-full bg-blue-600 border-2 border-[#0D162B] flex items-center justify-center text-white shadow">
              {isVideo ? <Video className="w-4 h-4" /> : <Phone className="w-4 h-4" />}
            </div>
          </div>

          <h3 className="text-xl font-bold text-white mb-1">
            {incomingCall.callerName}
          </h3>
          <p className="text-sm text-blue-400 font-medium mb-8">
            {isVideo ? t('incomingVideoCall') : t('incomingVoiceCall')}
          </p>

          {/* Action Buttons: Accept / Decline */}
          <div className="flex items-center justify-center gap-6">
            {/* Decline Button */}
            <div className="text-center">
              <button
                onClick={rejectIncomingCall}
                className="w-16 h-16 rounded-full bg-rose-600 hover:bg-rose-700 active:scale-95 text-white flex items-center justify-center shadow-lg shadow-rose-900/40 transition"
                aria-label={t('declineCall')}
              >
                <PhoneOff className="w-7 h-7" />
              </button>
              <span className="block text-xs text-zinc-400 mt-2 font-medium">
                {t('declineCall')}
              </span>
            </div>

            {/* Accept Button */}
            <div className="text-center">
              <button
                onClick={acceptIncomingCall}
                className="w-16 h-16 rounded-full bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white flex items-center justify-center shadow-lg shadow-emerald-900/40 transition animate-bounce"
                aria-label={t('acceptCall')}
              >
                <Phone className="w-7 h-7" />
              </button>
              <span className="block text-xs text-emerald-400 mt-2 font-medium">
                {t('acceptCall')}
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
