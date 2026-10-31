import React, { useState } from 'react';
import { useSocial } from '../../context/SocialContext';
import {
  Search,
  TrendingUp,
  Hash,
  User as UserIcon,
  Image as ImageIcon,
  Check,
  UserPlus,
  Sparkles,
  SlidersHorizontal,
} from 'lucide-react';
import { PostCard } from '../feed/PostCard';
import { User } from '../../types';

export const ExploreView: React.FC = () => {
  const {
    posts,
    users,
    hashtags,
    searchQuery,
    setSearchQuery,
    toggleFollowUser,
    setSelectedUserProfile,
    setActiveTab,
    setSelectedPost,
    t,
  } = useSocial();

  const [activeFilter, setActiveFilter] = useState<'all' | 'people' | 'tags' | 'media'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: '🌟 الكل' },
    { id: 'tech', label: '💻 التقنية والبرمجة' },
    { id: 'ai', label: '🤖 الذكاء الاصطناعي' },
    { id: 'design', label: '🎨 التصميم والفنون' },
    { id: 'gaming', label: '🎮 الألعاب' },
    { id: 'sports', label: '⚽ الرياضة' },
  ];

  // Filtering
  const cleanSearch = searchQuery.toLowerCase().trim().replace(/^#/, '');

  const filteredPosts = posts.filter((p) => {
    if (!cleanSearch) return true;
    const matchesContent = p.content.toLowerCase().includes(cleanSearch);
    const matchesAuthor =
      p.author.name.toLowerCase().includes(cleanSearch) ||
      p.author.username.toLowerCase().includes(cleanSearch);
    const matchesTags = p.hashtags.some((tag) => tag.toLowerCase().includes(cleanSearch));
    return matchesContent || matchesAuthor || matchesTags;
  });

  const filteredUsers = users.filter((u) => {
    if (!cleanSearch) return true;
    return (
      u.name.toLowerCase().includes(cleanSearch) ||
      u.username.toLowerCase().includes(cleanSearch) ||
      u.bio.toLowerCase().includes(cleanSearch)
    );
  });

  const filteredHashtags = hashtags.filter((h) => {
    if (selectedCategory !== 'all' && h.category !== selectedCategory) return false;
    if (!cleanSearch) return true;
    return h.tag.toLowerCase().includes(cleanSearch);
  });

  const mediaPosts = posts.filter((p) => p.media && p.media.length > 0);

  const handleUserClick = (user: User) => {
    setSelectedUserProfile(user);
    setActiveTab('profile');
  };

  return (
    <div className="space-y-5" id="explore-view">
      {/* Search Input on Mobile/Header */}
      <div className="relative block sm:hidden">
        <Search className="w-4 h-4 text-slate-400 absolute start-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t('search')}
          className="w-full ps-10 pe-4 py-2 text-xs bg-white dark:bg-[#070D1E] border border-slate-200 dark:border-[#1A2846] rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition active:scale-95 ${
              selectedCategory === cat.id
                ? 'bg-blue-600 text-white shadow-[0_2px_10px_rgba(37,99,235,0.4)]'
                : 'bg-white dark:bg-[#070D1E] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-[#1A2846] hover:bg-slate-100 dark:hover:bg-[#0D162B]'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Filter Tabs (All, People, Tags, Media) */}
      <div className="flex items-center gap-1 p-1 bg-zinc-100 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
        <button
          onClick={() => setActiveFilter('all')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${
            activeFilter === 'all'
              ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs'
              : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
        >
          {t('all')}
        </button>
        <button
          onClick={() => setActiveFilter('people')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${
            activeFilter === 'people'
              ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs'
              : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
        >
          {t('people')}
        </button>
        <button
          onClick={() => setActiveFilter('tags')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${
            activeFilter === 'tags'
              ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs'
              : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
        >
          {t('tags')}
        </button>
        <button
          onClick={() => setActiveFilter('media')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${
            activeFilter === 'media'
              ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs'
              : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
        >
          {t('media')}
        </button>
      </div>

      {/* Content Rendering based on filter */}
      {activeFilter === 'people' && (
        <div className="bg-white dark:bg-[#121215] rounded-2xl p-4 sm:p-5 border border-zinc-200 dark:border-zinc-800 space-y-3">
          <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <UserIcon className="w-3.5 h-3.5 text-zinc-500" />
            <span>المستخدمون ({filteredUsers.length})</span>
          </h3>

          <div className="space-y-2">
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between gap-3 p-2.5 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-900/60 transition"
              >
                <div
                  onClick={() => handleUserClick(user)}
                  className="flex items-center gap-3 cursor-pointer min-w-0 flex-1"
                >
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="w-10 h-10 rounded-xl object-cover shrink-0 border border-zinc-200 dark:border-zinc-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                        {user.name}
                      </h4>
                      {user.isVerified && (
                        <Sparkles className="w-3 h-3 text-zinc-400 shrink-0" />
                      )}
                    </div>
                    <p className="text-[11px] text-zinc-400">@{user.username}</p>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5 line-clamp-1">
                      {user.bio}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => toggleFollowUser(user.id)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition shrink-0 ${
                    user.isFollowing
                      ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                      : 'bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-white text-white dark:text-zinc-900 shadow-xs'
                  }`}
                >
                  {user.isFollowing ? t('following') : t('follow')}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeFilter === 'tags' && (
        <div className="bg-white dark:bg-[#121215] rounded-2xl p-4 sm:p-5 border border-zinc-200 dark:border-zinc-800 space-y-3">
          <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <TrendingUp className="w-3.5 h-3.5 text-zinc-500" />
            <span>الهاشتاغات الرائجة</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {filteredHashtags.map((ht, idx) => (
              <div
                key={ht.id}
                onClick={() => setSearchQuery(`#${ht.tag}`)}
                className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 hover:bg-zinc-100 dark:hover:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 cursor-pointer transition flex items-center justify-between"
              >
                <div>
                  <span className="text-[10px] font-semibold text-zinc-400">
                    #{idx + 1} · {ht.category}
                  </span>
                  <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">
                    #{ht.tag}
                  </h4>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    {t('postsNumber', { count: ht.postsCount.toLocaleString() })}
                  </p>
                </div>
                <Hash className="w-4 h-4 text-zinc-400" />
              </div>
            ))}
          </div>
        </div>
      )}

      {activeFilter === 'media' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {mediaPosts.map((post) =>
            post.media?.map((m, i) => (
              <div
                key={`${post.id}-${i}`}
                onClick={() => setSelectedPost(post)}
                className="relative aspect-square rounded-xl overflow-hidden cursor-pointer group bg-zinc-950 border border-zinc-200 dark:border-zinc-800"
              >
                <img
                  src={m.url}
                  alt="Explore media"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 text-white text-xs font-bold">
                  <span>❤️ {post.likesCount}</span>
                  <span>💬 {post.commentsCount}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeFilter === 'all' && (
        <div className="space-y-4">
          {/* Trending Highlight Banner */}
          {!searchQuery && (
            <div className="bg-zinc-900 dark:bg-[#121215] border border-zinc-800 rounded-2xl p-5 text-white shadow-sm relative overflow-hidden">
              <div className="relative z-10 max-w-md">
                <span className="inline-block px-2.5 py-0.5 bg-zinc-800 border border-zinc-700 text-zinc-300 rounded-md text-[11px] font-semibold mb-2">
                  استكشف Zorvexa
                </span>
                <h2 className="text-base sm:text-lg font-bold mb-1.5 leading-tight text-white">
                  فضاء الإبداع والتواصل الرقمي
                </h2>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  تابع أبرز المبرمجين والمصممين وصناع المحتوى، وشارك تجاربك مع مجتمعك.
                </p>
              </div>
            </div>
          )}

          {/* Posts matching search or trending */}
          {filteredPosts.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-[#121215] rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6">
              <p className="text-xs font-semibold text-zinc-500">
                {t('noSearchResults', { query: searchQuery })}
              </p>
            </div>
          ) : (
            filteredPosts.map((post) => <PostCard key={post.id} post={post} />)
          )}
        </div>
      )}
    </div>
  );
};
