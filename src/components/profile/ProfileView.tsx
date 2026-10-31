import React, { useState } from 'react';
import { useSocial } from '../../context/SocialContext';
import {
  MapPin,
  Settings,
  Grid,
  Image as ImageIcon,
  Video,
  Heart,
  Edit3,
  UserPlus,
  Check,
  Share2,
  LogOut,
  Flame,
} from 'lucide-react';
import { PostCard } from '../feed/PostCard';
import { EditProfileModal } from './EditProfileModal';
import { FollowersModal } from './FollowersModal';
import { User } from '../../types';

export const ProfileView: React.FC = () => {
  const {
    currentUser,
    selectedUserProfile,
    posts,
    toggleFollowUser,
    showToast,
    setSelectedPost,
    setActiveTab,
    requestLogout,
    t,
  } = useSocial();

  const user: User = selectedUserProfile || currentUser!;
  const isOwnProfile = !selectedUserProfile || selectedUserProfile.id === currentUser?.id;

  const [activeSubTab, setActiveSubTab] = useState<'posts' | 'photos' | 'videos' | 'likes'>('posts');
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [followersModalType, setFollowersModalType] = useState<'followers' | 'following' | null>(null);

  if (!user) {
    return (
      <div className="p-8 text-center bg-white dark:bg-[#070D1E] rounded-3xl border border-slate-200 dark:border-[#1A2846]">
        <p className="text-sm font-semibold text-slate-400">يرجى تسجيل الدخول لعرض ملفك الشخصي</p>
      </div>
    );
  }

  // Filter user posts
  const userPosts = posts.filter((p) => p.authorId === user.id);
  const userMediaPosts = userPosts.filter((p) => p.media && p.media.length > 0);
  const userLikedPosts = posts.filter((p) => p.isLiked);

  // Extract all single media items for grid
  const allUserPhotos = userMediaPosts.flatMap((p) =>
    (p.media || []).map((m) => ({ ...m, postId: p.id, post: p }))
  );

  const handleShareProfile = () => {
    const profileUrl = `${window.location.origin}/#profile-${user.username}`;
    navigator.clipboard.writeText(profileUrl);
    showToast('تم نسخ رابط الملف الشخصي!');
  };

  return (
    <div className="space-y-4" id="profile-view">
      {/* Profile Card matching Screen 5 */}
      <div className="bg-white dark:bg-[#070D1E] rounded-3xl border border-slate-200 dark:border-[#1A2846] shadow-sm overflow-hidden transition-colors">
        {/* Cover Photo */}
        <div className="h-44 sm:h-52 w-full relative bg-slate-900">
          <img
            src={
              user.coverUrl ||
              'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&auto=format&fit=crop&q=80'
            }
            alt="Cover"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        </div>

        {/* Profile Details Container */}
        <div className="px-5 pb-6 text-center relative">
          {/* Centered Circular Avatar with blue verified checkmark badge matching Screen 5 */}
          <div className="flex flex-col items-center -mt-16 sm:-mt-20 mb-3">
            <div className="relative">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden ring-4 ring-[#070D1E] shadow-xl bg-slate-900">
                <img
                  src={
                    user.avatarUrl ||
                    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80'
                  }
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Verified Blue Badge */}
              <div className="absolute bottom-1 end-1 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center border-2 border-[#070D1E] shadow-md">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
            </div>

            {/* Name & Handle */}
            <div className="mt-3">
              <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center justify-center gap-1.5">
                <span>{user.name}</span>
                <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">
                  ✓
                </span>
              </h2>
              <p className="text-xs font-semibold text-slate-400 mt-0.5">
                @{user.username}
              </p>
            </div>
          </div>

          {/* Stats Bar matching Screen 5: [37 منشورات] [1.2K متابع] [254 متابعون] */}
          <div className="flex items-center justify-center gap-8 sm:gap-12 py-3 border-y border-slate-100 dark:border-[#1A2846]/70 my-3">
            <div className="text-center cursor-pointer">
              <span className="block text-base sm:text-lg font-black text-slate-900 dark:text-white">
                {user.postsCount || userPosts.length}
              </span>
              <span className="text-[11px] font-medium text-slate-400">منشورات</span>
            </div>

            <div
              onClick={() => setFollowersModalType('followers')}
              className="text-center cursor-pointer hover:opacity-80 transition"
            >
              <span className="block text-base sm:text-lg font-black text-slate-900 dark:text-white">
                {user.followersCount > 999
                  ? `${(user.followersCount / 1000).toFixed(1)}K`
                  : user.followersCount}
              </span>
              <span className="text-[11px] font-medium text-slate-400">متابع</span>
            </div>

            <div
              onClick={() => setFollowersModalType('following')}
              className="text-center cursor-pointer hover:opacity-80 transition"
            >
              <span className="block text-base sm:text-lg font-black text-slate-900 dark:text-white">
                {user.followingCount}
              </span>
              <span className="text-[11px] font-medium text-slate-400">متابعون</span>
            </div>
          </div>

          {/* Bio with emojis matching Screen 5 */}
          <div className="py-2 max-w-md mx-auto text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
            <p className="font-medium">
              {user.bio || 'الحياة أجمل مع الأصدقاء 🔥\nالجزائر 📍'}
            </p>
          </div>

          {/* Buttons Row matching Screen 5 */}
          <div className="flex items-center justify-center gap-2.5 pt-3">
            {isOwnProfile ? (
              <>
                {/* تعديل الملف الشخصي */}
                <button
                  onClick={() => setIsEditOpen(true)}
                  className="py-2 px-6 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-[0_4px_16px_rgba(37,99,235,0.4)] transition active:scale-95 flex items-center gap-1.5"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>تعديل الملف الشخصي</span>
                </button>

                {/* Settings Gear Icon */}
                <button
                  onClick={() => setActiveTab('settings')}
                  className="p-2.5 rounded-2xl bg-slate-100 dark:bg-[#0D162B] text-slate-600 dark:text-slate-300 hover:text-white border border-slate-200 dark:border-[#1A2846] transition"
                  title="الإعدادات"
                >
                  <Settings className="w-4 h-4" />
                </button>

                {/* Share Profile */}
                <button
                  onClick={handleShareProfile}
                  className="p-2.5 rounded-2xl bg-slate-100 dark:bg-[#0D162B] text-slate-600 dark:text-slate-300 hover:text-white border border-slate-200 dark:border-[#1A2846] transition"
                  title="مشاركة الملف"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => toggleFollowUser(user.id)}
                  className={`py-2 px-6 rounded-2xl font-bold text-xs shadow-md transition active:scale-95 flex items-center gap-1.5 ${
                    user.isFollowing
                      ? 'bg-slate-200 dark:bg-[#0D162B] text-slate-800 dark:text-white border border-[#1A2846]'
                      : 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_4px_16px_rgba(37,99,235,0.4)]'
                  }`}
                >
                  {user.isFollowing ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>{t('following')}</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>{t('follow')}</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleShareProfile}
                  className="p-2.5 rounded-2xl bg-slate-100 dark:bg-[#0D162B] text-slate-600 dark:text-slate-300 hover:text-white border border-slate-200 dark:border-[#1A2846] transition"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Sub-Tabs matching Screen 5: [المنشورات] [الصور] [المقاطع] [الإعجابات] */}
        <div className="flex border-t border-slate-200 dark:border-[#1A2846] bg-slate-50/50 dark:bg-[#091124]">
          <button
            onClick={() => setActiveSubTab('posts')}
            className={`flex-1 py-3 text-xs font-bold text-center border-b-2 transition ${
              activeSubTab === 'posts'
                ? 'border-blue-500 text-blue-500'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            المنشورات
          </button>

          <button
            onClick={() => setActiveSubTab('photos')}
            className={`flex-1 py-3 text-xs font-bold text-center border-b-2 transition ${
              activeSubTab === 'photos'
                ? 'border-blue-500 text-blue-500'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            الصور
          </button>

          <button
            onClick={() => setActiveSubTab('videos')}
            className={`flex-1 py-3 text-xs font-bold text-center border-b-2 transition ${
              activeSubTab === 'videos'
                ? 'border-blue-500 text-blue-500'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            المقاطع
          </button>

          <button
            onClick={() => setActiveSubTab('likes')}
            className={`flex-1 py-3 text-xs font-bold text-center border-b-2 transition ${
              activeSubTab === 'likes'
                ? 'border-blue-500 text-blue-500'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            الإعجابات
          </button>
        </div>
      </div>

      {/* Content depending on activeSubTab */}
      {activeSubTab === 'posts' && (
        <div className="space-y-4">
          {userPosts.length === 0 ? (
            <div className="bg-white dark:bg-[#070D1E] rounded-3xl p-8 border border-slate-200 dark:border-[#1A2846] text-center">
              <p className="text-xs text-slate-400">لا توجد منشورات حتى الآن</p>
            </div>
          ) : (
            userPosts.map((post) => <PostCard key={post.id} post={post} />)
          )}
        </div>
      )}

      {activeSubTab === 'photos' && (
        <div className="bg-white dark:bg-[#070D1E] rounded-3xl p-4 border border-slate-200 dark:border-[#1A2846]">
          {allUserPhotos.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              لا توجد صور منشورة بعد
            </div>
          ) : (
            /* 3-Column Photo Grid matching Screen 5 */
            <div className="grid grid-cols-3 gap-2">
              {allUserPhotos.map((photo, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedPost(photo.post)}
                  className="aspect-square rounded-xl overflow-hidden cursor-pointer hover:opacity-90 transition border border-transparent dark:border-[#1A2846]"
                >
                  <img
                    src={photo.url}
                    alt="User photo"
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeSubTab === 'videos' && (
        <div className="bg-white dark:bg-[#070D1E] rounded-3xl p-8 border border-slate-200 dark:border-[#1A2846] text-center text-xs text-slate-400">
          لا توجد مقاطع فيديو منشورة بعد
        </div>
      )}

      {activeSubTab === 'likes' && (
        <div className="space-y-4">
          {userLikedPosts.length === 0 ? (
            <div className="bg-white dark:bg-[#070D1E] rounded-3xl p-8 border border-slate-200 dark:border-[#1A2846] text-center text-xs text-slate-400">
              لا توجد إعجابات حتى الآن
            </div>
          ) : (
            userLikedPosts.map((post) => <PostCard key={post.id} post={post} />)
          )}
        </div>
      )}

      {/* Edit Profile Modal */}
      {isEditOpen && <EditProfileModal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} />}

      {/* Followers Modal */}
      {followersModalType && (
        <FollowersModal
          isOpen={!!followersModalType}
          type={followersModalType}
          user={user}
          onClose={() => setFollowersModalType(null)}
        />
      )}
    </div>
  );
};
