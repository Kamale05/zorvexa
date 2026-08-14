import React, { useState } from 'react';
import { useSocial } from '../../context/SocialContext';
import { StoriesBar } from './StoriesBar';
import { CreatePostBox } from './CreatePostBox';
import { PostCard } from './PostCard';
import { Sparkles, Users, RefreshCw } from 'lucide-react';

export const FeedView: React.FC = () => {
  const { posts, users, currentUser, showToast, t } = useSocial();
  const [feedMode, setFeedMode] = useState<'forYou' | 'following'>('forYou');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filter posts based on feedMode
  const displayedPosts = posts.filter((post) => {
    if (feedMode === 'following') {
      const author = users.find((u) => u.id === post.authorId);
      return author?.isFollowing || post.authorId === currentUser?.id;
    }
    return true;
  });

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      showToast('تم تحديث آخر المنشورات بنجاح');
    }, 600);
  };

  return (
    <div className="space-y-4" id="feed-view">
      {/* 24-hour Stories Bar */}
      <StoriesBar />

      {/* Main Create Post Box */}
      <CreatePostBox />

      {/* Feed Filter Switcher (For You / Following) */}
      <div className="flex items-center justify-between bg-white dark:bg-[#121215] p-1.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div className="flex items-center gap-1 flex-1">
          <button
            onClick={() => setFeedMode('forYou')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 transition ${
              feedMode === 'forYou'
                ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-sm'
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t('forYou')}</span>
          </button>

          <button
            onClick={() => setFeedMode('following')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 transition ${
              feedMode === 'following'
                ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-sm'
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>{t('followingFeed')}</span>
          </button>
        </div>

        <button
          onClick={handleRefresh}
          className={`p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition ${
            isRefreshing ? 'animate-spin text-zinc-900 dark:text-zinc-100' : ''
          }`}
          title="تحديث الخلاصات"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Posts Stream */}
      <div className="space-y-4">
        {displayedPosts.length === 0 ? (
          <div className="bg-white dark:bg-[#121215] rounded-2xl p-8 border border-zinc-200 dark:border-zinc-800 text-center space-y-3 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 mx-auto flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              {feedMode === 'following'
                ? 'لا توجد منشورات من الأشخاص الذين تتابعهم بعد'
                : t('noPostsYet')}
            </h3>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto leading-relaxed">
              {feedMode === 'following'
                ? 'انتقل إلى تبويب "استكشاف" لمتابعة مبدعين ومشاركين جدد ومشاهدة منشوراتهم هنا في خلاصتك.'
                : 'كن أول من يشارك فكرة جديدة أو صورة مع المجتمع اليوم!'}
            </p>
          </div>
        ) : (
          displayedPosts.map((post) => <PostCard key={post.id} post={post} />)
        )}
      </div>
    </div>
  );
};
