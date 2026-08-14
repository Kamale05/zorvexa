import React, { useState } from 'react';
import { useSocial } from '../../context/SocialContext';
import {
  Image,
  Video,
  MapPin,
  Hash,
  Globe,
  Users,
  Lock,
  Send,
  X,
  UploadCloud,
  Sparkles,
} from 'lucide-react';
import { MediaItem } from '../../types';

export const CreatePostBox: React.FC = () => {
  const {
    currentUser,
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
    'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1000&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1000&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1000&auto=format&fit=crop&q=80',
  ];

  const handlePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
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
      // Reset
      setContent('');
      setMediaList([]);
      setLocationInput('');
      setHashtags([]);
      setShowMediaInput(false);
      setShowLocationInput(false);
      setShowHashtagsInput(false);
      setIsSubmitting(false);
    }, 300);
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
    <div
      className="bg-white dark:bg-[#121215] rounded-2xl p-4 sm:p-5 border border-zinc-200 dark:border-zinc-800 shadow-sm mb-4 transition-colors"
      id="inline-create-post-box"
    >
      <form onSubmit={handlePostSubmit}>
        <div className="flex gap-3 items-start">
          <img
            src={
              currentUser?.avatarUrl ||
              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'
            }
            alt={currentUser?.name || 'User'}
            className="w-9 h-9 rounded-xl object-cover border border-zinc-200 dark:border-zinc-700 shrink-0"
            referrerPolicy="no-referrer"
          />

          <div className="flex-1 min-w-0">
            {/* Privacy Selector & Name */}
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                {currentUser?.name || 'زائر Zorvexa'}
              </span>

              <div className="relative inline-block">
                <select
                  value={privacy}
                  onChange={(e) => setPrivacy(e.target.value as any)}
                  className="text-[11px] font-semibold bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 px-2.5 py-1 rounded-lg border border-transparent dark:border-zinc-800 focus:outline-none cursor-pointer hover:bg-zinc-200 dark:hover:bg-zinc-800 transition"
                >
                  <option value="public">🌍 {t('public')}</option>
                  <option value="followers">👥 {t('followersOnly')}</option>
                  <option value="private">🔒 {t('privateOnly')}</option>
                </select>
              </div>
            </div>

            {/* Content Textarea */}
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={t('whatsOnYourMind', { name: currentUser?.name.split(' ')[0] || 'صديقنا' })}
              rows={2}
              className="w-full text-sm bg-transparent text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 border-none resize-none focus:outline-none leading-relaxed"
            />

            {/* Media previews */}
            {mediaList.length > 0 && (
              <div className="grid grid-cols-2 gap-2 mt-2 mb-3">
                {mediaList.map((media) => (
                  <div
                    key={media.id}
                    className="relative rounded-xl overflow-hidden aspect-video bg-zinc-950 border border-zinc-700 group"
                  >
                    {media.type === 'image' ? (
                      <img src={media.url} alt="Uploaded" className="w-full h-full object-cover" />
                    ) : (
                      <video src={media.url} controls className="w-full h-full object-cover" />
                    )}
                    <button
                      type="button"
                      onClick={() => removeMediaItem(media.id)}
                      className="absolute top-2 right-2 p-1 rounded-lg bg-zinc-900/80 text-white hover:bg-rose-600 transition"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Location preview tag */}
            {locationInput && (
              <div className="inline-flex items-center gap-1 px-2.5 py-1 mb-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-semibold rounded-lg">
                <MapPin className="w-3 h-3" />
                <span>{locationInput}</span>
                <button
                  type="button"
                  onClick={() => setLocationInput('')}
                  className="hover:text-rose-500 ms-1"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}

            {/* Hashtags preview */}
            {hashtags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2">
                {hashtags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs font-bold rounded-lg"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => setHashtags((prev) => prev.filter((t) => t !== tag))}
                      className="hover:text-rose-500"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Sub-inputs toggled */}
            {showMediaInput && (
              <div className="p-3 mb-3 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  <span>إضافة صورة أو فيديو:</span>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => setMediaTypeInput('image')}
                      className={`px-2 py-0.5 rounded-md text-xs font-semibold ${
                        mediaTypeInput === 'image' ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900' : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                      }`}
                    >
                      صورة
                    </button>
                    <button
                      type="button"
                      onClick={() => setMediaTypeInput('video')}
                      className={`px-2 py-0.5 rounded-md text-xs font-semibold ${
                        mediaTypeInput === 'video' ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900' : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
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
                    placeholder="https://images.unsplash.com/..."
                    className="flex-1 px-3 py-1.5 text-xs bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-white focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => addMediaItem(mediaUrlInput, mediaTypeInput)}
                    className="px-3 py-1.5 text-xs font-bold bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-white text-white dark:text-zinc-900 rounded-xl"
                  >
                    إضافة
                  </button>
                </div>

                <div className="flex items-center gap-1.5 pt-1">
                  <span className="text-[11px] text-zinc-400">عينة سريعة:</span>
                  {sampleImages.map((img, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => addMediaItem(img, 'image')}
                      className="text-[11px] text-zinc-600 dark:text-zinc-400 hover:underline"
                    >
                      صورة {i + 1}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {showLocationInput && (
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={locationInput}
                  onChange={(e) => setLocationInput(e.target.value)}
                  placeholder="أدخل المدينة أو المكان (مثال: دبي، الإمارات)"
                  className="flex-1 px-3 py-1.5 text-xs bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-zinc-100 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowLocationInput(false)}
                  className="px-3 py-1.5 text-xs bg-zinc-200 dark:bg-zinc-800 rounded-xl text-zinc-700 dark:text-zinc-300"
                >
                  تم
                </button>
              </div>
            )}

            {showHashtagsInput && (
              <div className="flex gap-2 mb-3">
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
                  placeholder="اكتب هاشتاغ واضغط إضافة (مثال: تقنية)"
                  className="flex-1 px-3 py-1.5 text-xs bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-zinc-100 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={addHashtagItem}
                  className="px-3 py-1.5 text-xs bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold rounded-xl"
                >
                  + إضافة
                </button>
              </div>
            )}

            {/* Bottom Actions Bar */}
            <div className="flex items-center justify-between pt-3 border-t border-zinc-100 dark:border-zinc-800/80">
              <div className="flex items-center gap-1 sm:gap-2">
                {/* Device file upload */}
                <label
                  className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition cursor-pointer"
                  title={t('uploadFromDevice')}
                >
                  <UploadCloud className="w-4 h-4 text-zinc-500" />
                  <span className="hidden sm:inline">{t('uploadFromDevice')}</span>
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
                  className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition"
                  title="إدخال رابط"
                >
                  <Image className="w-4 h-4 text-zinc-500" />
                  <span className="hidden sm:inline">رابط</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowLocationInput(!showLocationInput)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition"
                  title={t('addLocation')}
                >
                  <MapPin className="w-4 h-4 text-zinc-500" />
                  <span className="hidden sm:inline">{t('addLocation')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowHashtagsInput(!showHashtagsInput)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition"
                  title={t('addHashtag')}
                >
                  <Hash className="w-4 h-4 text-zinc-500" />
                  <span className="hidden sm:inline">{t('addHashtag')}</span>
                </button>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || (!content.trim() && mediaList.length === 0)}
                className="flex items-center gap-1.5 bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-white disabled:opacity-40 text-white dark:text-zinc-900 text-xs sm:text-sm font-semibold px-4 py-2 rounded-xl shadow-sm active:scale-95 transition-all"
                id="inline-publish-btn"
              >
                <Send className="w-3.5 h-3.5 rtl:rotate-180" />
                <span>{isSubmitting ? t('posting') : t('post')}</span>
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
