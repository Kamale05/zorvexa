import React, { useState, useEffect, useRef } from 'react';
import { useSocial } from '../../context/SocialContext';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  SwitchCamera,
  PhoneOff,
  Volume2,
  Minimize2,
  Maximize2,
} from 'lucide-react';
import { motion } from 'motion/react';

export const ActiveCallModal: React.FC = () => {
  const {
    activeCall,
    isCallActive,
    callType,
    localStream,
    remoteStream,
    isMicMuted,
    isVideoDisabled,
    toggleCallAudio,
    toggleCallVideo,
    switchCallCamera,
    endActiveCall,
    t,
  } = useSocial();

  const [callDuration, setCallDuration] = useState<number>(0);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  // Timer
  useEffect(() => {
    if (!isCallActive) {
      setCallDuration(0);
      return;
    }
    const timer = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isCallActive]);

  // Attach local stream to video
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream, isCallActive, isMinimized]);

  // Attach remote stream to video
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream, isCallActive, isMinimized]);

  if (!isCallActive || !activeCall) return null;

  const isVideo = callType === 'video';
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const partnerName = activeCall.receiverName;
  const partnerAvatar = activeCall.receiverAvatar;

  // Minimized Floating Widget
  if (isMinimized) {
    return (
      <div className="fixed bottom-24 end-6 z-50 bg-[#0D162B] border border-[#1A2846] rounded-2xl p-3 shadow-2xl flex items-center gap-3 backdrop-blur-md">
        <img
          src={partnerAvatar}
          alt={partnerName}
          className="w-10 h-10 rounded-full object-cover border border-blue-500"
        />
        <div>
          <h4 className="text-xs font-bold text-white">{partnerName}</h4>
          <span className="text-[10px] text-emerald-400 font-medium">
            {formatDuration(callDuration)}
          </span>
        </div>
        <button
          onClick={() => setIsMinimized(false)}
          className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-[#1A2846] transition"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
        <button
          onClick={endActiveCall}
          className="p-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl active:scale-95 transition"
        >
          <PhoneOff className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-black/90 backdrop-blur-lg">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative w-full max-w-4xl h-full max-h-[88vh] bg-[#070D1E] border border-[#1A2846] rounded-3xl overflow-hidden flex flex-col shadow-2xl"
      >
        {/* Top Header Controls */}
        <div className="absolute top-0 inset-x-0 z-30 p-4 sm:p-6 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent">
          <div className="flex items-center gap-3">
            <img
              src={partnerAvatar}
              alt={partnerName}
              className="w-10 h-10 rounded-full object-cover border-2 border-blue-500 shadow"
            />
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white leading-tight">
                {partnerName}
              </h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs text-emerald-400 font-mono font-medium">
                  {formatDuration(callDuration)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMinimized(true)}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition backdrop-blur-sm"
              title="تصغير"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Center Media Area */}
        <div className="flex-1 relative flex items-center justify-center bg-[#070D1E] overflow-hidden">
          {isVideo ? (
            <>
              {/* Remote Video Stream (Main Feed) */}
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover bg-zinc-950"
              />

              {/* Local Video Stream (PiP Corner) */}
              <div className="absolute bottom-24 end-4 sm:end-6 z-20 overflow-hidden rounded-2xl border-2 border-blue-500/80 shadow-2xl bg-zinc-900 w-28 sm:w-36 h-40 sm:h-52">
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover ${isVideoDisabled ? 'hidden' : 'block'}`}
                />
                {isVideoDisabled && (
                  <div className="w-full h-full flex flex-col items-center justify-center text-zinc-400 bg-zinc-900 text-xs gap-1">
                    <VideoOff className="w-5 h-5 text-zinc-500" />
                    <span>الكاميرا مغلقة</span>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Voice Call Screen with Audio Waves */
            <div className="text-center py-12 px-4 relative z-10">
              <div className="relative inline-block mb-6">
                <span className="absolute inset-0 rounded-full bg-blue-500/20 animate-ping scale-150" />
                <span className="absolute inset-0 rounded-full bg-blue-600/30 animate-pulse scale-125" />
                <img
                  src={partnerAvatar}
                  alt={partnerName}
                  className="w-32 h-32 sm:w-40 sm:h-40 rounded-full object-cover border-4 border-blue-500 relative z-10 shadow-2xl mx-auto"
                />
              </div>

              <h2 className="text-2xl font-bold text-white mb-2">{partnerName}</h2>
              <p className="text-sm text-blue-400 font-medium mb-4 flex items-center justify-center gap-2">
                <Volume2 className="w-4 h-4 animate-bounce" />
                <span>{t('voiceCall')}</span>
              </p>
              <span className="inline-block px-4 py-1.5 rounded-full bg-blue-950/60 border border-blue-800/40 text-blue-300 font-mono text-sm shadow">
                {formatDuration(callDuration)}
              </span>
            </div>
          )}
        </div>

        {/* Bottom Call Controls Bar */}
        <div className="relative z-30 p-4 sm:p-6 bg-[#0D162B]/95 border-t border-[#1A2846] backdrop-blur-md flex items-center justify-center gap-4 sm:gap-6">
          {/* Mute Mic */}
          <button
            onClick={toggleCallAudio}
            className={`p-3.5 sm:p-4 rounded-2xl text-white transition active:scale-95 shadow-lg ${
              isMicMuted
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/50'
                : 'bg-white/10 hover:bg-white/20'
            }`}
            title={isMicMuted ? t('unmuteMic') : t('muteMic')}
          >
            {isMicMuted ? <MicOff className="w-5 h-5 sm:w-6 sm:h-6" /> : <Mic className="w-5 h-5 sm:w-6 sm:h-6" />}
          </button>

          {/* Video Toggle (If Video Call) */}
          {isVideo && (
            <>
              <button
                onClick={toggleCallVideo}
                className={`p-3.5 sm:p-4 rounded-2xl text-white transition active:scale-95 shadow-lg ${
                  isVideoDisabled
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/50'
                    : 'bg-white/10 hover:bg-white/20'
                }`}
                title={isVideoDisabled ? t('cameraOn') : t('cameraOff')}
              >
                {isVideoDisabled ? <VideoOff className="w-5 h-5 sm:w-6 sm:h-6" /> : <Video className="w-5 h-5 sm:w-6 sm:h-6" />}
              </button>

              {/* Switch Camera */}
              <button
                onClick={switchCallCamera}
                className="p-3.5 sm:p-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition active:scale-95 shadow-lg"
                title={t('flipCamera')}
              >
                <SwitchCamera className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </>
          )}

          {/* End Call Button */}
          <button
            onClick={endActiveCall}
            className="p-3.5 sm:p-4 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-900/50 transition active:scale-95 px-6 sm:px-8 flex items-center gap-2 font-bold text-sm"
          >
            <PhoneOff className="w-5 h-5 sm:w-6 sm:h-6" />
            <span className="hidden sm:inline">{t('endCall')}</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
