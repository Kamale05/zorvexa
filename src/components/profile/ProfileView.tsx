import React, { useState } from 'react';
import { useSocial } from '../../context/SocialContext';
import {
  MapPin,
  Link as LinkIcon,
  Calendar,
  Sparkles,
  Edit3,
  UserPlus,
  Check,
  MessageSquare,
  Share2,
  Grid,
  Heart,
  Bookmark,
  Image as ImageIcon,
  SlidersHorizontal,
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
    startOrOpenConversationWith,
    showToast,
    setSelectedPost,
    t,
  } = useSocial();

  const user: User = selectedUserProfile || currentUser!;
  const isOwnProfile = !selectedUserProfile || selectedUserProfile.id === currentUser?.id;

  const [activeTab, setActiveTabState] = useState<'posts' | 'media' | 'likes' | 'saved'>('posts');
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [followersModalType, setFollowersModalType] = useState<'followers' | 'following' | null>(null);

  if (!user) {
    return (
      <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
        <p className="text-sm font-semibold text-slate-500">يرجى تسجيل الدخول لعرض ملفك الشخصي</p>
      </div>
    );
  }

  // Filter content tabs
  const userPosts = posts.filter((p) => p.authorId === user.id);
  const userMediaPosts = userPosts.filter((p) => p.media && p.media.length > 0);
  const userLikedPosts = posts.filter((p) => p.isLiked);
  const userSavedPosts = posts.filter((p) => p.isSaved);

  const handleShareProfile = () => {
    const profileUrl = `${window.location.origin}/#profile-${user.username}`;
    navigator.clipboard.writeText(profileUrl);
    showToast('تم نسخ رابط الملف الشخصي!');
  };

  return (
    <div className="space-y-4" id="profile-view">
      {/* Profile Header Card */}
      <div className="bg-white dark:bg-[#121215] rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden transition-colors">
        {/* Cover Photo */}
        <div className="h-36 sm:h-48 w-full relative bg-zinc-800">
          {user.coverUrl ? (
            <img src={user.coverUrl} alt="Cover" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-zinc-800 to-zinc-900" />
          )}
        </div>

        {/* Avatar & Action Row */}
        <div className="px-4 sm:px-6 pb-5 relative">
          <div className="flex items-end justify-between -mt-12 sm:-mt-16 mb-3">
            {/* Avatar */}
            <div className="relative">
              <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-2xl overflow-hidden ring-4 ring-white dark:ring-[#121215] shadow-md bg-zinc-100 dark:bg-zinc-800">
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              {user.isOnline && (
                <span className="absolute bottom-1 end-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-zinc-900 rounded-full" />
              )}
            </div>

            {/* Profile Action Buttons */}
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={handleShareProfile}
                className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition"
                title="مشاركة الملف"
              >
                <Share2 className="w-4 h-4" />
              </button>

              {isOwnProfile ? (
                <button
                  onClick={() => setIsEditOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-white text-xs font-semibold transition shadow-xs"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>{t('editProfile')}</span>
                </button>
              ) : (
                <>
                  <button
                    onClick={() => startOrOpenConversationWith(user)}
                    className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition"
                    title={t('messages')}
                  >
                    <MessageSquare className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => toggleFollowUser(user.id)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition ${
                      user.isFollowing
                        ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-200'
                        : 'bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-white text-white dark:text-zinc-900 shadow-xs'
                    }`}
                  >
                    {user.isFollowing ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        <span>{t('following')}</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>{t('follow')}</span>
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* User Details */}
          <div className="space-y-2">
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-100">
                  {user.name}
                </h2>
                {user.isVerified && (
                  <Sparkles className="w-4 h-4 text-zinc-400 shrink-0" />
                )}
              </div>
              <p className="text-xs text-zinc-400 font-medium">@{user.username}</p>
            </div>

            {/* Bio */}
            {user.bio && (
              <p className="text-xs sm:text-sm text-zinc-800 dark:text-zinc-300 leading-relaxed max-w-2xl whitespace-pre-line">
                {user.bio}
              </p>
            )}

            {/* Meta tags: Location, Link, Joined date */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-zinc-500 dark:text-zinc-400 pt-0.5">
              {user.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                  <span>{user.location}</span>
                </div>
              )}
              {user.website && (
                <a
                  href={user.website}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-zinc-800 dark:text-zinc-200 hover:underline"
                >
                  <LinkIcon className="w-3.5 h-3.5" />
                  <span>{user.website.replace(/^https?:\/\//, '')}</span>
                </a>
              )}
              <div className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>{t('joined', { date: user.joinedDate })}</span>
              </div>
            </div>

            {/* Stats (Followers / Following / Posts Count) */}
            <div className="flex items-center gap-5 pt-2.5 border-t border-zinc-100 dark:border-zinc-800/80">
              <button
                onClick={() => setFollowersModalType('following')}
                className="flex items-center gap-1 hover:underline"
              >
                <strong className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                  {user.followingCount}
                </strong>
                <span className="text-xs text-zinc-400">{t('followingCount')}</span>
              </button>

              <button
                onClick={() => setFollowersModalType('followers')}
                className="flex items-center gap-1 hover:underline"
              >
                <strong className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                  {user.followersCount.toLocaleString()}
                </strong>
                <span className="text-xs text-zinc-400">{t('followers')}</span>
              </button>

              <div className="flex items-center gap-1">
                <strong className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                  {userPosts.length}
                </strong>
                <span className="text-xs text-zinc-400">{t('postsTab')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Tabs Navigation */}
        <div className="flex border-t border-zinc-200 dark:border-zinc-800 px-3 bg-zinc-50/50 dark:bg-zinc-900/30">
          <button
            onClick={() => setActiveTabState('posts')}
            className={`flex-1 py-2.5 text-xs font-semibold flex items-center justify-center gap-1.5 border-b-2 transition ${
              activeTab === 'posts'
                ? 'border-zinc-900 dark:border-zinc-100 text-zinc-900 dark:text-zinc-100'
                : 'border-transparent text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            <span>{t('postsTab')}</span>
          </button>

          <button
            onClick={() => setActiveTabState('media')}
            className={`flex-1 py-2.5 text-xs font-semibold flex items-center justify-center gap-1.5 border-b-2 transition ${
              activeTab === 'media'
                ? 'border-zinc-900 dark:border-zinc-100 text-zinc-900 dark:text-zinc-100'
                : 'border-transparent text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>{t('mediaTab')}</span>
          </button>

          <button
            onClick={() => setActiveTabState('likes')}
            className={`flex-1 py-2.5 text-xs font-semibold flex items-center justify-center gap-1.5 border-b-2 transition ${
              activeTab === 'likes'
                ? 'border-zinc-900 dark:border-zinc-100 text-zinc-900 dark:text-zinc-100'
                : 'border-transparent text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
            }`}
          >
            <Heart className="w-3.5 h-3.5" />
            <span>{t('likesTab')}</span>
          </button>

          {isOwnProfile && (
            <button
              onClick={() => setActiveTabState('saved')}
              className={`flex-1 py-2.5 text-xs font-semibold flex items-center justify-center gap-1.5 border-b-2 transition ${
                activeTab === 'saved'
                  ? 'border-zinc-900 dark:border-zinc-100 text-zinc-900 dark:text-zinc-100'
                  : 'border-transparent text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>{t('savedTab')}</span>
            </button>
          )}
        </div>
      </div>

      {/* Tab Contents */}
      <div className="space-y-4">
        {activeTab === 'posts' && (
          <div>
            {userPosts.length === 0 ? (
              <div className="p-8 text-center bg-white dark:bg-[#121215] rounded-2xl border border-zinc-200 dark:border-zinc-800 text-zinc-400 text-xs">
                {t('noPostsYet')}
              </div>
            ) : (
              userPosts.map((post) => <PostCard key={post.id} post={post} />)
            )}
          </div>
        )}

        {activeTab === 'media' && (
          <div>
            {userMediaPosts.length === 0 ? (
              <div className="p-8 text-center bg-white dark:bg-[#121215] rounded-2xl border border-zinc-200 dark:border-zinc-800 text-zinc-400 text-xs">
                لا توجد وسائط منشورة بعد
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {userMediaPosts.map((post) =>
                  post.media?.map((m, i) => (
                    <div
                      key={`${post.id}-${i}`}
                      onClick={() => setSelectedPost(post)}
                      className="aspect-square rounded-xl overflow-hidden cursor-pointer group relative bg-zinc-950 border border-zinc-200 dark:border-zinc-800"
                    >
                      <img
                        src={m.url}
                        alt="User Media"
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'likes' && (
          <div>
            {userLikedPosts.length === 0 ? (
              <div className="p-8 text-center bg-white dark:bg-[#121215] rounded-2xl border border-zinc-200 dark:border-zinc-800 text-zinc-400 text-xs">
                لا توجد إعجابات بعد
              </div>
            ) : (
              userLikedPosts.map((post) => <PostCard key={post.id} post={post} />)
            )}
          </div>
        )}

        {activeTab === 'saved' && (
          <div>
            {userSavedPosts.length === 0 ? (
              <div className="p-8 text-center bg-white dark:bg-[#121215] rounded-2xl border border-zinc-200 dark:border-zinc-800 text-zinc-400 text-xs">
                لا توجد عناصر محفوظة في القائمة
              </div>
            ) : (
              userSavedPosts.map((post) => <PostCard key={post.id} post={post} />)
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      <EditProfileModal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} />
      {followersModalType && (
        <FollowersModal
          isOpen={true}
          type={followersModalType}
          user={user}
          onClose={() => setFollowersModalType(null)}
        />
      )}
    </div>
  );
};
