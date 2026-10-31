import React, { useState } from 'react';
import { useSocial } from '../../context/SocialContext';
import { motion, AnimatePresence } from 'motion/react';
import { X, Camera, Sparkles, Check, UploadCloud, Image as ImageIcon } from 'lucide-react';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, updateCurrentUser, t } = useSocial();

  const [name, setName] = useState(currentUser?.name || '');
  const [bio, setBio] = useState(currentUser?.bio || '');
  const [location, setLocation] = useState(currentUser?.location || '');
  const [website, setWebsite] = useState(currentUser?.website || '');
  const [avatarUrl, setAvatarUrl] = useState(currentUser?.avatarUrl || '');
  const [coverUrl, setCoverUrl] = useState(currentUser?.coverUrl || '');

  if (!isOpen || !currentUser) return null;

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setAvatarUrl(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setCoverUrl(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const sampleAvatars = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
  ];

  const sampleCovers = [
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&auto=format&fit=crop&q=80',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateCurrentUser({
      name,
      bio,
      location,
      website,
      avatarUrl,
      coverUrl,
    });
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4" id="edit-profile-modal">
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
          className="relative w-full max-w-lg bg-white dark:bg-[#070D1E] rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-[#1A2846] z-10 max-h-[90vh] overflow-y-auto"
        >
          <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-zinc-400" />
              <span>{t('editProfile')}</span>
            </h3>
            <button
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            {/* Avatar chooser */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  {t('changeAvatar')}:
                </label>
                <label className="text-[11px] font-semibold text-zinc-900 dark:text-zinc-100 hover:underline cursor-pointer flex items-center gap-1">
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>{t('uploadFromDevice')}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                </label>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-xl overflow-hidden ring-2 ring-zinc-900 dark:ring-zinc-100 shrink-0">
                  <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                </div>
                <div className="flex gap-2">
                  {sampleAvatars.map((av, idx) => (
                    <img
                      key={idx}
                      src={av}
                      alt="Sample"
                      onClick={() => setAvatarUrl(av)}
                      className={`w-9 h-9 rounded-xl object-cover cursor-pointer border-2 transition ${
                        avatarUrl === av ? 'border-zinc-900 dark:border-zinc-100 scale-105' : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Cover photo chooser */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  {t('editCover')}:
                </label>
                <label className="text-[11px] font-semibold text-zinc-900 dark:text-zinc-100 hover:underline cursor-pointer flex items-center gap-1">
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>{t('uploadFromDevice')}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCoverUpload}
                    className="hidden"
                  />
                </label>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {sampleCovers.map((cov, idx) => (
                  <div
                    key={idx}
                    onClick={() => setCoverUrl(cov)}
                    className={`aspect-video rounded-xl overflow-hidden cursor-pointer border-2 transition ${
                      coverUrl === cov ? 'border-zinc-900 dark:border-zinc-100' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={cov} alt="Cover" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                {t('name')}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3.5 py-2 text-xs bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-500"
              />
            </div>

            {/* Bio */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                {t('bio')}
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                className="w-full px-3.5 py-2 text-xs bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-500 resize-none"
              />
            </div>

            {/* Location & Website */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  {t('location')}
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="دبي، الإمارات"
                  className="w-full px-3.5 py-2 text-xs bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  {t('website')}
                </label>
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3.5 py-2 text-xs bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-zinc-100 dark:border-zinc-800">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition"
              >
                {t('cancel')}
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-2xl shadow-[0_4px_16px_rgba(37,99,235,0.4)] transition active:scale-95"
              >
                {t('saveChanges')}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
