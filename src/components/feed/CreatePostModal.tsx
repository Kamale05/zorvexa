import React, { useState } from 'react';
import { useSocial } from '../../context/SocialContext';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Image,
  Video,
  MapPin,
  Hash,
  Globe,
  Users,
  Lock,
  Send,
  UploadCloud,
  Sparkles,
} from 'lucide-react';
import { MediaItem } from '../../types';

export const CreatePostModal: React.FC = () => {
  const {
    currentUser,
    isCreatePostModalOpen,
    setIsCreatePostModalOpen,
    createPost,
    setIsAuthModalOpen,
    setAuthModalView,
    t,
  } = useSocial();

  const [content, setContent] = useState('');
  const [privacy, setPrivacy] = useState<'public' | 'followers' | 'private'>('public');
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [showMediaInput, setShowMediaInput] = useState(false);
  const [showLocationInput, setShowLocationInput] = useState(false);
  const [showHashtagsInput, setShowHashtagsInput] = useState(false);
  const [mediaUrlInput, setMediaUrlInput] = useState('');
  const [mediaTypeInput, setMediaTypeInput] = useState<'image' | 'video'>('image');
  const [locationInput, setLocationInput] = useState('');
  const [customTagInput, setCustomTagInput] = useState('');
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const sampleImages = [
    'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1000&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1000&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1000&auto=format&fit=crop&q=80',
  ];

  if (!isCreatePostModalOpen) return null;

  const handlePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setIsCreatePostModalOpen(false);
      setAuthModalView('login');
      setIsAuthModalOpen(true);
      return;
    }
    if (!content.trim() && mediaList.length === 0) return;

    setIsSubmitting(true);
    setTimeout(() => {
      createPost({
        content,
        media: mediaList,
        location: locationInput.trim() || undefined,
        hashtags: hashtags,
        privacy,
      });
      setContent('');
      setMediaList([]);
      setLocationInput('');
      setHashtags([]);
      setIsSubmitting(false);
    }, 250);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file: File) => {
      const isVideo = file.type.startsWith('video/');
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setMediaList((prev) => [
            ...prev,
            {
              id: `media_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
              type: isVideo ? 'video' : 'image',
              url: event.target!.result as string,
            },
          ]);
        }
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const addMediaItem = (url: string, type: 'image' | 'video' = 'image') => {
    if (!url.trim()) return;
    setMediaList((prev) => [
      ...prev,
      {
        id: `media_${Date.now()}`,
        type,
        url,
      },
    ]);
    setMediaUrlInput('');
    setShowMediaInput(false);
  };

  const removeMediaItem = (id: string) => {
    setMediaList((prev) => prev.filter((m) => m.id !== id));
  };

  const addHashtagItem = () => {
    const cleaned = customTagInput.trim().replace(/^#/, '');
    if (cleaned && !hashtags.includes(cleaned)) {
      setHashtags((prev) => [...prev, cleaned]);
      setCustomTagInput('');
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" id="create-post-modal">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsCreatePostModalOpen(false)}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-xl bg-white dark:bg-[#121215] rounded-2xl p-6 shadow-2xl border border-zinc-200 dark:border-zinc-800 z-10 max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-zinc-400" />
              <span>{t('create')} منشور جديد</span>
            </h3>
            <button
              onClick={() => setIsCreatePostModalOpen(false)}
              className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handlePostSubmit} className="flex flex-col flex-1 overflow-y-auto pt-4 space-y-4">
            {/* User details & privacy */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <img
                  src={
                    currentUser?.avatarUrl ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'
                  }
                  alt={currentUser?.name}
                  className="w-9 h-9 rounded-xl object-cover border border-zinc-200 dark:border-zinc-700"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                    {currentUser?.name}
                  </h4>
                  <p className="text-[10px] text-zinc-400">@{currentUser?.username}</p>
                </div>
              </div>

              <select
                value={privacy}
                onChange={(e) => setPrivacy(e.target.value as any)}
                className="text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 px-2.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 focus:outline-none"
              >
                <option value="public">🌍 {t('public')}</option>
                <option value="followers">👥 {t('followersOnly')}</option>
                <option value="private">🔒 {t('privateOnly')}</option>
              </select>
            </div>

            {/* Textarea */}
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={t('whatsOnYourMind', { name: currentUser?.name.split(' ')[0] || '' })}
              rows={4}
              className="w-full text-sm bg-transparent text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 border-none resize-none focus:outline-none leading-relaxed"
            />

            {/* Media previews */}
            {mediaList.length > 0 && (
              <div className="grid grid-cols-2 gap-2 mt-2">
                {mediaList.map((media) => (
                  <div
                    key={media.id}
                    className="relative rounded-xl overflow-hidden aspect-video bg-zinc-950 border border-zinc-800"
                  >
                    {media.type === 'image' ? (
                      <img src={media.url} alt="Media" className="w-full h-full object-cover" />
                    ) : (
                      <video src={media.url} controls className="w-full h-full object-cover" />
                    )}
                    <button
                      type="button"
                      onClick={() => removeMediaItem(media.id)}
                      className="absolute top-2 right-2 p-1.5 rounded-lg bg-zinc-900/80 text-white hover:bg-rose-600 transition"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Location & Tags preview */}
            {locationInput && (
              <div className="inline-flex items-center gap-1 px-2.5 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs rounded-lg w-fit border border-zinc-200 dark:border-zinc-700">
                <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                <span>{locationInput}</span>
                <button
                  type="button"
                  onClick={() => setLocationInput('')}
                  className="hover:text-rose-500 ms-1.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}

            {hashtags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {hashtags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-medium rounded-lg border border-zinc-200 dark:border-zinc-700"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => setHashtags((prev) => prev.filter((t) => t !== tag))}
                      className="hover:text-rose-500"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Inputs dropdown */}
            {showMediaInput && (
              <div className="p-3 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  <span>إضافة وسائط (صورة أو فيديو):</span>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => setMediaTypeInput('image')}
                      className={`px-2 py-0.5 rounded-lg text-xs transition ${
                        mediaTypeInput === 'image' ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-semibold' : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                      }`}
                    >
                      صورة
                    </button>
                    <button
                      type="button"
                      onClick={() => setMediaTypeInput('video')}
                      className={`px-2 py-0.5 rounded-lg text-xs transition ${
                        mediaTypeInput === 'video' ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-semibold' : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                      }`}
                    >
                      فيديو
                    </button>
                  </div>
                </div>

                <div className="flex gap-2">
                  <input
                    type="url"
                    value={mediaUrlInput}
                    onChange={(e) => setMediaUrlInput(e.target.value)}
                    placeholder="https://..."
                    className="flex-1 px-3 py-2 text-xs bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => addMediaItem(mediaUrlInput, mediaTypeInput)}
                    className="px-3.5 py-2 text-xs font-semibold bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-xl shadow-xs transition"
                  >
                    إدراج
                  </button>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <span className="text-[10px] text-zinc-400">عينة سريعة:</span>
                  {sampleImages.map((img, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => addMediaItem(img, 'image')}
                      className="text-[10px] text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:underline"
                    >
                      صورة {i + 1}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {showLocationInput && (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={locationInput}
                  onChange={(e) => setLocationInput(e.target.value)}
                  placeholder="أدخل المكان (مثال: دبي، الإمارات)"
                  className="flex-1 px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowLocationInput(false)}
                  className="px-3 py-2 text-xs bg-zinc-100 dark:bg-zinc-800 rounded-xl text-zinc-700 dark:text-zinc-300 font-semibold"
                >
                  تم
                </button>
              </div>
            )}

            {showHashtagsInput && (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customTagInput}
                  onChange={(e) => setCustomTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addHashtagItem();
                    }
                  }}
                  placeholder="هاشتاغ بدون #"
                  className="flex-1 px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={addHashtagItem}
                  className="px-3.5 py-2 text-xs bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-semibold rounded-xl"
                >
                  إضافة
                </button>
              </div>
            )}

            {/* Bottom tools & Submit */}
            <div className="flex items-center justify-between pt-4 border-t border-zinc-100 dark:border-zinc-800 mt-auto">
              <div className="flex items-center gap-1.5">
                <label
                  className="p-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition cursor-pointer"
                  title={t('uploadFromDevice')}
                >
                  <UploadCloud className="w-4 h-4" />
                  <input
                    type="file"
                    accept="image/*,video/*"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
                <button
                  type="button"
                  onClick={() => setShowMediaInput(!showMediaInput)}
                  className="p-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition"
                  title="إدخال رابط"
                >
                  <Image className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setShowLocationInput(!showLocationInput)}
                  className="p-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition"
                  title={t('addLocation')}
                >
                  <MapPin className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setShowHashtagsInput(!showHashtagsInput)}
                  className="p-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition"
                  title={t('addHashtag')}
                >
                  <Hash className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreatePostModalOpen(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || (!content.trim() && mediaList.length === 0)}
                  className="flex items-center gap-1.5 bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-white disabled:opacity-40 text-white dark:text-zinc-900 font-semibold px-4 py-2 rounded-xl shadow-xs active:scale-95 transition-all text-xs"
                >
                  <Send className="w-3.5 h-3.5 rtl:rotate-180" />
                  <span>{isSubmitting ? t('posting') : t('post')}</span>
                </button>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
