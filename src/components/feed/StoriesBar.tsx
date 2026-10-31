import React, { useState } from 'react';
import { useSocial } from '../../context/SocialContext';
import { Plus, X, Sparkles, ChevronRight, ChevronLeft, Upload } from 'lucide-react';
import { Story } from '../../types';
import { motion, AnimatePresence } from 'motion/react';

export const StoriesBar: React.FC = () => {
  const { currentUser, stories, addStory, t } = useSocial();
  const [activeStory, setActiveStory] = useState<Story | null>(null);
  const [isAddStoryOpen, setIsAddStoryOpen] = useState(false);
  const [newStoryUrl, setNewStoryUrl] = useState('');
  const [newStoryCaption, setNewStoryCaption] = useState('');

  // Sample default stories matching reference screen 3
  const defaultStoryContacts = [
    {
      id: 'st-sara',
      name: 'Sara',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80',
      mediaUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80',
      caption: 'يوم رائع ومميز في العمل 🚀',
    },
    {
      id: 'st-ahmed',
      name: 'Ahmed',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
      mediaUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80',
      caption: 'شاطئ البحر وقت الغروب 🌊',
    },
    {
      id: 'st-lina',
      name: 'Lina',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
      mediaUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80',
      caption: 'استكشاف آفاق جديدة 🌌',
    },
    {
      id: 'st-mohamed',
      name: 'Mohamed',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
      mediaUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80',
      caption: 'لحظات لا تنسى مع الأصدقاء ✨',
    },
  ];

  const handleCreateStorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStoryUrl.trim()) return;
    addStory(newStoryUrl, newStoryCaption);
    setNewStoryUrl('');
    setNewStoryCaption('');
    setIsAddStoryOpen(false);
  };

  const handleDeviceImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setNewStoryUrl(url);
  };

  return (
    <div
      className="w-full bg-[#070D1E] dark:bg-[#070D1E] rounded-3xl p-3 sm:p-4 border border-[#1A2846] shadow-sm mb-4"
      id="stories-bar"
    >
      <div className="flex items-center gap-4 overflow-x-auto pb-1 scrollbar-none select-none">
        {/* Current user Add Story Item matching Screen 3 */}
        <div
          onClick={() => setIsAddStoryOpen(true)}
          className="flex flex-col items-center gap-1.5 shrink-0 cursor-pointer group"
        >
          <div className="relative w-14 h-14 rounded-full p-[2px] bg-slate-800 hover:scale-105 transition-transform duration-200">
            <div className="w-full h-full rounded-full overflow-hidden bg-slate-900 relative">
              <img
                src={
                  currentUser?.avatarUrl ||
                  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80'
                }
                alt="My Story"
                className="w-full h-full object-cover opacity-85 group-hover:opacity-100 transition"
              />
            </div>
            {/* Blue Plus Badge */}
            <div className="absolute bottom-0 end-0 w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center border-2 border-[#070D1E] shadow-sm">
              <Plus className="w-2.5 h-2.5 stroke-[3]" />
            </div>
          </div>
          <span className="text-[11px] font-semibold text-slate-300 max-w-[64px] truncate text-center">
            إضافة قصة
          </span>
        </div>

        {/* Stories from contacts matching Screen 3 with glowing cyan/blue rings */}
        {defaultStoryContacts.map((contact) => (
          <div
            key={contact.id}
            onClick={() =>
              setActiveStory({
                id: contact.id,
                userId: contact.id,
                user: {
                  id: contact.id,
                  name: contact.name,
                  username: contact.name.toLowerCase(),
                  email: `${contact.name.toLowerCase()}@zorvexa.app`,
                  avatarUrl: contact.avatar,
                  bio: 'عضو في Zorvexa',
                  followersCount: 150,
                  followingCount: 80,
                  postsCount: 12,
                  joinedDate: '2024',
                  interests: [],
                  isOnline: true,
                },
                mediaUrl: contact.mediaUrl,
                mediaType: 'image',
                caption: contact.caption,
                createdAt: 'منذ ساعتين',
                expiresAt: 'غداً',
                viewers: [],
                isViewed: false,
              })
            }
            className="flex flex-col items-center gap-1.5 shrink-0 cursor-pointer group"
          >
            {/* Glowing Blue/Cyan Gradient Ring */}
            <div className="w-14 h-14 rounded-full p-[2.5px] bg-gradient-to-tr from-blue-600 via-sky-400 to-indigo-500 shadow-[0_0_12px_rgba(56,189,248,0.35)] transition-transform duration-200 group-hover:scale-105">
              <div className="w-full h-full rounded-full overflow-hidden bg-[#070D1E] p-[1.5px]">
                <img
                  src={contact.avatar}
                  alt={contact.name}
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
            </div>
            <span className="text-[11px] font-semibold text-slate-200 max-w-[64px] truncate text-center">
              {contact.name}
            </span>
          </div>
        ))}
      </div>

      {/* Story Viewer Modal */}
      <AnimatePresence>
        {activeStory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-sm aspect-[9/16] max-h-[85vh] bg-[#070D1E] rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between border border-[#1A2846]"
            >
              {/* Progress bar */}
              <div className="absolute top-3 inset-x-3 z-20 flex gap-1">
                <div className="h-1 bg-white/90 rounded-full w-full animate-[progress_5s_linear]" />
              </div>

              {/* Story Header */}
              <div className="relative z-20 flex items-center justify-between p-4 pt-6 bg-gradient-to-b from-black/80 to-transparent">
                <div className="flex items-center gap-2.5">
                  <img
                    src={activeStory.user.avatarUrl}
                    alt={activeStory.user.name}
                    className="w-8 h-8 rounded-full border border-white/50 object-cover"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-white leading-tight">
                      {activeStory.user.name}
                    </h4>
                    <span className="text-[10px] text-white/70">
                      {activeStory.createdAt}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setActiveStory(null)}
                  className="w-7 h-7 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Story Image */}
              <div className="absolute inset-0 z-10">
                <img
                  src={activeStory.mediaUrl}
                  alt="Story"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Story Caption */}
              {activeStory.caption && (
                <div className="relative z-20 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                  <p className="text-sm font-semibold text-white text-center drop-shadow-md">
                    {activeStory.caption}
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Story Modal */}
      <AnimatePresence>
        {isAddStoryOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm bg-[#080E1E] text-white border border-[#1A2846] rounded-3xl p-6 shadow-2xl relative"
            >
              <button
                onClick={() => setIsAddStoryOpen(false)}
                className="absolute top-4 end-4 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-base font-bold text-white mb-4">
                إضافة قصة جديدة
              </h3>

              <form onSubmit={handleCreateStorySubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 mb-1.5 block">
                    اختر صورة من الهاتف أو رابط:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={newStoryUrl}
                      onChange={(e) => setNewStoryUrl(e.target.value)}
                      placeholder="رابط الصورة https://..."
                      className="flex-1 px-3 py-2 rounded-xl bg-[#0D162B] border border-[#1A2846] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                    <label className="p-2 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 hover:bg-blue-600/30 cursor-pointer flex items-center justify-center">
                      <Upload className="w-4 h-4" />
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleDeviceImageUpload}
                      />
                    </label>
                  </div>
                </div>

                {newStoryUrl && (
                  <div className="aspect-[9/12] max-h-48 rounded-xl overflow-hidden border border-[#1A2846]">
                    <img
                      src={newStoryUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div>
                  <label className="text-xs font-semibold text-slate-300 mb-1.5 block">
                    نص القصة (اختياري):
                  </label>
                  <input
                    type="text"
                    value={newStoryCaption}
                    onChange={(e) => setNewStoryCaption(e.target.value)}
                    placeholder="ماذا تود أن تقول؟"
                    className="w-full px-3 py-2 rounded-xl bg-[#0D162B] border border-[#1A2846] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!newStoryUrl}
                  className="w-full py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs shadow-md transition"
                >
                  نشر القصة
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
