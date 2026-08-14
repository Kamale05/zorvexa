import React, { useState } from 'react';
import { useSocial } from '../../context/SocialContext';
import { motion, AnimatePresence } from 'motion/react';
import { X, UserPlus, Check, Sparkles } from 'lucide-react';
import { User } from '../../types';

interface FollowersModalProps {
  isOpen: boolean;
  type: 'followers' | 'following';
  user: User;
  onClose: () => void;
}

export const FollowersModal: React.FC<FollowersModalProps> = ({
  isOpen,
  type,
  user,
  onClose,
}) => {
  const { users, toggleFollowUser, setSelectedUserProfile, t } = useSocial();
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  // Render list of users with search filter
  const list = users.filter((u) => u.id !== user.id).filter((u) => {
    if (!search.trim()) return true;
    return (
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.username.toLowerCase().includes(search.toLowerCase())
    );
  });

  const handleUserSelect = (target: User) => {
    setSelectedUserProfile(target);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4" id="followers-modal">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-md bg-white dark:bg-[#121215] rounded-2xl p-5 shadow-2xl border border-zinc-200 dark:border-zinc-800 z-10 max-h-[85vh] flex flex-col"
        >
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800 shrink-0">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              {type === 'followers' ? t('followers') : t('followingCount')} ({user.name})
            </h3>
            <button
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="py-2.5 shrink-0">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="البحث في القائمة..."
              className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-zinc-500"
            />
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800/80">
            {list.map((target) => (
              <div
                key={target.id}
                className="py-2.5 flex items-center justify-between gap-3 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 px-2 rounded-xl transition"
              >
                <div
                  onClick={() => handleUserSelect(target)}
                  className="flex items-center gap-2.5 min-w-0 cursor-pointer flex-1"
                >
                  <img
                    src={target.avatarUrl}
                    alt={target.name}
                    className="w-9 h-9 rounded-xl object-cover shrink-0 border border-zinc-200 dark:border-zinc-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1">
                      <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                        {target.name}
                      </h4>
                      {target.isVerified && (
                        <Sparkles className="w-3 h-3 text-zinc-400 shrink-0" />
                      )}
                    </div>
                    <p className="text-[10px] text-zinc-400 truncate">@{target.username}</p>
                  </div>
                </div>

                <button
                  onClick={() => toggleFollowUser(target.id)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition active:scale-95 flex items-center gap-1 shrink-0 ${
                    target.isFollowing
                      ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                      : 'bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-white text-white dark:text-zinc-900 shadow-xs'
                  }`}
                >
                  {target.isFollowing ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-500" />
                      <span>{t('following')}</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-3 h-3" />
                      <span>{t('follow')}</span>
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
