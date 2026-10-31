import React, { useState } from 'react';
import { useSocial } from '../../context/SocialContext';
import { StoriesBar } from './StoriesBar';
import { CreatePostBox } from './CreatePostBox';
import { PostCard } from './PostCard';
import { Sparkles, Users, RefreshCw } from 'lucide-react';

export const FeedView: React.FC = () => {
  const { posts, users, currentUser, promotions, recordAdClick, showToast, t } = useSocial();
  const [feedMode, setFeedMode] = useState<'forYou' | 'following'>('forYou');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const activeAds = promotions.filter((p) => p.status === 'active');

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

      {/* Posts & Sponsored Stream */}
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
          displayedPosts.map((post, index) => (
            <React.Fragment key={post.id}>
              <PostCard post={post} />

              {/* Inject an approved Sponsored Ad after the 1st post */}
              {index === 0 && activeAds.length > 0 && (
                <div className="bg-[#0D162B] border border-blue-500/40 rounded-3xl p-5 shadow-lg relative overflow-hidden mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={activeAds[0].authorAvatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100'}
                        alt={activeAds[0].authorName}
                        className="w-10 h-10 rounded-full object-cover border-2 border-blue-500"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-white">{activeAds[0].authorName}</span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/40">
                            {t('sponsored')}
                          </span>
                        </div>
                        <span className="text-[10px] text-zinc-400">إعلان رسمي معتمد</span>
                      </div>
                    </div>
                  </div>

                  <h4 className="text-sm font-bold text-white mb-1.5">{activeAds[0].title}</h4>
                  <p className="text-xs text-zinc-300 leading-relaxed mb-3">
                    {activeAds[0].postContent || activeAds[0].description}
                  </p>

                  {activeAds[0].postMediaUrl && (
                    <div className="rounded-2xl overflow-hidden mb-3 aspect-video border border-[#1A2846]">
                      <img
                        src={activeAds[0].postMediaUrl}
                        alt="Sponsored media"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-[#1A2846]">
                    <span className="text-[11px] text-zinc-400">
                      استهداف: {activeAds[0].targetAudience}
                    </span>
                    <button
                      onClick={() => {
                        recordAdClick(activeAds[0].id);
                        showToast('تم تسجيل نقرة الإعلان بنجاح!');
                      }}
                      className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition active:scale-95"
                    >
                      {t('learnMore')}
                    </button>
                  </div>
                </div>
              )}
            </React.Fragment>
          ))
        )}
      </div>
    </div>
  );
};
