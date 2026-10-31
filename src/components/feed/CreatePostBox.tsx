import React, { useState, useRef } from 'react';
import { useSocial } from '../../context/SocialContext';
import {
  Image as ImageIcon,
  Camera,
  MapPin,
  Hash,
  Send,
  X,
  Loader2,
  Sparkles,
  Link as LinkIcon,
} from 'lucide-react';
import { MediaItem } from '../../types';
import { uploadImageToStorage } from '../../services/firebaseService';

interface LocalFilePreview {
  id: string;
  file: File;
  previewUrl: string;
  sizeFormatted: string;
}

export const CreatePostBox: React.FC = () => {
  const {
    currentUser,
    createPost,
    setIsAuthModalOpen,
    setAuthModalView,
    showToast,
    t,
  } = useSocial();

  const [content, setContent] = useState('');
  const [privacy, setPrivacy] = useState<'public' | 'followers' | 'private'>('public');
  const [pendingFiles, setPendingFiles] = useState<LocalFilePreview[]>([]);
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  
  // Toggles for extra tools
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [showLocationInput, setShowLocationInput] = useState(false);
  const [showHashtagsInput, setShowHashtagsInput] = useState(false);
  
  const [mediaUrlInput, setMediaUrlInput] = useState('');
  const [locationInput, setLocationInput] = useState('');
  const [customTagInput, setCustomTagInput] = useState('');
  const [hashtags, setHashtags] = useState<string[]>([]);
  
  // Upload status & progress
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  const galleryInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Handle files selected via file input
  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newFiles: LocalFilePreview[] = [];
    Array.from(files).forEach((file: File) => {
      if (!file.type.startsWith('image/')) {
        showToast('يرجى اختيار صور صالحة فقط', 'error');
        return;
      }
      newFiles.push({
        id: `img_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        file,
        previewUrl: URL.createObjectURL(file),
        sizeFormatted: formatFileSize(file.size),
      });
    });

    setPendingFiles((prev) => [...prev, ...newFiles]);
    e.target.value = '';
  };

  const removePendingFile = (id: string) => {
    setPendingFiles((prev) => {
      const target = prev.find((item) => item.id === id);
      if (target) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return prev.filter((item) => item.id !== id);
    });
  };

  const removeMediaItem = (id: string) => {
    setMediaList((prev) => prev.filter((m) => m.id !== id));
  };

  const addMediaByUrl = () => {
    if (!mediaUrlInput.trim()) return;
    setMediaList((prev) => [
      ...prev,
      {
        id: `url_${Date.now()}`,
        type: 'image',
        url: mediaUrlInput.trim(),
      },
    ]);
    setMediaUrlInput('');
    setShowUrlInput(false);
  };

  const addHashtagItem = () => {
    const cleaned = customTagInput.trim().replace(/^#/, '');
    if (cleaned && !hashtags.includes(cleaned)) {
      setHashtags((prev) => [...prev, cleaned]);
      setCustomTagInput('');
    }
  };

  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setAuthModalView('login');
      setIsAuthModalOpen(true);
      return;
    }

    if (!content.trim() && pendingFiles.length === 0 && mediaList.length === 0) return;

    setIsSubmitting(true);
    setUploadProgress(0);

    try {
      const uploadedMediaItems: MediaItem[] = [...mediaList];

      // Upload all pending files to Firebase Storage
      if (pendingFiles.length > 0) {
        for (let i = 0; i < pendingFiles.length; i++) {
          const item = pendingFiles[i];
          const downloadUrl = await uploadImageToStorage(
            item.file,
            'posts',
            (pct) => {
              const overall = Math.round(((i + pct / 100) / pendingFiles.length) * 100);
              setUploadProgress(overall);
            }
          );

          uploadedMediaItems.push({
            id: item.id,
            type: 'image',
            url: downloadUrl,
          });
        }
      }

      // Save post to Firestore
      createPost({
        content,
        media: uploadedMediaItems,
        location: locationInput.trim() || undefined,
        hashtags,
        privacy,
      });

      // Cleanup object URLs and reset
      pendingFiles.forEach((p) => URL.revokeObjectURL(p.previewUrl));
      setContent('');
      setPendingFiles([]);
      setMediaList([]);
      setLocationInput('');
      setHashtags([]);
      setShowUrlInput(false);
      setShowLocationInput(false);
      setShowHashtagsInput(false);
      setUploadProgress(null);
    } catch (err: any) {
      console.error('Post creation error:', err);
      showToast(t('uploadFailed') || 'فشل رفع الصور، يرجى المحاولة مجدداً', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="bg-white dark:bg-[#070D1E] rounded-3xl p-4 sm:p-5 border border-slate-200 dark:border-[#1A2846] shadow-xs mb-4 transition-colors"
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
            className="w-10 h-10 rounded-xl object-cover border border-zinc-200 dark:border-zinc-700 shrink-0 shadow-xs"
            referrerPolicy="no-referrer"
          />

          <div className="flex-1 min-w-0">
            {/* User row & Privacy Selector */}
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                {currentUser?.name || 'عضو Zorvexa'}
              </span>

              <select
                value={privacy}
                onChange={(e) => setPrivacy(e.target.value as any)}
                className="text-[11px] font-semibold bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 px-2.5 py-1 rounded-lg border border-zinc-200 dark:border-zinc-800 focus:outline-none cursor-pointer transition"
              >
                <option value="public">🌍 {t('public')}</option>
                <option value="followers">👥 {t('followersOnly')}</option>
                <option value="private">🔒 {t('privateOnly')}</option>
              </select>
            </div>

            {/* Post Content */}
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={t('whatsOnYourMind', { name: currentUser?.name.split(' ')[0] || 'صديقنا' })}
              rows={2}
              className="w-full text-sm bg-transparent text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 border-none resize-none focus:outline-none leading-relaxed"
            />

            {/* Previews: Pending Local Photos with Delete Button */}
            {pendingFiles.length > 0 && (
              <div className="mb-3 space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-semibold text-zinc-500">
                  <span>الصور المحددة للرفع ({pendingFiles.length}):</span>
                  <span>معاينة جاهزة</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {pendingFiles.map((item) => (
                    <div
                      key={item.id}
                      className="relative rounded-xl overflow-hidden aspect-video bg-zinc-950 border border-zinc-200 dark:border-zinc-700 group shadow-xs"
                    >
                      <img
                        src={item.previewUrl}
                        alt="Preview"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <span className="absolute bottom-1 start-1 px-1.5 py-0.5 rounded-md bg-black/70 text-white text-[9px] font-mono">
                        {item.sizeFormatted}
                      </span>
                      <button
                        type="button"
                        onClick={() => removePendingFile(item.id)}
                        className="absolute top-1.5 end-1.5 p-1 rounded-lg bg-black/70 text-white hover:bg-rose-600 transition shadow-xs"
                        title={t('removeImage') || 'إزالة'}
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Previews: Already added URL media */}
            {mediaList.length > 0 && (
              <div className="grid grid-cols-2 gap-2 mt-2 mb-3">
                {mediaList.map((media) => (
                  <div
                    key={media.id}
                    className="relative rounded-xl overflow-hidden aspect-video bg-zinc-950 border border-zinc-700 group"
                  >
                    <img src={media.url} alt="Media" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeMediaItem(media.id)}
                      className="absolute top-1.5 end-1.5 p-1 rounded-lg bg-black/70 text-white hover:bg-rose-600 transition shadow-xs"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Upload Progress Bar */}
            {isSubmitting && uploadProgress !== null && (
              <div className="mb-3 p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 space-y-1.5 animate-pulse">
                <div className="flex items-center justify-between text-xs font-bold text-blue-600 dark:text-blue-400">
                  <span className="flex items-center gap-1.5">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>جاري رفع الصور وحفظ المنشور...</span>
                  </span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-blue-100 dark:bg-blue-900/60 overflow-hidden">
                  <div
                    className="h-full bg-blue-600 transition-all duration-300 rounded-full"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Location tag preview */}
            {locationInput && (
              <div className="inline-flex items-center gap-1 px-2.5 py-1 mb-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-semibold rounded-lg">
                <MapPin className="w-3 h-3 text-zinc-400" />
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

            {/* Optional URL input box */}
            {showUrlInput && (
              <div className="p-3 mb-3 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 flex gap-2">
                <input
                  type="url"
                  value={mediaUrlInput}
                  onChange={(e) => setMediaUrlInput(e.target.value)}
                  placeholder="https://..."
                  className="flex-1 px-3 py-1.5 text-xs bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-zinc-100 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={addMediaByUrl}
                  className="px-3 py-1.5 text-xs font-bold bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-xl"
                >
                  إدراج
                </button>
              </div>
            )}

            {/* Location input box */}
            {showLocationInput && (
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={locationInput}
                  onChange={(e) => setLocationInput(e.target.value)}
                  placeholder="أدخل موقعك (مثال: دبي، القاهرة، الرياض)"
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

            {/* Hashtag input box */}
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
                  placeholder="اكتب وسماً واضغط إضافة (مثال: تقنية)"
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
                {/* Hidden Native File Inputs */}
                <input
                  ref={galleryInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFilesSelected}
                  className="hidden"
                  id="box-gallery-input"
                />
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFilesSelected}
                  className="hidden"
                  id="box-camera-input"
                />

                {/* Gallery Button */}
                <button
                  type="button"
                  onClick={() => galleryInputRef.current?.click()}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-xl transition cursor-pointer"
                  title="اختيار صور من معرض الهاتف"
                >
                  <ImageIcon className="w-4 h-4" />
                  <span className="hidden sm:inline">{t('uploadFromGallery') || 'معرض الصور'}</span>
                  {pendingFiles.length > 0 && (
                    <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">
                      {pendingFiles.length}
                    </span>
                  )}
                </button>

                {/* Camera Button (Android / Mobile) */}
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition"
                  title="التقاط صورة بالكاميرا"
                >
                  <Camera className="w-4 h-4 text-zinc-500" />
                  <span className="hidden sm:inline">{t('takePhoto') || 'الكاميرا'}</span>
                </button>

                {/* Link URL */}
                <button
                  type="button"
                  onClick={() => setShowUrlInput(!showUrlInput)}
                  className="p-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition"
                  title="إدراج رابط مباشر"
                >
                  <LinkIcon className="w-4 h-4" />
                </button>

                {/* Location */}
                <button
                  type="button"
                  onClick={() => setShowLocationInput(!showLocationInput)}
                  className="p-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition"
                  title={t('addLocation')}
                >
                  <MapPin className="w-4 h-4" />
                </button>

                {/* Hashtag */}
                <button
                  type="button"
                  onClick={() => setShowHashtagsInput(!showHashtagsInput)}
                  className="p-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition"
                  title={t('addHashtag')}
                >
                  <Hash className="w-4 h-4" />
                </button>
              </div>

              {/* Submit Post Button */}
              <button
                type="submit"
                disabled={isSubmitting || (!content.trim() && pendingFiles.length === 0 && mediaList.length === 0)}
                className="flex items-center gap-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-40 text-white text-xs sm:text-sm font-semibold px-4 py-2 rounded-xl shadow-xs active:scale-95 transition-all"
                id="inline-publish-btn"
              >
                {isSubmitting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5 rtl:rotate-180" />
                )}
                <span>{isSubmitting ? t('posting') : t('post')}</span>
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
