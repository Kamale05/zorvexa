import React, { useState, useRef } from 'react';
import { useSocial } from '../../context/SocialContext';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Plus,
  MapPin,
  Users,
  Hash,
  Globe,
  Lock,
  ChevronRight,
  ChevronLeft,
  Loader2,
  Trash2,
  Image as ImageIcon,
} from 'lucide-react';
import { MediaItem } from '../../types';
import { uploadImageToStorage } from '../../services/firebaseService';
import { GalleryPickerModal, GalleryPhoto } from '../gallery/GalleryPickerModal';

export const CreatePostModal: React.FC = () => {
  const {
    currentUser,
    isCreatePostModalOpen,
    setIsCreatePostModalOpen,
    createPost,
    showToast,
    language,
    t,
  } = useSocial();

  const [content, setContent] = useState('');
  const [privacy, setPrivacy] = useState<'public' | 'followers' | 'private'>('public');
  const [selectedPhotos, setSelectedPhotos] = useState<GalleryPhoto[]>([]);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);

  // Extras
  const [location, setLocation] = useState('');
  const [showLocationInput, setShowLocationInput] = useState(false);
  const [taggedFriends, setTaggedFriends] = useState<string[]>([]);
  const [showFriendsInput, setShowFriendsInput] = useState(false);
  const [newFriend, setNewFriend] = useState('');
  const [hashtags, setHashtags] = useState<string[]>(['طبيعة', 'أصدقاء']);
  const [showHashInput, setShowHashInput] = useState(false);
  const [newTag, setNewTag] = useState('');

  // Uploading state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  if (!isCreatePostModalOpen) return null;

  const handleAddPhotosFromGallery = (photos: GalleryPhoto[]) => {
    // Merge without duplicates
    setSelectedPhotos((prev) => {
      const existingIds = new Set(prev.map((p) => p.id));
      const newlyAdded = photos.filter((p) => !existingIds.has(p.id));
      return [...prev, ...newlyAdded];
    });
  };

  const removePhoto = (id: string) => {
    setSelectedPhotos((prev) => prev.filter((p) => p.id !== id));
  };

  const handleAddFriend = () => {
    if (newFriend.trim() && !taggedFriends.includes(newFriend.trim())) {
      setTaggedFriends([...taggedFriends, newFriend.trim()]);
      setNewFriend('');
    }
  };

  const handleAddTag = () => {
    const clean = newTag.replace('#', '').trim();
    if (clean && !hashtags.includes(clean)) {
      setHashtags([...hashtags, clean]);
      setNewTag('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && selectedPhotos.length === 0) {
      showToast('يرجى كتابة نص أو إضافة صورة للمنشور', 'error');
      return;
    }

    setIsSubmitting(true);
    setUploadProgress(15);

    try {
      const finalMedia: MediaItem[] = [];

      for (let i = 0; i < selectedPhotos.length; i++) {
        const photo = selectedPhotos[i];
        if (photo.file) {
          // Upload real file to Firebase Storage
          setUploadProgress(Math.round(20 + ((i + 1) / selectedPhotos.length) * 60));
          const uploadedUrl = await uploadImageToStorage(
            photo.file,
            `posts/${currentUser?.id || 'anon'}`
          );
          finalMedia.push({
            id: `m_${Date.now()}_${i}`,
            url: uploadedUrl,
            type: 'image',
          });
        } else {
          // Preset or web image url
          finalMedia.push({
            id: photo.id,
            url: photo.url,
            type: 'image',
          });
        }
      }

      setUploadProgress(95);

      // Create the post in Firestore / state
      await createPost({
        content,
        media: finalMedia.length > 0 ? finalMedia : undefined,
        location: location.trim() || undefined,
        hashtags: hashtags.length > 0 ? hashtags : undefined,
        privacy,
      });

      showToast('تم نشر منشورك بنجاح!');
      setIsCreatePostModalOpen(false);

      // Reset state
      setContent('');
      setSelectedPhotos([]);
      setLocation('');
      setTaggedFriends([]);
    } catch (err: any) {
      console.error('Error creating post:', err);
      showToast('حدث خطأ أثناء نشر المنشور، يرجى المحاولة ثانية', 'error');
    } finally {
      setIsSubmitting(false);
      setUploadProgress(null);
    }
  };

  return (
    <>
      <AnimatePresence>
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" id="create-post-modal">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !isSubmitting && setIsCreatePostModalOpen(false)}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
          />

          {/* Modal Container matching Screen 4 */}
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 280 }}
            className="relative w-full max-w-lg bg-[#070D1E] text-white border border-[#1A2846] rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] z-10"
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-[#1A2846] flex items-center justify-between">
              <button
                onClick={() => setIsCreatePostModalOpen(false)}
                disabled={isSubmitting}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>

              <h3 className="text-base font-bold text-white tracking-wide">
                إنشاء منشور
              </h3>

              <div className="w-8" />
            </div>

            {/* Form body */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-thin">
              {/* Author Row matching Screen 4 */}
              <div className="flex items-center gap-3">
                <img
                  src={
                    currentUser?.avatarUrl ||
                    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80'
                  }
                  alt={currentUser?.name || 'User'}
                  className="w-11 h-11 rounded-full object-cover border-2 border-blue-500/40"
                />
                <div>
                  <h4 className="text-sm font-bold text-white leading-tight">
                    {currentUser?.name || 'Yasser'}
                  </h4>
                  {/* Privacy pill */}
                  <div className="flex items-center gap-1.5 mt-1">
                    <button
                      type="button"
                      onClick={() =>
                        setPrivacy(
                          privacy === 'public'
                            ? 'followers'
                            : privacy === 'followers'
                            ? 'private'
                            : 'public'
                        )
                      }
                      className="px-2.5 py-0.5 rounded-full bg-[#0D162B] border border-[#1A2846] text-[10px] font-semibold text-slate-300 flex items-center gap-1 hover:border-blue-500 transition"
                    >
                      <Globe className="w-3 h-3 text-blue-400" />
                      <span>
                        {privacy === 'public'
                          ? 'العامة'
                          : privacy === 'followers'
                          ? 'المتابعون'
                          : 'خاص بي'}
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Textarea: "ماذا تفكر؟" */}
              <div className="pt-2">
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="ماذا تفكر؟"
                  rows={3}
                  className="w-full bg-transparent border-0 text-white placeholder-slate-500 text-sm sm:text-base focus:ring-0 focus:outline-none resize-none leading-relaxed"
                />
              </div>

              {/* Photo Upload Section matching Screen 4 */}
              <div className="pt-2">
                <div className="flex items-center gap-3 overflow-x-auto pb-2">
                  {/* Selected Photos List with rounded corners and circular X close icon */}
                  {selectedPhotos.map((photo) => (
                    <div
                      key={photo.id}
                      className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden shrink-0 border border-[#1A2846] shadow-md group"
                    >
                      <img
                        src={photo.url}
                        alt="Selected"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removePhoto(photo.id)}
                        className="absolute top-1.5 end-1.5 w-6 h-6 rounded-full bg-black/70 hover:bg-rose-600 text-white flex items-center justify-center transition shadow-md"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}

                  {/* Dashed "+ إضافة صور" Box matching Screen 4 */}
                  <div
                    onClick={() => setIsGalleryOpen(true)}
                    className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl border-2 border-dashed border-[#223358] hover:border-blue-500 bg-[#091124] shrink-0 flex flex-col items-center justify-center gap-2 cursor-pointer transition group"
                  >
                    <div className="w-9 h-9 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center group-hover:scale-110 transition border border-blue-500/30">
                      <Plus className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold text-slate-300 group-hover:text-blue-300">
                      إضافة صور
                    </span>
                  </div>
                </div>
              </div>

              {/* Action List Items matching Screen 4 */}
              <div className="pt-2 border-t border-[#1A2846] divide-y divide-[#1A2846]/60">
                {/* 1. إضافة موقع */}
                <div className="py-2.5">
                  <button
                    type="button"
                    onClick={() => setShowLocationInput(!showLocationInput)}
                    className="w-full flex items-center justify-between text-slate-200 hover:text-white transition"
                  >
                    <div className="flex items-center gap-3">
                      <MapPin className="w-4 h-4 text-rose-400" />
                      <span className="text-xs font-semibold">إضافة موقع</span>
                    </div>
                    <span className="text-[11px] text-blue-400">{location || 'تحديد'}</span>
                  </button>
                  {showLocationInput && (
                    <div className="mt-2 flex gap-2">
                      <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="أدخل المدينة أو المكان..."
                        className="flex-1 px-3 py-1.5 rounded-xl bg-[#0B1428] border border-[#1A2846] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  )}
                </div>

                {/* 2. تحديد الأصدقاء */}
                <div className="py-2.5">
                  <button
                    type="button"
                    onClick={() => setShowFriendsInput(!showFriendsInput)}
                    className="w-full flex items-center justify-between text-slate-200 hover:text-white transition"
                  >
                    <div className="flex items-center gap-3">
                      <Users className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs font-semibold">تحديد الأصدقاء</span>
                    </div>
                    <span className="text-[11px] text-blue-400">
                      {taggedFriends.length > 0 ? `${taggedFriends.length} أصدقاء` : 'إضافة'}
                    </span>
                  </button>
                  {showFriendsInput && (
                    <div className="mt-2 space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newFriend}
                          onChange={(e) => setNewFriend(e.target.value)}
                          placeholder="اسم الصديق..."
                          className="flex-1 px-3 py-1.5 rounded-xl bg-[#0B1428] border border-[#1A2846] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                        />
                        <button
                          type="button"
                          onClick={handleAddFriend}
                          className="px-3 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold"
                        >
                          إضافة
                        </button>
                      </div>
                      {taggedFriends.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {taggedFriends.map((friend) => (
                            <span
                              key={friend}
                              className="px-2 py-0.5 rounded-lg bg-blue-900/40 border border-blue-500/30 text-[10px] text-blue-300 flex items-center gap-1"
                            >
                              @{friend}
                              <button
                                type="button"
                                onClick={() =>
                                  setTaggedFriends(taggedFriends.filter((f) => f !== friend))
                                }
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* 3. إضافة وسم */}
                <div className="py-2.5">
                  <button
                    type="button"
                    onClick={() => setShowHashInput(!showHashInput)}
                    className="w-full flex items-center justify-between text-slate-200 hover:text-white transition"
                  >
                    <div className="flex items-center gap-3">
                      <Hash className="w-4 h-4 text-sky-400" />
                      <span className="text-xs font-semibold">إضافة وسم</span>
                    </div>
                    <span className="text-[11px] text-blue-400">
                      {hashtags.length > 0 ? `#${hashtags.join(' #')}` : 'وسوم'}
                    </span>
                  </button>
                  {showHashInput && (
                    <div className="mt-2 space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newTag}
                          onChange={(e) => setNewTag(e.target.value)}
                          placeholder="اسم الوسم..."
                          className="flex-1 px-3 py-1.5 rounded-xl bg-[#0B1428] border border-[#1A2846] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                        />
                        <button
                          type="button"
                          onClick={handleAddTag}
                          className="px-3 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold"
                        >
                          إضافة
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* 4. الخصوصية */}
                <div className="py-2.5">
                  <div
                    onClick={() =>
                      setPrivacy(
                        privacy === 'public'
                          ? 'followers'
                          : privacy === 'followers'
                          ? 'private'
                          : 'public'
                      )
                    }
                    className="w-full flex items-center justify-between text-slate-200 hover:text-white transition cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <Globe className="w-4 h-4 text-indigo-400" />
                      <span className="text-xs font-semibold">
                        {privacy === 'public'
                          ? 'العامة'
                          : privacy === 'followers'
                          ? 'المتابعون'
                          : 'خاص'}
                      </span>
                    </div>
                    {language === 'ar' ? (
                      <ChevronLeft className="w-4 h-4 text-slate-500" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-500" />
                    )}
                  </div>
                </div>
              </div>

              {/* Upload Progress Bar if submitting */}
              {isSubmitting && uploadProgress !== null && (
                <div className="pt-2">
                  <div className="flex justify-between text-[11px] text-blue-400 mb-1">
                    <span>جاري معالجة ورفع الصور...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#0B1428] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 transition-all duration-200"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Bottom Glowing Blue Action Button: "نشر" */}
              <div className="pt-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 rounded-2xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-sm shadow-[0_4px_20px_rgba(37,99,235,0.45)] transition active:scale-98 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>جاري النشر...</span>
                    </>
                  ) : (
                    <span>نشر</span>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </AnimatePresence>

      {/* Embedded Dedicated Gallery Picker Modal */}
      <GalleryPickerModal
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        onConfirm={handleAddPhotosFromGallery}
      />
    </>
  );
};
