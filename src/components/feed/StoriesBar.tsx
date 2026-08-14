import React, { useState } from 'react';
import { useSocial } from '../../context/SocialContext';
import { Plus, X, Sparkles, ChevronRight, ChevronLeft } from 'lucide-react';
import { Story } from '../../types';
import { motion, AnimatePresence } from 'motion/react';

export const StoriesBar: React.FC = () => {
  const { currentUser, stories, addStory, t } = useSocial();
  const [activeStory, setActiveStory] = useState<Story | null>(null);
  const [isAddStoryOpen, setIsAddStoryOpen] = useState(false);
  const [newStoryUrl, setNewStoryUrl] = useState('');
  const [newStoryCaption, setNewStoryCaption] = useState('');

  const sampleStoryImages = [
    'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80',
  ];

  const handleCreateStorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStoryUrl.trim()) return;
    addStory(newStoryUrl, newStoryCaption);
    setNewStoryUrl('');
    setNewStoryCaption('');
    setIsAddStoryOpen(false);
  };

  return (
    <div className="w-full bg-white dark:bg-[#121215] rounded-2xl p-4 border border-zinc-200 dark:border-zinc-800 shadow-sm mb-4" id="stories-bar">
      <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-none">
        {/* Current user Add Story Pill */}
        <div
          onClick={() => setIsAddStoryOpen(true)}
          className="flex flex-col items-center gap-1.5 shrink-0 cursor-pointer group"
        >
          <div className="relative w-14 h-14 rounded-2xl p-[1px] bg-zinc-200 dark:bg-zinc-800 group-hover:scale-105 transition-transform duration-200">
            <div className="w-full h-full rounded-[15px] overflow-hidden bg-zinc-100 dark:bg-zinc-800 relative">
              <img
                src={currentUser?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'}
                alt="My Story"
                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <div className="w-5 h-5 rounded-md bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 flex items-center justify-center shadow-md">
                  <Plus className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          </div>
          <span className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 max-w-[60px] truncate text-center">
            {t('addStory')}
          </span>
        </div>

        {/* Stories from creators */}
        {stories.map((story) => (
          <div
            key={story.id}
            onClick={() => setActiveStory(story)}
            className="flex flex-col items-center gap-1.5 shrink-0 cursor-pointer group"
          >
            <div
              className={`w-14 h-14 rounded-2xl p-[2px] transition-transform duration-200 group-hover:scale-105 ${
                story.isViewed
                  ? 'bg-zinc-300 dark:bg-zinc-700'
                  : 'bg-zinc-900 dark:bg-zinc-100'
              }`}
            >
              <div className="w-full h-full rounded-[14px] overflow-hidden bg-zinc-100 dark:bg-zinc-800 border-2 border-white dark:border-[#121215]">
                <img
                  src={story.user.avatarUrl}
                  alt={story.user.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
            <span className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 max-w-[60px] truncate text-center">
              {story.user.name.split(' ')[0]}
            </span>
          </div>
        ))}
      </div>

      {/* Story Viewer Modal */}
      <AnimatePresence>
        {activeStory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-sm aspect-[9/16] max-h-[85vh] bg-black rounded-2xl overflow-hidden shadow-2xl flex flex-col justify-between border border-zinc-800"
            >
              {/* Progress bar */}
              <div className="absolute top-3 inset-x-3 z-20 flex gap-1">
                <div className="h-1 bg-white/90 rounded-full w-full animate-[progress_5s_linear]" />
              </div>

              {/* Header Info */}
              <div className="relative z-20 p-4 pt-6 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent">
                <div className="flex items-center gap-2.5">
                  <img
                    src={activeStory.user.avatarUrl}
                    alt={activeStory.user.name}
                    className="w-8 h-8 rounded-lg object-cover border border-white/50"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <h5 className="text-xs font-bold text-white leading-tight">
                      {activeStory.user.name}
                    </h5>
                    <span className="text-[10px] text-zinc-300">{activeStory.createdAt}</span>
                  </div>
                </div>

                <button
                  onClick={() => setActiveStory(null)}
                  className="p-1.5 text-white/80 hover:text-white rounded-lg bg-black/40 backdrop-blur-md"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Story media */}
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-black">
                <img
                  src={activeStory.mediaUrl}
                  alt="Story content"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Caption Footer */}
              {activeStory.caption && (
                <div className="relative z-20 p-4 bg-gradient-to-t from-black/90 via-black/40 to-transparent">
                  <p className="text-white text-xs font-medium text-center leading-relaxed">
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-white dark:bg-[#121215] rounded-2xl p-6 shadow-2xl border border-zinc-200 dark:border-zinc-800"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />
                  <span>إضافة قصة جديدة</span>
                </h3>
                <button
                  onClick={() => setIsAddStoryOpen(false)}
                  className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateStorySubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1.5">
                    اختر صورة سريعة أو أدخل رابطاً:
                  </label>
                  <div className="grid grid-cols-4 gap-2 mb-3">
                    {sampleStoryImages.map((img, i) => (
                      <div
                        key={i}
                        onClick={() => setNewStoryUrl(img)}
                        className={`aspect-square rounded-xl overflow-hidden cursor-pointer border-2 transition ${
                          newStoryUrl === img ? 'border-zinc-900 dark:border-zinc-100 scale-95' : 'border-transparent opacity-75 hover:opacity-100'
                        }`}
                      >
                        <img src={img} alt="sample" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                  <input
                    type="url"
                    value={newStoryUrl}
                    onChange={(e) => setNewStoryUrl(e.target.value)}
                    placeholder="https://example.com/photo.jpg"
                    className="w-full px-3.5 py-2 text-xs bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1.5">
                    كابشن توضيحي (اختياري):
                  </label>
                  <input
                    type="text"
                    value={newStoryCaption}
                    onChange={(e) => setNewStoryCaption(e.target.value)}
                    placeholder="ما الذي تود قوله حول هذه القصة؟"
                    className="w-full px-3.5 py-2 text-xs bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-500"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddStoryOpen(false)}
                    className="px-3.5 py-2 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl"
                  >
                    {t('cancel')}
                  </button>
                  <button
                    type="submit"
                    disabled={!newStoryUrl.trim()}
                    className="px-4 py-2 text-xs font-bold text-white dark:text-zinc-900 bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-white disabled:opacity-50 rounded-xl shadow-sm"
                  >
                    نشر القصة
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
