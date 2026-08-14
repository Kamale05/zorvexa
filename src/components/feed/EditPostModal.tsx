import React, { useState } from 'react';
import { useSocial } from '../../context/SocialContext';
import { Post, MediaItem } from '../../types';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Image as ImageIcon,
  MapPin,
  Hash,
  Globe,
  Users,
  Lock,
  Check,
  UploadCloud,
  Sparkles,
} from 'lucide-react';

interface EditPostModalProps {
  post: Post;
  isOpen: boolean;
  onClose: () => void;
}

export const EditPostModal: React.FC<EditPostModalProps> = ({ post, isOpen, onClose }) => {
  const { updatePost, t } = useSocial();

  const [content, setContent] = useState(post.content);
  const [privacy, setPrivacy] = useState<'public' | 'followers' | 'private'>(post.privacy);
  const [mediaList, setMediaList] = useState<MediaItem[]>(post.media || []);
  const [locationInput, setLocationInput] = useState(post.location || '');
  const [showLocationInput, setShowLocationInput] = useState(!!post.location);
  const [hashtags, setHashtags] = useState<string[]>(post.hashtags || []);
  const [customTagInput, setCustomTagInput] = useState('');
  const [showHashtagsInput, setShowHashtagsInput] = useState(post.hashtags && post.hashtags.length > 0);
  const [mediaUrlInput, setMediaUrlInput] = useState('');
  const [showMediaInput, setShowMediaInput] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

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

  const addMediaUrl = () => {
    if (!mediaUrlInput.trim()) return;
    setMediaList((prev) => [
      ...prev,
      {
        id: `media_${Date.now()}`,
        type: 'image',
        url: mediaUrlInput.trim(),
      },
    ]);
    setMediaUrlInput('');
    setShowMediaInput(false);
  };

  const removeMedia = (id: string) => {
    setMediaList((prev) => prev.filter((m) => m.id !== id));
  };

  const addHashtag = () => {
    const cleaned = customTagInput.trim().replace(/^#/, '');
    if (cleaned && !hashtags.includes(cleaned)) {
      setHashtags((prev) => [...prev, cleaned]);
      setCustomTagInput('');
    }
  };

  const removeHashtag = (tag: string) => {
    setHashtags((prev) => prev.filter((t) => t !== tag));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && mediaList.length === 0) return;

    setIsSubmitting(true);
    updatePost(post.id, {
      content,
      media: mediaList.length > 0 ? mediaList : undefined,
      location: locationInput.trim() || undefined,
      hashtags,
      privacy,
    });
    setIsSubmitting(false);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4" id="edit-post-modal">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-lg bg-white dark:bg-[#121215] rounded-2xl p-5 sm:p-6 shadow-2xl border border-zinc-200 dark:border-zinc-800 z-10 max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-zinc-400" />
              <span>{t('editPost')}</span>
            </h3>
            <button
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-y-auto pt-4 space-y-4">
            {/* Privacy Selector */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-500 font-medium">خصوصية المنشور:</span>
              <select
                value={privacy}
                onChange={(e) => setPrivacy(e.target.value as any)}
                className="text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 focus:outline-none"
              >
                <option value="public">🌍 {t('public')}</option>
                <option value="followers">👥 {t('followersOnly')}</option>
                <option value="private">🔒 {t('privateOnly')}</option>
              </select>
            </div>

            {/* Content Textarea */}
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              placeholder={t('whatsOnYourMind', { name: post.author.name })}
              className="w-full text-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-zinc-500 resize-none leading-relaxed"
            />

            {/* Media Gallery with Remove Option */}
            {mediaList.length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                {mediaList.map((m) => (
                  <div
                    key={m.id}
                    className="relative aspect-video rounded-xl overflow-hidden bg-zinc-950 border border-zinc-800 group"
                  >
                    {m.type === 'image' ? (
                      <img src={m.url} alt="Media" className="w-full h-full object-cover" />
                    ) : (
                      <video src={m.url} controls className="w-full h-full object-cover" />
                    )}
                    <button
                      type="button"
                      onClick={() => removeMedia(m.id)}
                      className="absolute top-2 end-2 p-1.5 rounded-lg bg-zinc-900/80 text-white hover:bg-rose-600 transition"
                      title="حذف الوسائط"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add media controls */}
            {showMediaInput && (
              <div className="p-3 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    value={mediaUrlInput}
                    onChange={(e) => setMediaUrlInput(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="flex-1 px-3 py-1.5 text-xs bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-white focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={addMediaUrl}
                    className="px-3 py-1.5 text-xs font-semibold bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-xl"
                  >
                    إضافة رابط
                  </button>
                </div>
              </div>
            )}

            {/* Location input */}
            {showLocationInput && (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={locationInput}
                  onChange={(e) => setLocationInput(e.target.value)}
                  placeholder="أدخل الموقع (مثال: الرياض، السعودية)"
                  className="flex-1 px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-zinc-100 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowLocationInput(false)}
                  className="p-2 text-zinc-400 hover:text-rose-500"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Hashtags section */}
            {showHashtagsInput && (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customTagInput}
                    onChange={(e) => setCustomTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addHashtag();
                      }
                    }}
                    placeholder="أضف وسماً بدون #"
                    className="flex-1 px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-zinc-100 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={addHashtag}
                    className="px-3 py-2 text-xs font-semibold bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-xl"
                  >
                    + إضافة
                  </button>
                </div>

                {hashtags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {hashtags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-medium rounded-lg"
                      >
                        #{tag}
                        <button
                          type="button"
                          onClick={() => removeHashtag(tag)}
                          className="hover:text-rose-500 ms-1"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Bottom Actions Bar */}
            <div className="flex items-center justify-between pt-4 border-t border-zinc-100 dark:border-zinc-800 mt-auto">
              <div className="flex items-center gap-1.5">
                {/* Device file upload button */}
                <label className="p-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition cursor-pointer" title={t('uploadFromDevice')}>
                  <UploadCloud className="w-4 h-4" />
                  <input
                    type="file"
                    accept="image/*,video/*"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>

                {/* URL input toggle */}
                <button
                  type="button"
                  onClick={() => setShowMediaInput(!showMediaInput)}
                  className="p-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition"
                  title="إضافة رابط وسائط"
                >
                  <ImageIcon className="w-4 h-4" />
                </button>

                {/* Location toggle */}
                <button
                  type="button"
                  onClick={() => setShowLocationInput(!showLocationInput)}
                  className="p-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition"
                  title={t('addLocation')}
                >
                  <MapPin className="w-4 h-4" />
                </button>

                {/* Hashtags toggle */}
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
                  onClick={onClose}
                  className="px-3.5 py-2 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || (!content.trim() && mediaList.length === 0)}
                  className="flex items-center gap-1.5 bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-white disabled:opacity-40 text-white dark:text-zinc-900 font-semibold px-4 py-2 rounded-xl shadow-xs active:scale-95 transition-all text-xs"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{t('saveChanges')}</span>
                </button>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
